<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryStock;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\ProgramBeneficiaryItem;
use Illuminate\Support\Facades\Validator;

class InventoryStockController extends Controller
{
    /**
     * Display a listing of the inventory stocks.
     */
   public function index()
{
    $inventories = Inventory::with('stocks')->get();

    $data = $inventories->map(function ($inv) {
        $availability = app(InventoryStockController::class)->getAvailableInventory($inv->id);

        return [
            'id' => $inv->id,
            'item_name' => $inv->item_name,
            'unit' => $inv->unit,
            'unit_value' => $inv->unit_value,
            'item_type' => $inv->item_type,
            'assistance_category' => $inv->assistance_category,
            'is_trackable_stock' => $inv->is_trackable_stock,
            'on_hand' => $availability['on_hand'],
            'reserved' => $availability['reserved'],
            'available' => $availability['available'],
        ];
    });

    return response()->json($data);
}

    /**
     * Store a new inventory stock transaction.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return response()->json(['error' => 'Admins cannot create stock transactions'], 403);
        }

        $validator = Validator::make($request->all(), [
            'inventory_id'      => 'required|exists:inventories,id',
            'quantity'          => 'required|numeric|min:0.01',
            'movement_type'     => 'required|in:stock_in,stock_out,adjustment,transfer,distribution',
            'transaction_type'  => 'required|in:purchase,grant,return,distribution,damage,expired,transfer_in,transfer_out,adjustment,initial_stock',
            'unit_cost'         => 'nullable|numeric|min:0',
            'transaction_date'  => 'required|date',
            'reference'         => 'nullable|string|max:255',
            'source'            => 'nullable|string|max:255',
            'destination'       => 'nullable|string|max:255',
            'batch_number'      => 'nullable|string|max:100',
            'expiry_date'       => 'nullable|date',
            'remarks'           => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $unitCost = $request->unit_cost ?? 0;
        $totalValue = $unitCost * $request->quantity;

        // Lock last transaction for consistency
        $lastTransaction = InventoryStock::where('inventory_id', $request->inventory_id)
            ->latest('id')
            ->lockForUpdate()
            ->first();
        $lastBalance = $lastTransaction ? $lastTransaction->running_balance : 0;

        $newBalance = $lastBalance;
        $reservedQuantity = 0;

        if (in_array($request->movement_type, ['stock_in', 'grant', 'return', 'transfer_in', 'initial_stock'])) {
            $newBalance += $request->quantity;
        } elseif (in_array($request->movement_type, ['stock_out', 'distribution', 'damage', 'expired', 'transfer_out'])) {
            // For now we *reserve* instead of deducting balance immediately if status is pending
            $reservedQuantity = $request->quantity;
        } elseif ($request->movement_type === 'adjustment') {
            $newBalance += $request->quantity;
        }

        // Create transaction
        $stock = InventoryStock::create([
            'inventory_id'      => $request->inventory_id,
            'quantity'          => $request->quantity,
            'movement_type'     => $request->movement_type,
            'transaction_type'  => $request->transaction_type,
            'unit_cost'         => $unitCost,
            'total_value'       => $totalValue,
            'running_balance'   => $newBalance,
            'reserved_quantity' => $reservedQuantity,
            'reference'         => $request->reference,
            'source'            => $request->source,
            'destination'       => $request->destination,
            'date_received'     => $request->date_received,
            'transaction_date'  => $request->transaction_date,
            'batch_number'      => $request->batch_number,
            'expiry_date'       => $request->expiry_date,
            'remarks'           => $request->remarks,
            'status'            => 'pending', // default pending, will be approved later
            'is_verified'       => false,
            'transacted_by'     => $user->id,
        ]);

        $stock->load(['inventory', 'transactor', 'verifiedBy']);

        return response()->json([
            'message' => 'Stock transaction created successfully (pending approval).',
            'data' => $stock
        ], 201);
    }

    /**
     * Display the specified stock record.
     */
    public function show(string $id)
    {
        $user = Auth::user();

        $stock = InventoryStock::with([
            'inventory',
            'transactor:id,fname,mname,lname,extension_name,email,username',
            'verifiedBy:id,fname,mname,lname,extension_name,email,username'
        ])->findOrFail($id);

        if ($user->role !== 'admin' && $stock->transacted_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($stock, 200);
    }

    /**
     * Update a stock transaction.
     */
    public function update(Request $request, string $id)
    {
        $user = Auth::user();
        $stock = InventoryStock::findOrFail($id);

        if ($user->role !== 'admin' && $stock->transacted_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $stock->update($request->only([
            'quantity', 'movement_type', 'transaction_type',
            'unit_cost', 'total_value', 'reference',
            'source', 'destination', 'date_received',
            'transaction_date', 'batch_number', 'expiry_date',
            'remarks', 'status', 'is_verified'
        ]));

        $stock->load(['inventory', 'transactor', 'verifiedBy']);

        return response()->json([
            'message' => 'Stock transaction updated successfully.',
            'data' => $stock
        ], 200);
    }

    /**
     * Remove the specified stock record.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        $stock = InventoryStock::findOrFail($id);

        if ($user->role !== 'admin' && $stock->transacted_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $stock->delete();

        return response()->json([
            'message' => 'Stock transaction deleted successfully.'
        ], 200);
    }

    /**
     * Get available inventory across all items (committed - reserved).
     */
public function getAvailableInventory(int $inventoryId): array
{
    // Current stock on hand (latest running balance)
    $runningBalance = InventoryStock::where('inventory_id', $inventoryId)
        ->latest('id')
        ->value('running_balance') ?? 0;

    // Reserved stock = items in programs that are not cancelled/rejected/completed
    $reserved = DB::table('program_beneficiary_items as items')
        ->join('program_beneficiaries as b', 'items.program_beneficiary_id', '=', 'b.id')
        ->join('subsidy_programs as p', 'b.subsidy_program_id', '=', 'p.id') 
        ->where('items.inventory_id', $inventoryId)
        ->whereIn('p.approval_status', ['pending', 'approved'])   
        ->whereIn('p.status', ['pending', 'ongoing'])             
        ->sum('items.quantity');

    // Calculate available = on-hand minus reserved
    $available = max($runningBalance - $reserved, 0);

    return [
        'inventory_id' => $inventoryId,
        'on_hand'      => $runningBalance,
        'reserved'     => $reserved,
        'available'    => $available,
    ];
}

}
