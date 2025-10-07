<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryStock;
use App\Models\ProgramBeneficiaryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $inventories = Inventory::with('stocks')->get()->map(function ($inventory) {
            // Get the latest running_balance from InventoryStock
            $lastStock = $inventory->stocks()->latest('id')->first();
            $onHand = $lastStock ? $lastStock->running_balance : ($inventory->current_stock ?? 0);

            // Calculate reserved quantity from pending program beneficiary items
            $reserved = ProgramBeneficiaryItem::join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
                ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
                ->where('subsidy_programs.approval_status', 'pending')
                ->where('subsidy_programs.status', 'pending')
                ->where('program_beneficiary_items.inventory_id', $inventory->id)
                ->sum('program_beneficiary_items.quantity');

            return [    
                'id' => $inventory->id,
                'item_name' => $inventory->item_name,
                'unit' => $inventory->unit,
                'unit_value' => $inventory->unit_value,
                'item_type' => $inventory->item_type,
                'assistance_category' => $inventory->assistance_category,
                'is_trackable_stock' => $inventory->is_trackable_stock,
                'on_hand' => $onHand,
                'reserved' => $reserved,
                'available' => max(0, $onHand - $reserved), // Added available field
                'description' => $inventory->description,
            ];
        });

        return response()->json($inventories);
    }

    /**
     * Store a newly created resource in storage.
     */
   public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'item_name' => 'required|string|max:150',
        'unit' => 'required_if:assistance_category,aid,monetary|string|max:50|nullable',
        'item_type' => 'required|in:seed,fertilizer,pesticide,equipment,fuel,cash,other',
        'assistance_category' => 'required|in:aid,monetary,service',
        'is_trackable_stock' => 'boolean',
        'unit_value' => 'nullable|numeric|min:0',
        'description' => 'nullable|string|max:1000',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $data = $request->only([
        'item_name',
        'unit',
        'item_type',
        'assistance_category',
        'is_trackable_stock',
        'unit_value',
        'description',
    ]);

    // Enforce defaults for non-physical items
    if ($data['assistance_category'] === 'monetary') {
        $data['item_type'] = 'cash';
        $data['unit'] = 'php';
        $data['is_trackable_stock'] = false;
    } elseif ($data['assistance_category'] === 'service') {
        $data['item_type'] = 'other';
        $data['unit'] = null;
        $data['is_trackable_stock'] = false;
    }

    // ✅ Create the inventory item
    $inventory = Inventory::create($data);

    return response()->json([
        'message' => 'Inventory item created successfully',
        'data' => $inventory
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $inventory = Inventory::with('stocks')->findOrFail($id);

        $lastStock = $inventory->stocks()->latest('id')->first();
        $onHand = $lastStock ? $lastStock->running_balance : ($inventory->current_stock ?? 0);

        $reserved = ProgramBeneficiaryItem::join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
            ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
            ->where('subsidy_programs.approval_status', 'pending')
            ->where('subsidy_programs.status', 'pending')
            ->where('program_beneficiary_items.inventory_id', $inventory->id)
            ->sum('program_beneficiary_items.quantity');

        return response()->json([
            'id' => $inventory->id,
            'item_name' => $inventory->item_name,
            'unit' => $inventory->unit,
            'unit_value' => $inventory->unit_value,
            'item_type' => $inventory->item_type,
            'assistance_category' => $inventory->assistance_category,
            'is_trackable_stock' => $inventory->is_trackable_stock,
            'on_hand' => $onHand,
            'reserved' => $reserved,
            'available' => max(0, $onHand - $reserved), // Added available field
            'description' => $inventory->description,
            'current_stock' => $inventory->current_stock,
            'stocks' => $inventory->stocks,
        ]);
    }

    /**
     * Update the specified resource in storage.
     * 
     * THIS IS THE FOCUS METHOD - handles updating inventory items
     */
    public function update(Request $request, string $id)
    {
        $inventory = Inventory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'item_name' => 'sometimes|required|string|max:150',
            'unit' => 'sometimes|required_if:assistance_category,aid,monetary|string|max:50|nullable',
            'item_type' => 'sometimes|required|in:seed,fertilizer,pesticide,equipment,fuel,cash,other',
            'assistance_category' => 'sometimes|required|in:aid,monetary,service',
            'is_trackable_stock' => 'boolean',
            'unit_value' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only([
            'item_name',
            'unit',
            'item_type',
            'assistance_category',
            'is_trackable_stock',
            'unit_value',
            'description',
        ]);

        // Enforce defaults for non-physical items
        if (isset($data['assistance_category']) && $data['assistance_category'] === 'monetary') {
            $data['item_type'] = 'cash';
            $data['unit'] = 'php';
            $data['is_trackable_stock'] = false;
        } elseif (isset($data['assistance_category']) && $data['assistance_category'] === 'service') {
            $data['item_type'] = 'other';
            $data['unit'] = null;
            $data['is_trackable_stock'] = false;
        }

        $inventory->update($data);

        // Calculate current stock values for response
        $onHand = $inventory->stocks()->latest('id')->first()?->running_balance ?? ($inventory->current_stock ?? 0);
        
        $reserved = ProgramBeneficiaryItem::join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
            ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
            ->where('subsidy_programs.approval_status', 'pending')
            ->where('subsidy_programs.status', 'pending')
            ->where('program_beneficiary_items.inventory_id', $inventory->id)
            ->sum('program_beneficiary_items.quantity');

        return response()->json([
            'message' => 'Inventory item updated successfully',
            'data' => [
                'id' => $inventory->id,
                'item_name' => $inventory->item_name,
                'unit' => $inventory->unit,
                'unit_value' => $inventory->unit_value,
                'item_type' => $inventory->item_type,
                'assistance_category' => $inventory->assistance_category,
                'is_trackable_stock' => $inventory->is_trackable_stock,
                'description' => $inventory->description,
                'on_hand' => $onHand,
                'reserved' => $reserved,
                'available' => max(0, $onHand - $reserved),
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $inventory = Inventory::findOrFail($id);

        // Prevent deletion if inventory is reserved in pending programs
        $reserved = ProgramBeneficiaryItem::join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
            ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
            ->where('subsidy_programs.approval_status', 'pending')
            ->where('subsidy_programs.status', 'pending')
            ->where('program_beneficiary_items.inventory_id', $inventory->id)
            ->exists();

        if ($reserved) {
            return response()->json([
                'error' => 'Cannot delete inventory item with pending program reservations.'
            ], 422);
        }

        $inventory->delete();

        return response()->json([
            'message' => 'Inventory item deleted successfully'
        ]);
    }
}