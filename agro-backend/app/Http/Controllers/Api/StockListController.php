<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryStock;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class StockListController extends Controller
{
    /**
     * Display a listing of the stock records with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $query = InventoryStock::with([
                'inventory:id,item_name,unit,unit_value',
                'transactor:id,fname,mname,lname,extension_name,email,username',
                'verifiedBy:id,fname,mname,lname,extension_name,email,username',
                'approvedBy:id,fname,mname,lname,extension_name,email,username' // ✅ ADDED
            ])->latest('transaction_date');

            if ($user->role !== 'admin') {
                $query->where('transacted_by', $user->id);
            }

            // Apply filters
            if ($request->has('movement_type')) {
                $query->where('movement_type', $request->input('movement_type'));
            }
            if ($request->has('transaction_type')) {
                $query->where('transaction_type', $request->input('transaction_type'));
            }
            if ($request->has('status')) {
                $query->where('status', $request->input('status'));
            }
            if ($request->has('inventory_id')) {
                $query->where('inventory_id', $request->input('inventory_id'));
            }
            if ($request->has('reference_number')) { // ✅ FIXED: was 'reference'
                $query->where('reference_number', 'like', '%' . $request->input('reference_number') . '%');
            }

            $perPage = $request->input('per_page', 10);
            $stocks = $query->paginate($perPage);

            return response()->json($stocks, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch stock records', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new stock transaction, auto-approve and auto-verify.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return response()->json(['error' => 'Admins cannot create stock transactions'], 403);
        }

        $validator = Validator::make($request->all(), [
            'inventory_id' => 'required|exists:inventories,id',
            'quantity' => 'required|numeric|min:0.01',
            'movement_type' => 'required|in:stock_in,stock_out,adjustment,transfer,distribution',
            'transaction_type' => 'required|in:purchase,grant,return,distribution,damage,expired,transfer_in,transfer_out,adjustment,initial_stock',
            'unit_cost' => 'nullable|numeric|min:0',
            'transaction_date' => 'required|date',
            'reference_number' => 'nullable|string|max:255', // ✅ FIXED: was 'reference'
            'source' => 'nullable|string|max:255',
            'destination' => 'nullable|string|max:255',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'remarks' => 'nullable|string',
            'attachments' => 'sometimes|array',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $inventory = Inventory::findOrFail($request->inventory_id);
            $unitCost = $request->unit_cost ?? $inventory->unit_value ?? 0;
            $totalValue = $unitCost * $request->quantity;

            // Calculate running balance
            $lastTransaction = InventoryStock::where('inventory_id', $request->inventory_id)
                ->latest('id')
                ->first();
            $lastBalance = $lastTransaction ? $lastTransaction->running_balance : 0;

            $quantity = $request->quantity;
            if (in_array($request->movement_type, ['stock_out', 'distribution', 'transfer_out'])) {
                $quantity = -$request->quantity;
            }

            $newBalance = $lastBalance + $quantity;

            if ($newBalance < 0) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Insufficient stock for this transaction',
                    'available' => $lastBalance,
                    'required' => $request->quantity
                ], 422);
            }

            $stock = InventoryStock::create([
                'inventory_id' => $request->inventory_id,
                'quantity' => $quantity,
                'movement_type' => $request->movement_type,
                'transaction_type' => $request->transaction_type,
                'unit_cost' => $unitCost,
                'total_value' => $totalValue,
                'running_balance' => $newBalance,
                'reference_number' => $request->reference_number, // ✅ FIXED
                'source' => $request->source,
                'destination' => $request->destination,
                'date_received' => $request->date_received,
                'transaction_date' => $request->transaction_date,
                'batch_number' => $request->batch_number,
                'expiry_date' => $request->expiry_date,
                'remarks' => $request->remarks,
                'status' => 'approved',
                'is_verified' => true,
                'transacted_by' => $user->id,
                'verified_by' => $user->id,
                'approved_by' => $user->id, // ✅ ADDED
                'approved_at' => now(),
                'verified_at' => now(), // ✅ ADDED
            ]);

            // Handle file attachments (optional)
            if ($request->hasFile('attachments')) {
                $stored = [];
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('public/inventory/stock_' . $stock->id);
                    $stored[] = [
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => str_replace('public/', 'storage/', $path),
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ];
                }
                $stock->attachments = $stored;
                $stock->save();
            }

            DB::commit();

            $stock->load(['inventory', 'transactor', 'verifiedBy', 'approvedBy']);
            return response()->json([
                'message' => 'Stock transaction created successfully',
                'data' => $stock
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create stock transaction', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Display a specific stock record.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $stock = InventoryStock::with([
                'inventory:id,item_name,unit,unit_value',
                'transactor:id,fname,mname,lname,extension_name,email,username',
                'verifiedBy:id,fname,mname,lname,extension_name,email,username',
                'approvedBy:id,fname,mname,lname,extension_name,email,username' // ✅ ADDED
            ])->findOrFail($id);

            if ($user->role !== 'admin' && $stock->transacted_by !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return response()->json(['data' => $stock], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Stock record not found', 'details' => $e->getMessage()], 404);
        }
    }

    /**
     * Update a stock transaction.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $stock = InventoryStock::findOrFail($id);

            if ($stock->is_verified || $stock->status !== 'pending') {
                return response()->json(['error' => 'Cannot edit verified or non-pending stock transactions'], 403);
            }

            if ($user->role !== 'admin' && $stock->transacted_by !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // ✅ FIXED: Check reference_number instead of reference
            if ($user->role !== 'admin' && strpos($stock->reference_number, 'PROG-') === 0) {
                return response()->json(['error' => 'Cannot edit program-related transactions'], 403);
            }

            $validator = Validator::make($request->all(), [
                'inventory_id' => 'sometimes|exists:inventories,id',
                'quantity' => 'sometimes|numeric|min:0.01',
                'movement_type' => 'sometimes|in:stock_in,stock_out,adjustment,transfer,distribution',
                'transaction_type' => 'sometimes|in:purchase,grant,return,distribution,damage,expired,transfer_in,transfer_out,adjustment,initial_stock',
                'unit_cost' => 'nullable|numeric|min:0',
                'transaction_date' => 'sometimes|date',
                'reference_number' => 'nullable|string|max:255', // ✅ FIXED
                'source' => 'nullable|string|max:255',
                'destination' => 'nullable|string|max:255',
                'batch_number' => 'nullable|string|max:100',
                'expiry_date' => 'nullable|date',
                'remarks' => 'nullable|string',
                'status' => 'sometimes|in:pending,approved,completed,rejected',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => $validator->errors()], 422);
            }

            DB::beginTransaction();

            try {
                $inventory = Inventory::find($request->inventory_id ?? $stock->inventory_id);
                $unitCost = $request->unit_cost ?? $stock->unit_cost ?? $inventory->unit_value ?? 0;
                $quantity = $request->quantity ?? abs($stock->quantity);
                $movementType = $request->movement_type ?? $stock->movement_type;

                $adjustedQuantity = $quantity;
                if (in_array($movementType, ['stock_out', 'distribution', 'transfer_out'])) {
                    $adjustedQuantity = -$quantity;
                }

                $totalValue = $unitCost * $quantity;

                $lastTransaction = InventoryStock::where('inventory_id', $request->inventory_id ?? $stock->inventory_id)
                    ->where('id', '!=', $id)
                    ->latest('id')
                    ->first();
                $lastBalance = $lastTransaction ? $lastTransaction->running_balance : 0;

                $newBalance = $lastBalance + ($adjustedQuantity - $stock->quantity);

                if ($newBalance < 0) {
                    DB::rollBack();
                    return response()->json([
                        'error' => 'Insufficient stock for this update',
                        'available' => $lastBalance,
                        'required' => abs($adjustedQuantity)
                    ], 422);
                }

                $stock->update([
                    'inventory_id' => $request->inventory_id ?? $stock->inventory_id,
                    'quantity' => $adjustedQuantity,
                    'movement_type' => $movementType,
                    'transaction_type' => $request->transaction_type ?? $stock->transaction_type,
                    'unit_cost' => $unitCost,
                    'total_value' => $totalValue,
                    'running_balance' => $newBalance,
                    'reference_number' => $request->reference_number ?? $stock->reference_number, // ✅ FIXED
                    'source' => $request->source ?? $stock->source,
                    'destination' => $request->destination ?? $stock->destination,
                    'date_received' => $request->date_received ?? $stock->date_received,
                    'transaction_date' => $request->transaction_date ?? $stock->transaction_date,
                    'batch_number' => $request->batch_number ?? $stock->batch_number,
                    'expiry_date' => $request->expiry_date ?? $stock->expiry_date,
                    'remarks' => $request->remarks ?? $stock->remarks,
                    'status' => $request->status ?? $stock->status,
                ]);

                DB::commit();

                $stock->load(['inventory', 'transactor', 'verifiedBy', 'approvedBy']);
                return response()->json([
                    'message' => 'Stock transaction updated successfully',
                    'data' => $stock
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['error' => 'Failed to update stock transaction', 'details' => $e->getMessage()], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Stock record not found', 'details' => $e->getMessage()], 404);
        }
    }

    /**
     * Verify a stock transaction and update inventory stock.
     */
    public function verify(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            if ($user->role !== 'admin') {
                return response()->json(['error' => 'Only admins can verify stock transactions'], 403);
            }

            $stock = InventoryStock::findOrFail($id);

            if ($stock->is_verified) {
                return response()->json(['error' => 'Stock transaction is already verified'], 400);
            }

            if ($stock->status !== 'pending') {
                return response()->json(['error' => 'Only pending stock transactions can be verified'], 400);
            }

            DB::beginTransaction();

            try {
                $stock->update([
                    'is_verified' => true,
                    'verified_by' => $user->id,
                    'verified_at' => now(), // ✅ ADDED
                    'approved_by' => $user->id, // ✅ ADDED
                    'status' => 'approved',
                    'approved_at' => now(),
                ]);

                DB::commit();

                $stock->load(['inventory', 'transactor', 'verifiedBy', 'approvedBy']);
                return response()->json([
                    'message' => 'Stock transaction verified successfully',
                    'data' => $stock
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['error' => 'Failed to verify stock transaction', 'details' => $e->getMessage()], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Stock record not found', 'details' => $e->getMessage()], 404);
        }
    }

    /**
     * Remove a stock transaction.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $stock = InventoryStock::findOrFail($id);

            if ($stock->is_verified || $stock->status !== 'pending') {
                return response()->json(['error' => 'Cannot delete verified or non-pending stock transactions'], 403);
            }

            if ($user->role !== 'admin' && $stock->transacted_by !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // ✅ FIXED: Check reference_number instead of reference
            if ($user->role !== 'admin' && strpos($stock->reference_number, 'PROG-') === 0) {
                return response()->json(['error' => 'Cannot delete program-related transactions'], 403);
            }

            DB::beginTransaction();

            try {
                $stock->delete();
                DB::commit();
                return response()->json(['message' => 'Stock transaction deleted successfully'], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['error' => 'Failed to delete stock transaction', 'details' => $e->getMessage()], 500);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Stock record not found', 'details' => $e->getMessage()], 404);
        }
    }

    /**
     * Check stock availability
     */
    public function checkStockAvailability($inventoryId, $quantity): JsonResponse
    {
        $inventory = Inventory::find($inventoryId);

        if (!$inventory) {
            return response()->json(['error' => 'Inventory not found'], 404);
        }

        $onHand = InventoryStock::where('inventory_id', $inventoryId)
            ->latest('id')
            ->value('running_balance') ?? 0;

        $reserved = 0;
        $available = max($onHand - $reserved, 0);

        if ($quantity > $available) {
            return response()->json([
                'status' => 'unavailable',
                'on_hand' => $onHand,
                'reserved' => $reserved,
                'available' => $available,
                'required' => $quantity,
                'message' => 'Insufficient stock',
            ], 422);
        }

        return response()->json([
            'status' => 'available',
            'on_hand' => $onHand,
            'reserved' => $reserved,
            'available' => $available,
            'required' => $quantity,
            'message' => 'Stock is available',
        ], 200);
    }
}