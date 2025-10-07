<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\SubsidyProgram;
use App\Models\ProgramBeneficiary;
use App\Models\ProgramBeneficiaryItem;
use App\Models\Inventory;
use App\Models\InventoryStock;
use Illuminate\Support\Facades\Auth;

class SubsidyProgramController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $query = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
            'beneficiaries.beneficiary.user:id,fname,lname',
            'beneficiaries.items.inventory:id,item_name,unit'
        ])
        ->whereIn('status', ['pending', 'ongoing'])
        ->whereIn('approval_status', ['pending', 'approved'])
        ->latest();

        // Role-based access
        if ($user->role === 'coordinator') {
            $query->where('created_by', $user->id);
        }

        $perPage = $request->input('per_page', 10);
        $programs = $query->paginate($perPage);

        return response()->json($programs);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'barangay' => 'nullable|string|max:100',

            'beneficiaries' => 'required|array|min:1',
            'beneficiaries.*.beneficiary_id' => 'required|integer|exists:beneficiary_details,id',

            'beneficiaries.*.items' => 'required|array|min:1',
            'beneficiaries.*.items.*.item_name' => 'required|string|max:150',
            'beneficiaries.*.items.*.quantity' => 'required|numeric|min:1',
            'beneficiaries.*.items.*.unit' => 'required|string|max:50',
            'beneficiaries.*.items.*.assistance_type' => 'required|in:aid,cash,gasoline,voucher,service', // ✅ FIXED: Changed 'grant' to 'aid'
            'beneficiaries.*.items.*.inventory_id' => 'nullable|integer|exists:inventories,id',
        ]);

        DB::beginTransaction();
        try {

            $inventoryRequirements = [];
            foreach ($data['beneficiaries'] as $b) {
                foreach ($b['items'] as $item) {
                    if (!empty($item['inventory_id'])) {
                        $inventoryId = $item['inventory_id'];
                        $inventoryRequirements[$inventoryId] = 
                            ($inventoryRequirements[$inventoryId] ?? 0) + $item['quantity'];
                    }
                }
            }

            $conflicts = [];
            foreach ($inventoryRequirements as $inventoryId => $requiredQty) {
                $inventory = Inventory::find($inventoryId);
                
                if (!$inventory) {
                    throw new \Exception("Inventory item with ID {$inventoryId} not found");
                }

                $onHand = InventoryStock::where('inventory_id', $inventoryId)
                    ->latest('id')
                    ->value('running_balance') ?? 0;

                $pendingQty = ProgramBeneficiaryItem::join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
                    ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
                    ->where('subsidy_programs.approval_status', 'pending')
                    ->where('subsidy_programs.status', 'pending')
                    ->where('program_beneficiary_items.inventory_id', $inventoryId)
                    ->sum('program_beneficiary_items.quantity');

                $availableStock = $onHand - $pendingQty;

                if ($requiredQty > $availableStock) {
                    $conflicts[] = [
                        'item_name' => $inventory->item_name,
                        'unit' => $inventory->unit,
                        'required' => (float) $requiredQty,
                        'available' => (float) max(0, $availableStock),
                        'current_stock' => (float) $onHand,
                        'pending_from_others' => (float) $pendingQty,
                        'shortage' => (float) ($requiredQty - $availableStock)
                    ];
                }
            }

            if (!empty($conflicts)) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Insufficient inventory stock for the requested quantities.',
                    'conflicts' => $conflicts,
                    'message' => 'Please reduce quantities or wait for other pending programs to be processed.'
                ], 422);
            }

            $program = SubsidyProgram::create([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'barangay' => $data['barangay'] ?? null,
                'status' => 'pending',
                'approval_status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            foreach ($data['beneficiaries'] as $b) {
                $beneficiary = ProgramBeneficiary::create([
                    'subsidy_program_id' => $program->id,
                    'beneficiary_id' => $b['beneficiary_id'],
                ]);

                foreach ($b['items'] as $item) {
                    $unitValue = null;
                    $totalValue = null;

                    if (!empty($item['inventory_id'])) {
                        $inventory = Inventory::find($item['inventory_id']);
                        if ($inventory && $inventory->unit_value !== null) {
                            $unitValue = $inventory->unit_value;
                            $totalValue = $unitValue * $item['quantity'];
                        }
                    }

                    ProgramBeneficiaryItem::create([
                        'program_beneficiary_id' => $beneficiary->id,
                        'item_name' => $item['item_name'],
                        'quantity' => $item['quantity'],
                        'unit' => $item['unit'],
                        'assistance_type' => $item['assistance_type'],
                        'inventory_id' => $item['inventory_id'] ?? null,
                        'unit_value' => $unitValue,
                        'total_value' => $totalValue,
                        'status' => 'pending',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Program created successfully, pending approval.',
                'program' => $program->load([
                    'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
                    'beneficiaries.beneficiary.user:id,fname,lname',
                    'beneficiaries.items.inventory:id,item_name,unit'
                ])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create program',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmDistribution(Request $request, $itemId)
    {
        $item = ProgramBeneficiaryItem::with('inventory', 'programBeneficiary.program')->findOrFail($itemId);

        if ($item->status === 'distributed') {
            return response()->json(['error' => 'Item already distributed'], 400);
        }

        try {
            DB::transaction(function () use ($item) {
                if ($item->inventory_id) {
                    $inventory = $item->inventory;

                    $lastBalance = $inventory->stocks()->latest('id')->value('running_balance') ?? 0;

                    if ($lastBalance < $item->quantity) {
                        throw new \Exception("Not enough stock available. Available: {$lastBalance}, Required: {$item->quantity}");
                    }

                    $currentBalance = $lastBalance - $item->quantity;

                    if ($inventory && $inventory->assistance_category === 'monetary') {
                        InventoryStock::create([
                            'inventory_id'     => $inventory->id,
                            'quantity'         => -abs($item->quantity),
                            'movement_type'    => 'distribution',
                            'transaction_type' => 'distribution',
                            'running_balance'  => $currentBalance,
                            'unit_cost'        => 1,
                            'total_value'      => abs($item->quantity),
                            'reference'        => 'PROG-' . $item->programBeneficiary->subsidy_program_id . '-ITEM-' . $item->id,
                            'transaction_date' => now(),
                            'remarks'          => 'Cash assistance distribution',
                            'status'           => 'approved',
                            'is_verified'      => true,
                            'verified_by'      => auth()->id(),
                            'transacted_by'    => auth()->id(),
                            'approved_at'      => now(),
                        ]);
                    } else {
                        InventoryStock::create([
                            'inventory_id'     => $inventory->id,
                            'quantity'         => -$item->quantity,
                            'movement_type'    => 'distribution',
                            'transaction_type' => 'distribution',
                            'running_balance'  => $currentBalance,
                            'unit_cost'        => $item->unit_value ?? $inventory->unit_value ?? 0,
                            'total_value'      => ($item->unit_value ?? $inventory->unit_value ?? 0) * $item->quantity,
                            'reference'        => 'PROG-' . $item->programBeneficiary->subsidy_program_id . '-ITEM-' . $item->id,
                            'transaction_date' => now(),
                            'remarks'          => 'Program distribution',
                            'status'           => 'approved',
                            'is_verified'      => true,
                            'verified_by'      => auth()->id(),
                            'transacted_by'    => auth()->id(),
                            'approved_at'      => now(),
                        ]);
                    }
                }

                $item->update([
                    'status'         => 'distributed',
                    'distributed_at' => now(),
                    'distributed_by' => auth()->id(),
                ]);
            });

            return response()->json([
                'message' => 'Item distributed successfully.',
                'item'    => $item->fresh('inventory')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Distribution failed: ' . $e->getMessage(),
                'item_id' => $itemId
            ], 400);
        }
    }

    public function markItemUnclaimed(Request $request, $itemId)
    {
        $data = $request->validate([
            'reason' => 'nullable|string'
        ]);

        $item = ProgramBeneficiaryItem::with('programBeneficiary.program')->findOrFail($itemId);

        if ($item->status === 'distributed') {
            return response()->json(['error' => 'Distributed items cannot be marked unclaimed.'], 400);
        }

        $item->update([
            'status' => 'unclaimed',
            'unclaimed_at' => now(),
            'unclaimed_reason' => $data['reason'] ?? null,
            'coordinator_notes' => $data['reason'] ?? $item->coordinator_notes
        ]);

        return response()->json([
            'message' => 'Item marked as unclaimed.',
            'item' => $item->fresh()
        ]);
    }

    public function show(string $id)
    {
        $program = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
            'beneficiaries.beneficiary.user:id,fname,lname',
            'beneficiaries.items.inventory:id,item_name,unit'
        ])->findOrFail($id);

        return response()->json($program);
    }

    public function update(Request $request, string $id)
    {
        $program = SubsidyProgram::findOrFail($id);

        if ($program->approval_status !== 'pending') {
            return response()->json(['error' => 'Approved/rejected programs cannot be edited.'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'barangay' => 'nullable|string|max:100',
        ]);

        $program->update($data);

        return response()->json([
            'message' => 'Program updated successfully.',
            'program' => $program->load([
                'creator:id,fname,lname,role,sector_id',
                'creator.sector:id,sector_name',
                'approver:id,fname,lname,role',
                'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
                'beneficiaries.beneficiary.user:id,fname,lname',
                'beneficiaries.items.inventory:id,item_name,unit'
            ])
        ]);
    }

    public function destroy(string $id)
    {
        $program = SubsidyProgram::findOrFail($id);

        if ($program->approval_status === 'approved') {
            return response()->json(['error' => 'Cannot delete an approved program.'], 403);
        }

        $program->delete();

        return response()->json(['message' => 'Program deleted successfully.']);
    }

    public function approveProgram(string $id)
    {
        $program = SubsidyProgram::findOrFail($id);

        if ($program->approval_status === 'approved') {
            return response()->json(['error' => 'Program is already approved.'], 400);
        }

        if ($program->approval_status === 'rejected') {
            return response()->json(['error' => 'Rejected programs cannot be approved.'], 400);
        }

        $status = now()->gte($program->start_date) ? 'ongoing' : 'pending';

        $program->update([
            'approval_status' => 'approved',
            'status' => $status,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Program approved successfully.',
            'program' => $program->fresh([
                'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
                'beneficiaries.beneficiary.user:id,fname,lname',
                'beneficiaries.items.inventory:id,item_name,unit'
            ])
        ]);
    }

    public function cancelProgram(string $id)
    {
        $program = SubsidyProgram::findOrFail($id);

        if ($program->status === 'completed') {
            return response()->json(['error' => 'Cannot cancel completed program'], 403);
        }

        if ($program->status === 'cancelled') {
            return response()->json(['error' => 'Program is already cancelled'], 403);
        }

        $program->update([
            'status' => 'cancelled',
            'approval_status' => 'rejected', 
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Program cancelled successfully'], 200);
    }

    public function completeProgram(string $id)
    {
        $program = SubsidyProgram::with([
            'beneficiaries.items.inventory:id,item_name,unit,unit_value'
        ])->findOrFail($id);

        if ($program->status !== 'ongoing') {
            return response()->json(['error' => 'Only ongoing programs can be completed.'], 400);
        }

        DB::transaction(function () use ($program) {
            foreach ($program->beneficiaries as $beneficiary) {
                foreach ($beneficiary->items as $item) {
                    if ($item->status === 'pending') {
                        $item->update([
                            'status' => 'unclaimed',
                            'unclaimed_at' => now(),
                            'distributed_at' => null,
                            'distributed_by' => null,
                        ]);
                    }
                }
            }

            $program->update(['status' => 'completed']);
        });

        return response()->json([
            'message' => 'Program marked as completed. Distributed and unclaimed items recorded.',
            'program' => $program->fresh([
                'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
                'beneficiaries.beneficiary.user:id,fname,lname',
                'beneficiaries.items.inventory:id,item_name,unit'
            ])
        ]);
    }

    public function historySummary(string $id)
    {
        $program = SubsidyProgram::with([
            'beneficiaries.items' => function ($q) {
                $q->with('inventory:id,item_name,unit,assistance_category');
            }
        ])->findOrFail($id);

        $beneficiaries = $program->beneficiaries;
        $allItems = collect();
        foreach ($beneficiaries as $b) {
            $allItems = $allItems->merge($b->items);
        }

        $totalPlanned = (int) $allItems->count();
        $totalDistributed = (int) $allItems->where('status', 'distributed')->count();
        $distributionPct = $totalPlanned > 0 ? round(($totalDistributed / $totalPlanned) * 100, 1) : 0;

        $totalProgramValue = (float) $allItems->sum(function ($i) {
            return (float) ($i->total_value ?? (($i->unit_value ?? 0) * ($i->quantity ?? 0)));
        });
        $distributedValue = (float) $allItems->where('status', 'distributed')->sum(function ($i) {
            return (float) ($i->total_value ?? (($i->unit_value ?? 0) * ($i->quantity ?? 0)));
        });

        $stockDistributions = InventoryStock::with('inventory:id,item_name,unit,assistance_category')
            ->where('transaction_type', 'distribution')
            ->where('reference', 'like', 'PROG-' . $program->id . '%')
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'inventory' => [
                        'id' => $s->inventory->id,
                        'item_name' => $s->inventory->item_name,
                        'unit' => $s->inventory->unit,
                        'assistance_category' => $s->inventory->assistance_category,
                    ],
                    'quantity' => (float) $s->quantity,
                    'total_value' => (float) ($s->total_value ?? 0),
                    'reference' => $s->reference,
                    'transaction_date' => $s->transaction_date,
                    'remarks' => $s->remarks,
                ];
            });

        return response()->json([
            'program_title' => $program->title,
            'statistics' => [
                'total_beneficiaries' => (int) $beneficiaries->count(),
                'total_items_planned' => $totalPlanned,
                'total_items_distributed' => $totalDistributed,
                'distribution_percentage' => $distributionPct,
                'total_program_value' => $totalProgramValue,
                'distributed_value' => $distributedValue,
            ],
            'timeline' => [
                'created_at' => $program->created_at,
                'approved_at' => $program->approved_at,
            ],
            'status_flow' => [
                'current' => $program->status,
                'completed' => $program->status === 'completed' ? $program->updated_at : null,
            ],
            'distributions' => $stockDistributions,
        ]);
    }

    public function history(Request $request)
    {
        $user = auth()->user();
        $query = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
            'beneficiaries.beneficiary.user:id,fname,lname',
            'beneficiaries.items.inventory:id,item_name,unit'
        ])
        ->whereIn('status', ['completed', 'cancelled'])
        ->whereIn('approval_status', ['approved', 'rejected'])
        ->latest();

        if ($user->role === 'coordinator') {
            $query->where('created_by', $user->id);
        }

        $perPage = $request->input('per_page', 10);
        $programs = $query->paginate($perPage);

        return response()->json($programs);
    }

    public function myBeneficiaryPrograms(Request $request)
    {
        $user = auth()->user();
        $beneficiaryDetail = $user->beneficiaryDetail;

        if (!$beneficiaryDetail) {
            return response()->json([
                'message' => 'You are not registered as a beneficiary.',
                'programs' => []
            ], 404);
        }

        $query = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries' => function($q) use ($beneficiaryDetail) {
                $q->where('beneficiary_id', $beneficiaryDetail->id)
                  ->with([
                      'beneficiary:id,rsbsa_number,barangay,user_id',
                      'beneficiary.user:id,fname,lname',
                      'items' => function($itemQuery) {
                          $itemQuery->with('inventory:id,item_name,unit')
                                    ->orderBy('created_at', 'desc');
                      }
                  ]);
            }
        ])
        ->whereHas('beneficiaries', function($q) use ($beneficiaryDetail) {
            $q->where('beneficiary_id', $beneficiaryDetail->id);
        })
        ->where('approval_status', 'approved')
        ->whereIn('status', ['pending', 'ongoing'])
        ->latest();

        if ($status = $request->input('status')) {
            if (in_array($status, ['pending', 'ongoing'])) {
                $query->where('status', $status);
            }
        }

        $perPage = $request->input('per_page', 10);
        $programs = $query->paginate($perPage);

        $programs->getCollection()->transform(function ($program) {
            $beneficiary = $program->beneficiaries->first();

            return [
                'id' => $program->id,
                'title' => $program->title,
                'description' => $program->description,
                'start_date' => $program->start_date,
                'end_date' => $program->end_date,
                'status' => $program->status,
                'approval_status' => $program->approval_status,
                'created_at' => $program->created_at,
                'updated_at' => $program->updated_at,
                'creator' => [
                    'name' => $program->creator->fname . ' ' . $program->creator->lname,
                    'role' => $program->creator->role,
                    'sector' => $program->creator->sector->sector_name ?? 'N/A'
                ],
                'approver' => $program->approver ? [
                    'name' => $program->approver->fname . ' ' . $program->approver->lname,
                    'role' => $program->approver->role,
                ] : null,
                'approved_at' => $program->approved_at,
                'my_items' => $beneficiary ? $beneficiary->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                        'unit_value' => $item->unit_value,
                        'total_value' => $item->total_value,
                        'status' => $item->status,
                        'coordinator_notes' => $item->coordinator_notes,
                        'distributed_at' => $item->distributed_at,
                        'distributed_by' => $item->distributed_by,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit
                        ] : null
                    ];
                }) : [],
                'items_summary' => $beneficiary ? [
                    'total_items' => $beneficiary->items->count(),
                    'total_value' => $beneficiary->items->sum('total_value'),
                    'pending_items' => $beneficiary->items->where('status', 'pending')->count(),
                    'distributed_items' => $beneficiary->items->where('status', 'distributed')->count()
                ] : null
            ];
        });

        return response()->json([
            'message' => 'Your beneficiary programs retrieved successfully.',
            'programs' => $programs
        ]);
    }

    public function myBeneficiaryProgramDetails(string $id)
    {
        $user = auth()->user();
        $beneficiaryDetail = $user->beneficiaryDetail;

        if (!$beneficiaryDetail) {
            return response()->json([
                'message' => 'You are not registered as a beneficiary.'
            ], 404);
        }

        $program = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries' => function($q) use ($beneficiaryDetail) {
                $q->where('beneficiary_id', $beneficiaryDetail->id)
                  ->with([
                      'beneficiary:id,rsbsa_number,barangay,user_id',
                      'beneficiary.user:id,fname,lname',
                      'items.inventory:id,item_name,unit'
                  ]);
            }
        ])
        ->whereHas('beneficiaries', function($q) use ($beneficiaryDetail) {
            $q->where('beneficiary_id', $beneficiaryDetail->id);
        })
        ->where('approval_status', 'approved')
        ->whereIn('status', ['pending', 'ongoing']) 
        ->findOrFail($id);

        $beneficiary = $program->beneficiaries->first();

        $response = [
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'description' => $program->description,
                'start_date' => $program->start_date,
                'end_date' => $program->end_date,
                'status' => $program->status,
                'approval_status' => $program->approval_status, 
                'created_at' => $program->created_at,
                'updated_at' => $program->updated_at,
                'approved_at' => $program->approved_at,
                'creator' => [
                    'name' => $program->creator->fname . ' ' . $program->creator->lname,
                    'role' => $program->creator->role,
                    'sector' => $program->creator->sector->sector_name ?? 'N/A'
                ],
                'approver' => $program->approver ? [
                    'name' => $program->approver->fname . ' ' . $program->approver->lname,
                    'role' => $program->approver->role,
                ] : null,
            ],
            'my_benefits' => $beneficiary ? [
                'beneficiary_info' => [
                    'rsbsa_number' => $beneficiary->beneficiary->rsbsa_number,
                    'barangay' => $beneficiary->beneficiary->barangay,
                    'name' => $beneficiary->beneficiary->user->fname . ' ' . $beneficiary->beneficiary->user->lname
                ],
                'items' => $beneficiary->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                        'unit_value' => $item->unit_value,
                        'total_value' => $item->total_value,
                        'status' => $item->status, 
                        'coordinator_notes' => $item->coordinator_notes,
                        'distributed_at' => $item->distributed_at,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit
                        ] : null
                    ];
                }),
                'summary' => [
                    'total_items' => $beneficiary->items->count(),
                    'total_value' => $beneficiary->items->sum('total_value'),
                    'pending_items' => $beneficiary->items->where('status', 'pending')->count(),
                    'distributed_items' => $beneficiary->items->where('status', 'distributed')->count()
                ]
            ] : null
        ];

        return response()->json($response);
    }

    public function myBeneficiarySubsidyHistory(Request $request)
    {
        $user = auth()->user();
        $beneficiaryDetail = $user->beneficiaryDetail;

        if (!$beneficiaryDetail) {
            return response()->json([
                'message' => 'You are not registered as a beneficiary.',
                'history' => [
                    'data' => [],
                    'current_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'last_page' => 1
                ]
            ], 404);
        }

        $query = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries' => function ($q) use ($beneficiaryDetail) {
                $q->where('beneficiary_id', $beneficiaryDetail->id)
                  ->with([
                      'items.inventory:id,item_name,unit',
                      'beneficiary:id,rsbsa_number,barangay,user_id',
                      'beneficiary.user:id,fname,lname'
                  ]);
            }
        ])
        ->whereHas('beneficiaries', function ($q) use ($beneficiaryDetail) {
            $q->where('beneficiary_id', $beneficiaryDetail->id);
        })
        ->where('approval_status', 'approved')
        ->whereIn('status', ['completed', 'cancelled'])
        ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        $programs = $query->paginate($perPage);

        $programs->getCollection()->transform(function ($program) {
            $beneficiary = $program->beneficiaries->first();

            $items = $beneficiary ? $beneficiary->items : collect();

            $program->items_summary = [
                'total_items' => $items->count(),
                'total_value' => (float) $items->sum('total_value'),
                'distributed_items' => $items->where('status', 'distributed')->count(),
                'unclaimed_items' => $items->where('status', 'unclaimed')->count(),
                'pending_items' => $items->where('status', 'pending')->count(),
                'cancelled_items' => $items->where('status', 'cancelled')->count(),
                'completion_rate' => $items->count() > 0
                    ? round(($items->where('status', 'distributed')->count() / $items->count()) * 100, 2)
                    : 0,
            ];

            if ($beneficiary) {
                $beneficiary->items->transform(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                        'unit_value' => $item->unit_value,
                        'total_value' => $item->total_value,
                        'status' => $item->status,
                        'coordinator_notes' => $item->coordinator_notes,
                        'distributed_at' => $item->distributed_at,
                        'inventory' => $item->inventory
                    ];
                });
            }

            return $program;
        });

        return response()->json([
            'message' => 'Beneficiary subsidy history retrieved successfully.',
            'history' => $programs
        ]);
    }
}