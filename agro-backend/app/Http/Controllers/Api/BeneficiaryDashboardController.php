<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProgramBeneficiary;
use App\Models\ProgramBeneficiaryItem;
use App\Models\SubsidyProgram;

class BeneficiaryDashboardController extends Controller
{
    public function overview(Request $request)
    {
        $user = $request->user();
        $beneficiaryDetail = $user?->beneficiaryDetail;

        if (!$beneficiaryDetail) {
            return response()->json([
                'message' => 'You are not registered as a beneficiary.',
                'programs' => [],
                'stats' => [
                    'approved' => 0,
                    'pending' => 0,
                    'completed' => 0,
                    'ready_for_pickup' => 0,
                    'total' => 0,
                ]
            ], 404);
        }

        $beneficiaryId = $beneficiaryDetail->id;

        // Get upcoming programs (approved, pending/ongoing status, future or current dates)
        $upcomingRecords = ProgramBeneficiary::with([
            'program' => function($q) {
                $q->select('id', 'title', 'description', 'start_date', 'end_date', 'status', 'approval_status', 'created_at', 'updated_at')
                  ->whereIn('status', ['pending', 'ongoing'])
                  ->where(function($query) {
                      $query->where('end_date', '>=', now())
                            ->orWhereNull('end_date');
                  });
            },
            'items' => function ($q) {
                $q->select(
                    'id', 
                    'program_beneficiary_id', 
                    'item_name',
                    'quantity', 
                    'unit', 
                    'status', 
                    'distributed_at',
                    'total_value',
                    'unit_value'
                );
            }
        ])
        ->where('beneficiary_id', $beneficiaryId)
        ->whereHas('program', function($q) {
            $q->where('approval_status', 'approved')
              ->whereIn('status', ['pending', 'ongoing'])
              ->where(function($query) {
                  $query->where('end_date', '>=', now())
                        ->orWhereNull('end_date');
              });
        })
        ->latest()
        ->get();

        $programs = $upcomingRecords->map(fn($pb) => $this->transformProgram($pb))->values();
        $stats = $this->calculateStats($beneficiaryId);

        return response()->json([
            'message' => 'Your beneficiary programs retrieved successfully.',
            'programs' => $programs,
            'stats' => $stats
        ]);
    }

    public function programs(Request $request)
    {
        $user = $request->user();
        $beneficiaryDetail = $user?->beneficiaryDetail;

        if (!$beneficiaryDetail) {
            return response()->json([
                'message' => 'You are not registered as a beneficiary.',
                'programs' => []
            ], 404);
        }

        $beneficiaryId = $beneficiaryDetail->id;

        $records = ProgramBeneficiary::with([
            'program:id,title,description,start_date,end_date,status,approval_status,created_at,updated_at',
            'items' => function ($q) {
                $q->select(
                    'id', 
                    'program_beneficiary_id', 
                    'item_name',
                    'quantity', 
                    'unit', 
                    'status', 
                    'distributed_at',
                    'total_value',
                    'unit_value'
                );
            }
        ])
        ->where('beneficiary_id', $beneficiaryId)
        ->whereHas('program')
        ->latest()
        ->get();

        $programs = $records->map(fn($pb) => $this->transformProgram($pb))->values();

        return response()->json([
            'message' => 'Programs retrieved successfully.',
            'programs' => $programs
        ]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();
        $beneficiaryDetail = $user?->beneficiaryDetail;

        if (!$beneficiaryDetail) {
            return response()->json([
                'message' => 'You are not registered as a beneficiary.',
                'notifications' => []
            ], 404);
        }

        $beneficiaryId = $beneficiaryDetail->id;
        $programBeneficiaries = ProgramBeneficiary::where('beneficiary_id', $beneficiaryId)->pluck('id');

        $since = now()->subDays(30);
        $items = ProgramBeneficiaryItem::with('programBeneficiary.program:id,title')
            ->whereIn('program_beneficiary_id', $programBeneficiaries)
            ->where(function ($q) use ($since) {
                $q->where('created_at', '>=', $since)
                  ->orWhere('updated_at', '>=', $since)
                  ->orWhere('distributed_at', '>=', $since);
            })
            ->orderByDesc('updated_at')
            ->limit(50)
            ->get();

        $notifications = $items->map(function ($item) {
            $type = 'info';
            $title = 'Program Update';

            if ($item->status === 'distributed') {
                $type = 'success';
                $title = 'Item Distributed';
            } elseif ($item->status === 'unclaimed') {
                $type = 'warning';
                $title = 'Item Unclaimed';
            } elseif ($item->status === 'cancelled') {
                $type = 'error';
                $title = 'Item Cancelled';
            }

            $programTitle = $item->programBeneficiary->program->title ?? 'Unknown Program';

            return [
                'id' => $item->id,
                'title' => $title,
                'message' => sprintf(
                    '%s - %s (%s %s)',
                    $programTitle,
                    $item->item_name,
                    $item->quantity,
                    $item->unit
                ),
                'type' => $type,
                'date' => $item->updated_at->toDateString(),
                'time' => $item->updated_at->format('h:i A'),
                'read' => false,
                'priority' => $item->status === 'cancelled' ? 'urgent' : 'medium',
            ];
        })->values();

        return response()->json([
            'message' => 'Notifications retrieved successfully.',
            'notifications' => $notifications
        ]);
    }

    private function transformProgram($pb)
    {
        $program = $pb->program;
        
        if (!$program) {
            return null;
        }

        $items = $pb->items;

        $status = $this->determineProgramStatus($items, $program);

        $totalItems = $items->count();
        $totalValue = $items->sum('total_value') ?: 0;
        $distributedItems = $items->where('status', 'distributed')->count();
        $pendingItems = $items->where('status', 'pending')->count();

        // Use distributed_at instead of released_at
        $latestDistributionDate = $items->whereNotNull('distributed_at')->max('distributed_at');
        $expectedRelease = $program->end_date ?? $program->start_date ?? $latestDistributionDate;

        return [
            'id' => $pb->id,
            'program_id' => $program->id,
            'programID' => 'SP-' . $pb->id,
            'title' => $program->title,
            'name' => $program->title,
            'description' => $program->description,
            'category' => $program->description ? substr($program->description, 0, 60) : null,
            'status' => $status,
            'approval_status' => $program->approval_status,
            'appliedDate' => $program->created_at ? \Carbon\Carbon::parse($program->created_at)->toDateString() : null,
            'expectedRelease' => $expectedRelease ? \Carbon\Carbon::parse($expectedRelease)->toDateString() : null,
            'release_date' => $expectedRelease ? \Carbon\Carbon::parse($expectedRelease)->toDateString() : null,
            'distribution_date' => $expectedRelease ? \Carbon\Carbon::parse($expectedRelease)->toDateString() : null,
            'start_date' => $program->start_date ? \Carbon\Carbon::parse($program->start_date)->toDateString() : null,
            'end_date' => $program->end_date ? \Carbon\Carbon::parse($program->end_date)->toDateString() : null,
            'completed_at' => $status === 'completed' && $latestDistributionDate ? \Carbon\Carbon::parse($latestDistributionDate)->toDateString() : null,
            'created_at' => $pb->created_at ? \Carbon\Carbon::parse($pb->created_at)->toDateString() : null,
            'updated_at' => $pb->updated_at ? \Carbon\Carbon::parse($pb->updated_at)->toDateString() : null,
            'items_summary' => [
                'total_items' => $totalItems,
                'total_value' => (float) $totalValue,
                'distributed_items' => $distributedItems,
                'pending_items' => $pendingItems,
            ],
            'items' => $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'quantity' => (float) $item->quantity,
                    'unit' => $item->unit,
                    'status' => $item->status,
                    'distributed_at' => $item->distributed_at ? \Carbon\Carbon::parse($item->distributed_at)->toDateString() : null,
                    'total_value' => (float) ($item->total_value ?: 0),
                    'unit_value' => (float) ($item->unit_value ?: 0),
                ];
            })->values(),
        ];
    }

    private function determineProgramStatus($items, $program)
    {
        // Use actual program status if available
        if ($program && in_array($program->status, ['pending', 'ongoing', 'completed', 'cancelled'])) {
            return $program->status;
        }

        if ($items->isEmpty()) {
            return 'pending';
        }

        if ($items->every(fn($i) => $i->status === 'distributed')) {
            return 'completed';
        }

        return 'under_review';
    }

    private function calculateStats($beneficiaryId)
    {
        $programBeneficiaries = ProgramBeneficiary::where('beneficiary_id', $beneficiaryId)->pluck('id');
        
        $items = ProgramBeneficiaryItem::whereIn('program_beneficiary_id', $programBeneficiaries)
            ->get(['status']);

        return [
            'approved' => 0, // Removed since approval_status doesn't exist
            'pending' => $items->where('status', 'pending')->count(),
            'completed' => $items->where('status', 'distributed')->count(),
            'ready_for_pickup' => $items->where('status', 'pending')->count(),
            'total' => $items->count(),
        ];
    }
}