<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\SubsidyProgram;
use App\Models\ProgramBeneficiary;
use App\Models\ProgramBeneficiaryItem;
use Illuminate\Support\Facades\Auth;

class SubsidyAnalyticsController extends Controller
{
    /**
     * Get real-time analytics for a specific program
     * Shows distribution progress, beneficiary status, item status, etc.
     */
    public function programAnalytics(string $id)
    {
        $user = Auth::user();
        
        $program = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
            'beneficiaries.beneficiary.user:id,fname,lname',
            'beneficiaries.items.inventory:id,item_name,unit'
        ])->findOrFail($id);

        // Role-based access control
        if ($user->role === 'coordinator' && $program->created_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        // Get detailed statistics
        $analytics = $this->calculateProgramAnalytics($program);

        return response()->json([
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'description' => $program->description,
                'status' => $program->status,
                'approval_status' => $program->approval_status,
                'start_date' => $program->start_date,
                'end_date' => $program->end_date,
                'created_at' => $program->created_at,
                'approved_at' => $program->approved_at,
                'creator' => [
                    'name' => $program->creator->fname . ' ' . $program->creator->lname,
                    'role' => $program->creator->role,
                    'sector' => $program->creator->sector->sector_name ?? 'N/A'
                ],
                'approver' => $program->approver ? [
                    'name' => $program->approver->fname . ' ' . $program->approver->lname,
                    'role' => $program->approver->role
                ] : null
            ],
            'analytics' => $analytics
        ]);
    }

    /**
     * Get real-time progress dashboard for ongoing programs
     * Shows overall statistics for all programs
     */
    public function dashboardAnalytics(Request $request)
    {
        $user = Auth::user();

        $query = SubsidyProgram::with([
            'creator:id,fname,lname,role',
            'creator.sector:id,sector_name',
            'beneficiaries.beneficiary:id,user_id,barangay,rsbsa_number',
            'beneficiaries.beneficiary.user:id,fname,lname',
            'beneficiaries.items'
        ])->whereIn('status', ['ongoing', 'completed', 'pending'])
          ->where('approval_status', 'approved');

        // Role-based filtering
        if ($user->role === 'coordinator') {
            $query->where('created_by', $user->id);
        }

        $programs = $query->get();

        $dashboard = [
            'summary' => [
                'total_programs' => $programs->count(),
                'ongoing_programs' => $programs->where('status', 'ongoing')->count(),
                'pending_programs' => $programs->where('status', 'pending')->count(),
                'completed_programs' => $programs->where('status', 'completed')->count(),
                'total_beneficiaries' => $programs->sum(fn($p) => $p->beneficiaries->count()),
                'total_items' => $programs->sum(fn($p) =>
                    $p->beneficiaries->sum(fn($b) => $b->items->count())
                ),
                'distributed_items' => $programs->sum(fn($p) =>
                    $p->beneficiaries->sum(fn($b) =>
                        $b->items->where('status', 'distributed')->count()
                    )
                ),
                'pending_items' => $programs->sum(fn($p) =>
                    $p->beneficiaries->sum(fn($b) =>
                        $b->items->where('status', 'pending')->count()
                    )
                ),
                'unclaimed_items' => $programs->sum(fn($p) =>
                    $p->beneficiaries->sum(fn($b) =>
                        $b->items->where('status', 'unclaimed')->count()
                    )
                )
            ],
            'ongoing_programs_progress' => [],
            'recent_distributions' => $this->getRecentDistributions($user)
        ];

        // Calculate overall completion rate
        $totalItems = $dashboard['summary']['total_items'];
        $dashboard['summary']['completion_rate'] = $totalItems > 0
            ? round(($dashboard['summary']['distributed_items'] / $totalItems) * 100, 2)
            : 0;

        // Get progress for each ongoing AND pending program
        foreach ($programs->whereIn('status', ['ongoing', 'pending']) as $program) {
            $analytics = $this->calculateProgramAnalytics($program);

            $dashboard['ongoing_programs_progress'][] = [
                'id' => $program->id,
                'title' => $program->title,
                'status' => $program->status,
                'creator' => [
                    'name' => $program->creator
                        ? $program->creator->fname . ' ' . $program->creator->lname
                        : null,
                    'role' => $program->creator->role ?? null,
                    'sector' => $program->creator->sector->sector_name ?? null
                ],
                'sector' => $program->creator->sector->sector_name ?? null,
                'start_date' => $program->start_date,
                'end_date' => $program->end_date,
                'days_remaining' => $this->getDaysRemaining($program->end_date),
                'days_until_start' => $program->status === 'pending' 
                    ? $this->getDaysRemaining($program->start_date) 
                    : null,
                'beneficiaries' => $program->beneficiaries->map(function ($b) {
                    return [
                        'id' => $b->beneficiary->id,
                        'name' => $b->beneficiary->user
                            ? $b->beneficiary->user->fname . ' ' . $b->beneficiary->user->lname
                            : 'N/A',
                        'rsbsa_number' => $b->beneficiary->rsbsa_number ?? 'N/A',
                        'barangay' => $b->beneficiary->barangay ?? 'N/A',
                        'items_count' => $b->items->count(),
                        'distributed_items' => $b->items->where('status', 'distributed')->count(),
                        'pending_items' => $b->items->where('status', 'pending')->count(),
                        'unclaimed_items' => $b->items->where('status', 'unclaimed')->count(),
                    ];
                }),
                'progress' => $analytics['progress_summary'],
                'beneficiary_progress' => $analytics['beneficiary_summary']
            ];
        }

        return response()->json($dashboard);
    }

    /**
     * Get detailed beneficiary distribution status for a program
     */
    public function beneficiaryDistributionStatus(string $id)
    {
        $user = Auth::user();
        
        $program = SubsidyProgram::with([
            'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
            'beneficiaries.beneficiary.user:id,fname,lname',
            'beneficiaries.items.inventory:id,item_name,unit',
            'beneficiaries.items.distributedBy:id,fname,lname',
            'beneficiaries.items.cancelledBy:id,fname,lname'
        ])->findOrFail($id);

        // Role-based access control
        if ($user->role === 'coordinator' && $program->created_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        $beneficiariesStatus = [];

        foreach ($program->beneficiaries as $beneficiary) {
            $items = $beneficiary->items;
            
            $beneficiaryData = [
                'beneficiary_id' => $beneficiary->beneficiary->id,
                'name' => $beneficiary->beneficiary->user->fname . ' ' . $beneficiary->beneficiary->user->lname,
                'rsbsa_number' => $beneficiary->beneficiary->rsbsa_number ?? 'N/A',
                'barangay' => $beneficiary->beneficiary->barangay,
                'items_summary' => [
                    'total_items' => $items->count(),
                    'distributed_items' => $items->where('status', 'distributed')->count(),
                    'pending_items' => $items->where('status', 'pending')->count(),
                    'unclaimed_items' => $items->where('status', 'unclaimed')->count(),
                    'cancelled_items' => $items->where('status', 'cancelled')->count(),
                    'total_value' => (float) $items->sum('total_value'),
                    'distributed_value' => (float) $items->where('status', 'distributed')->sum('total_value'),
                    'completion_rate' => $items->count() > 0 
                        ? round(($items->where('status', 'distributed')->count() / $items->count()) * 100, 2)
                        : 0
                ],
                'items_detail' => $items->map(function($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                        'status' => $item->status,
                        'assistance_type' => $item->assistance_type,
                        'unit_value' => $item->unit_value,
                        'total_value' => $item->total_value,
                        'coordinator_notes' => $item->coordinator_notes,
                        'distributed_at' => $item->distributed_at,
                        'distributed_by' => $item->distributedBy ? [
                            'id' => $item->distributedBy->id,
                            'name' => $item->distributedBy->fname . ' ' . $item->distributedBy->lname
                        ] : null,
                        'unclaimed_at' => $item->unclaimed_at,
                        'unclaimed_reason' => $item->unclaimed_reason,
                        'cancelled_at' => $item->cancelled_at,
                        'cancelled_by' => $item->cancelledBy ? [
                            'id' => $item->cancelledBy->id,
                            'name' => $item->cancelledBy->fname . ' ' . $item->cancelledBy->lname
                        ] : null,
                        'cancellation_reason' => $item->cancellation_reason,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit
                        ] : null
                    ];
                }),
                'distribution_status' => $this->getBeneficiaryDistributionStatus($items),
                'last_distribution_date' => $items->where('status', 'distributed')->max('distributed_at')
            ];

            $beneficiariesStatus[] = $beneficiaryData;
        }

        // Sort beneficiaries by priority: unclaimed first, then mixed, then pending, then completed
        usort($beneficiariesStatus, function($a, $b) {
            $statusPriority = [
                'unclaimed' => 1,
                'cancelled' => 2,
                'mixed' => 3, 
                'pending' => 4,
                'completed' => 5
            ];
            
            return $statusPriority[$a['distribution_status']] - $statusPriority[$b['distribution_status']];
        });

        return response()->json([
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'status' => $program->status,
            ],
            'beneficiaries_status' => $beneficiariesStatus,
            'summary' => [
                'total_beneficiaries' => count($beneficiariesStatus),
                'completed_beneficiaries' => count(array_filter($beneficiariesStatus, function($b) {
                    return $b['distribution_status'] === 'completed';
                })),
                'pending_beneficiaries' => count(array_filter($beneficiariesStatus, function($b) {
                    return in_array($b['distribution_status'], ['pending', 'mixed']);
                })),
                'unclaimed_beneficiaries' => count(array_filter($beneficiariesStatus, function($b) {
                    return $b['distribution_status'] === 'unclaimed';
                }))
            ]
        ]);
    }

    /**
     * Get unclaimed items report for completed programs
     */
    public function unclaimedItemsReport(string $id)
    {
        $user = Auth::user();
        
        $program = SubsidyProgram::with([
            'beneficiaries.beneficiary:id,rsbsa_number,barangay,user_id',
            'beneficiaries.beneficiary.user:id,fname,lname',
            'beneficiaries.items' => function($query) {
                $query->where('status', 'unclaimed')->with('inventory:id,item_name,unit');
            }
        ])->where('status', 'completed')->findOrFail($id);

        // Role-based access control
        if ($user->role === 'coordinator' && $program->created_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        $unclaimedItems = [];
        $totalUnclaimedValue = 0;
        $itemTypeBreakdown = [];

        foreach ($program->beneficiaries as $beneficiary) {
            if ($beneficiary->items->count() > 0) {
                $beneficiaryUnclaimed = [
                    'beneficiary' => [
                        'id' => $beneficiary->beneficiary->id,
                        'name' => $beneficiary->beneficiary->user->fname . ' ' . $beneficiary->beneficiary->user->lname,
                        'rsbsa_number' => $beneficiary->beneficiary->rsbsa_number ?? 'N/A',
                        'barangay' => $beneficiary->beneficiary->barangay
                    ],
                    'unclaimed_items' => $beneficiary->items->map(function($item) use (&$itemTypeBreakdown) {
                        // Track item types
                        $itemName = $item->item_name;
                        if (!isset($itemTypeBreakdown[$itemName])) {
                            $itemTypeBreakdown[$itemName] = [
                                'item_name' => $itemName,
                                'assistance_type' => $item->assistance_type,
                                'quantity' => 0,
                                'unit' => $item->unit,
                                'total_value' => 0,
                                'beneficiary_count' => 0
                            ];
                        }
                        $itemTypeBreakdown[$itemName]['quantity'] += $item->quantity;
                        $itemTypeBreakdown[$itemName]['total_value'] += $item->total_value ?? 0;
                        $itemTypeBreakdown[$itemName]['beneficiary_count']++;

                        return [
                            'id' => $item->id,
                            'item_name' => $item->item_name,
                            'quantity' => $item->quantity,
                            'unit' => $item->unit,
                            'assistance_type' => $item->assistance_type,
                            'unit_value' => $item->unit_value,
                            'total_value' => $item->total_value,
                            'unclaimed_at' => $item->unclaimed_at,
                            'unclaimed_reason' => $item->unclaimed_reason,
                            'inventory' => $item->inventory
                        ];
                    }),
                    'total_unclaimed_value' => (float) $beneficiary->items->sum('total_value'),
                    'unclaimed_count' => $beneficiary->items->count()
                ];

                $unclaimedItems[] = $beneficiaryUnclaimed;
                $totalUnclaimedValue += $beneficiaryUnclaimed['total_unclaimed_value'];
            }
        }

        return response()->json([
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'status' => $program->status,
                'end_date' => $program->end_date,
                'completed_at' => $program->updated_at
            ],
            'unclaimed_report' => [
                'total_beneficiaries_with_unclaimed' => count($unclaimedItems),
                'total_unclaimed_items' => array_sum(array_column($unclaimedItems, 'unclaimed_count')),
                'total_unclaimed_value' => $totalUnclaimedValue,
                'item_type_breakdown' => array_values($itemTypeBreakdown),
                'beneficiaries' => $unclaimedItems
            ]
        ]);
    }

    /**
     * Get daily distribution progress for ongoing programs
     */
    public function dailyDistributionProgress(string $id)
    {
        $user = Auth::user();
        
        $program = SubsidyProgram::findOrFail($id);

        // Role-based access control
        if ($user->role === 'coordinator' && $program->created_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        $dailyProgress = $this->getDailyDistributionProgress($program);
        
        // Calculate cumulative progress
        $cumulativeItems = 0;
        $cumulativeValue = 0;
        $dailyProgressWithCumulative = $dailyProgress->map(function($day) use (&$cumulativeItems, &$cumulativeValue) {
            $cumulativeItems += $day['items_distributed'];
            $cumulativeValue += $day['value_distributed'];
            
            return array_merge($day, [
                'cumulative_items' => $cumulativeItems,
                'cumulative_value' => $cumulativeValue
            ]);
        });

        return response()->json([
            'program_id' => $program->id,
            'program_title' => $program->title,
            'daily_progress' => $dailyProgressWithCumulative,
            'summary' => [
                'total_distribution_days' => $dailyProgress->count(),
                'peak_distribution_day' => $dailyProgress->sortByDesc('items_distributed')->first(),
                'average_daily_items' => $dailyProgress->avg('items_distributed'),
                'average_daily_value' => $dailyProgress->avg('value_distributed')
            ]
        ]);
    }

    /**
     * Get item-wise distribution analytics
     */
    public function itemAnalytics(string $id)
    {
        $user = Auth::user();
        
        $program = SubsidyProgram::with([
            'beneficiaries.items.inventory'
        ])->findOrFail($id);

        // Role-based access control
        if ($user->role === 'coordinator' && $program->created_by !== $user->id) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        $itemBreakdown = $this->getItemTypeBreakdown($program);

        return response()->json([
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'status' => $program->status
            ],
            'item_analytics' => $itemBreakdown,
            'summary' => [
                'total_item_types' => count($itemBreakdown),
                'most_distributed_item' => collect($itemBreakdown)->sortByDesc('distributed_quantity')->first(),
                'least_distributed_item' => collect($itemBreakdown)->sortBy('completion_rate')->first(),
                'highest_value_item' => collect($itemBreakdown)->sortByDesc('total_value')->first()
            ]
        ]);
    }

    // =================== HELPER METHODS ===================

    /**
     * Calculate comprehensive program analytics
     */
    private function calculateProgramAnalytics($program)
    {
        $totalBeneficiaries = $program->beneficiaries->count();
        $totalItems = $program->beneficiaries->sum(function($b) { return $b->items->count(); });
        $distributedItems = $program->beneficiaries->sum(function($b) { 
            return $b->items->where('status', 'distributed')->count(); 
        });
        $pendingItems = $program->beneficiaries->sum(function($b) { 
            return $b->items->where('status', 'pending')->count(); 
        });
        $unclaimedItems = $program->beneficiaries->sum(function($b) { 
            return $b->items->where('status', 'unclaimed')->count(); 
        });

        $totalValue = $program->beneficiaries->sum(function($b) { 
            return $b->items->sum('total_value'); 
        });
        $distributedValue = $program->beneficiaries->sum(function($b) { 
            return $b->items->where('status', 'distributed')->sum('total_value'); 
        });

        // Calculate beneficiary completion statuses
        $completedBeneficiaries = 0;
        $mixedBeneficiaries = 0;
        $pendingBeneficiaries = 0;
        $unclaimedBeneficiaries = 0;
        $cancelledBeneficiaries = 0;

        foreach ($program->beneficiaries as $beneficiary) {
            $status = $this->getBeneficiaryDistributionStatus($beneficiary->items);
            switch ($status) {
                case 'completed': $completedBeneficiaries++; break;
                case 'mixed': $mixedBeneficiaries++; break;
                case 'pending': $pendingBeneficiaries++; break;
                case 'unclaimed': $unclaimedBeneficiaries++; break;
                case 'cancelled': $cancelledBeneficiaries++; break;
            }
        }

        return [
            'progress_summary' => [
                'total_items' => $totalItems,
                'distributed_items' => $distributedItems,
                'pending_items' => $pendingItems,
                'unclaimed_items' => $unclaimedItems,
                'completion_rate' => $totalItems > 0 ? round(($distributedItems / $totalItems) * 100, 2) : 0,
                'distribution_rate' => $totalItems > 0 ? round((($distributedItems + $unclaimedItems) / $totalItems) * 100, 2) : 0
            ],
            'value_summary' => [
                'total_value' => (float) $totalValue,
                'distributed_value' => (float) $distributedValue,
                'pending_value' => (float) ($totalValue - $distributedValue),
                'value_completion_rate' => $totalValue > 0 ? round(($distributedValue / $totalValue) * 100, 2) : 0
            ],
            'beneficiary_summary' => [
                'total_beneficiaries' => $totalBeneficiaries,
                'completed_beneficiaries' => $completedBeneficiaries,
                'mixed_beneficiaries' => $mixedBeneficiaries,
                'pending_beneficiaries' => $pendingBeneficiaries,
                'unclaimed_beneficiaries' => $unclaimedBeneficiaries,
                'cancelled_beneficiaries' => $cancelledBeneficiaries,
                'beneficiary_completion_rate' => $totalBeneficiaries > 0 
                    ? round(($completedBeneficiaries / $totalBeneficiaries) * 100, 2) : 0
            ],
            'timeline_info' => [
                'days_elapsed' => $this->getDaysElapsed($program->start_date),
                'days_remaining' => $this->getDaysRemaining($program->end_date),
                'program_duration' => $this->getProgramDuration($program->start_date, $program->end_date)
            ]
        ];
    }

    /**
     * Determine beneficiary distribution status
     * Returns: 'completed', 'mixed', 'pending', 'unclaimed', 'cancelled'
     */
    private function getBeneficiaryDistributionStatus($items)
    {
        $total = $items->count();
        $distributed = $items->where('status', 'distributed')->count();
        $pending = $items->where('status', 'pending')->count();
        $unclaimed = $items->where('status', 'unclaimed')->count();
        $cancelled = $items->where('status', 'cancelled')->count();

        // All items have same status
        if ($distributed === $total) {
            return 'completed';
        } elseif ($pending === $total) {
            return 'pending';
        } elseif ($unclaimed === $total) {
            return 'unclaimed';
        } elseif ($cancelled === $total) {
            return 'cancelled';
        } else {
            // Mixed statuses - some distributed, some not
            return 'mixed';
        }
    }

    /**
     * Get daily distribution progress for the program
     */
    private function getDailyDistributionProgress($program)
    {
        return DB::table('program_beneficiary_items')
            ->join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
            ->where('program_beneficiaries.subsidy_program_id', $program->id)
            ->where('program_beneficiary_items.status', 'distributed')
            ->whereNotNull('program_beneficiary_items.distributed_at')
            ->selectRaw('DATE(program_beneficiary_items.distributed_at) as date, COUNT(*) as items_distributed, SUM(program_beneficiary_items.total_value) as value_distributed')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function($day) {
                return [
                    'date' => $day->date,
                    'items_distributed' => (int) $day->items_distributed,
                    'value_distributed' => (float) $day->value_distributed
                ];
            });
    }

    /**
     * Get breakdown by item type/category
     */
    private function getItemTypeBreakdown($program)
    {
        $itemBreakdown = [];

        foreach ($program->beneficiaries as $beneficiary) {
            foreach ($beneficiary->items as $item) {
                $itemName = $item->item_name;
                
                if (!isset($itemBreakdown[$itemName])) {
                    $itemBreakdown[$itemName] = [
                        'item_name' => $itemName,
                        'unit' => $item->unit,
                        'assistance_type' => $item->assistance_type,
                        'total_quantity' => 0,
                        'distributed_quantity' => 0,
                        'pending_quantity' => 0,
                        'unclaimed_quantity' => 0,
                        'cancelled_quantity' => 0,
                        'total_value' => 0,
                        'distributed_value' => 0,
                        'beneficiary_count' => 0
                    ];
                }

                $itemBreakdown[$itemName]['total_quantity'] += $item->quantity;
                $itemBreakdown[$itemName]['total_value'] += $item->total_value ?? 0;

                if ($item->status === 'distributed') {
                    $itemBreakdown[$itemName]['distributed_quantity'] += $item->quantity;
                    $itemBreakdown[$itemName]['distributed_value'] += $item->total_value ?? 0;
                } elseif ($item->status === 'pending') {
                    $itemBreakdown[$itemName]['pending_quantity'] += $item->quantity;
                } elseif ($item->status === 'unclaimed') {
                    $itemBreakdown[$itemName]['unclaimed_quantity'] += $item->quantity;
                } elseif ($item->status === 'cancelled') {
                    $itemBreakdown[$itemName]['cancelled_quantity'] += $item->quantity;
                }
            }
        }

        // Add completion rates and beneficiary counts for each item
        foreach ($itemBreakdown as $itemName => &$item) {
            $item['completion_rate'] = $item['total_quantity'] > 0 
                ? round(($item['distributed_quantity'] / $item['total_quantity']) * 100, 2) 
                : 0;

            // Count unique beneficiaries for this item
            $item['beneficiary_count'] = $program->beneficiaries->sum(function($b) use ($itemName) {
                return $b->items->where('item_name', $itemName)->count() > 0 ? 1 : 0;
            });
        }

        return array_values($itemBreakdown);
    }

    /**
     * Get recent distributions across all programs (for dashboard)
     */
    private function getRecentDistributions($user)
    {
        $query = DB::table('program_beneficiary_items')
            ->join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
            ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
            ->join('beneficiary_details', 'program_beneficiaries.beneficiary_id', '=', 'beneficiary_details.id')
            ->join('users', 'beneficiary_details.user_id', '=', 'users.id')
            ->where('program_beneficiary_items.status', 'distributed')
            ->whereNotNull('program_beneficiary_items.distributed_at');

        // Role-based filtering
        if ($user->role === 'coordinator') {
            $query->where('subsidy_programs.created_by', $user->id);
        }

        return $query->select(
                'program_beneficiary_items.distributed_at',
                'program_beneficiary_items.item_name',
                'program_beneficiary_items.quantity',
                'program_beneficiary_items.unit',
                'program_beneficiary_items.total_value',
                'subsidy_programs.title as program_title',
                'users.fname',
                'users.lname',
                'beneficiary_details.barangay'
            )
            ->orderBy('program_beneficiary_items.distributed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($item) {
                return [
                    'distributed_at' => $item->distributed_at,
                    'item_name' => $item->item_name,
                    'quantity' => $item->quantity,
                    'unit' => $item->unit,
                    'total_value' => (float) $item->total_value,
                    'program_title' => $item->program_title,
                    'beneficiary_name' => $item->fname . ' ' . $item->lname,
                    'barangay' => $item->barangay
                ];
            });
    }

    /**
     * Calculate days elapsed since program start
     */
    private function getDaysElapsed($startDate)
    {
        return now()->diffInDays($startDate);
    }

    /**
     * Calculate days remaining until program end
     */
    private function getDaysRemaining($endDate)
    {
        $remaining = now()->diffInDays($endDate, false);
        return $remaining > 0 ? $remaining : 0;
    }

    /**
     * Calculate total program duration in days
     */
    private function getProgramDuration($startDate, $endDate)
    {
        return \Carbon\Carbon::parse($startDate)->diffInDays(\Carbon\Carbon::parse($endDate));
    }
}