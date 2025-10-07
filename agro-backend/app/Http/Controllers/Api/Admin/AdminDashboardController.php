<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\SubsidyProgram;
use App\Models\User; 

class AdminDashboardController extends Controller
{
    /**
     * Return total beneficiaries grouped by sector.
     */
    public function sectorBeneficiaries()
    {
        $sectors = Sector::with(['users' => function ($q) {
            $q->where('role', 'coordinator');
        }, 'users.beneficiaries'])->get();

        $data = $sectors->map(function ($sector) {
            $totalBeneficiaries = $sector->users->sum(function ($coordinator) {
                return $coordinator->beneficiaries->count();
            });

            return [
                'sector' => $sector->sector_name,
                'beneficiaries' => $totalBeneficiaries,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $data
        ]);
    }

    /**
     * Return beneficiaries per coordinator inside each sector.
     */
    public function coordinatorBreakdown()
    {
        $sectors = Sector::with(['users' => function ($q) {
            $q->where('role', 'coordinator');
        }, 'users.beneficiaries'])->get();

        $data = $sectors->map(function ($sector) {
            return [
                'sector' => $sector->sector_name,
                'coordinators' => $sector->users->map(function ($coordinator) {
                    return [
                        'coordinator'   => $coordinator->fname . ' ' . $coordinator->lname,
                        'beneficiaries' => $coordinator->beneficiaries->count()
                    ];
                })
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $data
        ]);
    }

    /**
     * Return programs created by coordinators grouped by sector with status breakdown.
     */
    public function sectorPrograms()
    {
        $sectors = Sector::with(['users' => function ($q) {
            $q->where('role', 'coordinator');
        }])->get();

        $data = $sectors->map(function ($sector) {
   
            $coordinators = $sector->users; 
            
            $coordinatorData = $coordinators->map(function ($coordinator) {
        
                $programs = SubsidyProgram::where('created_by', $coordinator->id)->get();
                
                return [
                    'coordinator' => $coordinator->fname . ' ' . $coordinator->lname,
                    'total_programs' => $programs->count(),
                    'status_breakdown' => [
                        'pending' => $programs->where('status', 'pending')->count(),
                        'ongoing' => $programs->where('status', 'ongoing')->count(),
                        'completed' => $programs->where('status', 'completed')->count(),
                        'cancelled' => $programs->where('status', 'cancelled')->count(),
                    ],
                    'approval_breakdown' => [
                        'pending' => $programs->where('approval_status', 'pending')->count(),
                        'approved' => $programs->where('approval_status', 'approved')->count(),
                        'rejected' => $programs->where('approval_status', 'rejected')->count(),
                    ]
                ];
            });

            // Calculate sector totals
            $allSectorPrograms = SubsidyProgram::whereIn('created_by', $coordinators->pluck('id'))->get();

            return [
                'sector' => $sector->sector_name,
                'total_coordinators' => $coordinators->count(),
                'sector_totals' => [
                    'total_programs' => $allSectorPrograms->count(),
                    'status_breakdown' => [
                        'pending' => $allSectorPrograms->where('status', 'pending')->count(),
                        'ongoing' => $allSectorPrograms->where('status', 'ongoing')->count(),
                        'completed' => $allSectorPrograms->where('status', 'completed')->count(),
                        'cancelled' => $allSectorPrograms->where('status', 'cancelled')->count(),
                    ],
                    'approval_breakdown' => [
                        'pending' => $allSectorPrograms->where('approval_status', 'pending')->count(),
                        'approved' => $allSectorPrograms->where('approval_status', 'approved')->count(),
                        'rejected' => $allSectorPrograms->where('approval_status', 'rejected')->count(),
                    ]
                ],
                'coordinators' => $coordinatorData
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Return coordinator performance metrics with optimized queries
     */
    public function coordinatorPerformance()
    {
        $coordinators = User::with(['sector'])
            ->where('role', 'coordinator')
            ->get();

        $data = $coordinators->map(function ($coordinator) {
            // Load all programs once with necessary relationships
            $programs = SubsidyProgram::where('created_by', $coordinator->id)
                ->with(['beneficiaries.items'])
                ->get();
            
            $totalPrograms = $programs->count();
            $completedPrograms = $programs->where('status', 'completed')->count();
            $ongoingPrograms = $programs->where('status', 'ongoing')->count();
            $successRate = $totalPrograms > 0 ? round(($completedPrograms / $totalPrograms) * 100, 2) : 0;
            
            // Reuse loaded programs for beneficiaries count
            $totalBeneficiaries = $programs->sum(function ($program) {
                return $program->beneficiaries->count();
            });

            // Reuse loaded programs for total value calculation
            $totalValue = $programs->sum(function ($program) {
                return $program->beneficiaries->sum(function ($beneficiary) {
                    return $beneficiary->items->sum('total_value');
                });
            });
            
            $averageValue = $totalPrograms > 0 ? $totalValue / $totalPrograms : 0;

            // Recent activity - separate query for date grouping
            $recentPrograms = SubsidyProgram::where('created_by', $coordinator->id)
                ->where('created_at', '>=', now()->subMonths(6))
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Trend calculation
            $lastThreeMonths = SubsidyProgram::where('created_by', $coordinator->id)
                ->where('created_at', '>=', now()->subMonths(3))
                ->count();
            
            $previousThreeMonths = SubsidyProgram::where('created_by', $coordinator->id)
                ->whereBetween('created_at', [now()->subMonths(6), now()->subMonths(3)])
                ->count();
            
            $trendPercentage = $previousThreeMonths > 0 
                ? round((($lastThreeMonths - $previousThreeMonths) / $previousThreeMonths) * 100, 2) 
                : ($lastThreeMonths > 0 ? 100 : 0);

            return [
                'coordinator_id' => $coordinator->id,
                'coordinator_name' => $coordinator->fname . ' ' . $coordinator->lname,
                'sector' => $coordinator->sector->sector_name ?? 'No Sector',
                'metrics' => [
                    'total_programs' => $totalPrograms,
                    'completed_programs' => $completedPrograms,
                    'ongoing_programs' => $ongoingPrograms,
                    'success_rate' => $successRate,
                    'total_beneficiaries' => $totalBeneficiaries,
                    'average_program_value' => round($averageValue, 2),
                    'trend_percentage' => $trendPercentage
                ],
                'recent_activity' => $recentPrograms->map(function ($item) {
                    return [
                        'month' => $item->month,
                        'programs_created' => $item->count
                    ];
                }),
                'status_breakdown' => [
                    'pending' => $programs->where('status', 'pending')->count(),
                    'ongoing' => $ongoingPrograms,
                    'completed' => $completedPrograms,
                    'cancelled' => $programs->where('status', 'cancelled')->count()
                ]
            ];
        });

        // Sort coordinators by composite performance score
        $sortedData = $data->sortByDesc(function ($coordinator) {
            return ($coordinator['metrics']['success_rate'] * 0.4) + 
                   ($coordinator['metrics']['total_programs'] * 0.3) + 
                   ($coordinator['metrics']['total_beneficiaries'] * 0.3);
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => $sortedData,
            'summary' => [
                'total_coordinators' => $data->count(),
                'total_programs' => $data->sum('metrics.total_programs'),
                'total_beneficiaries' => $data->sum('metrics.total_beneficiaries'),
                'average_success_rate' => round($data->avg('metrics.success_rate'), 2)
            ]
        ]);
    }
}