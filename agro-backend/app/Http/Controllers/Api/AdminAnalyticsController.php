<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryStock;
use App\Models\SubsidyProgram;
use App\Models\ProgramBeneficiary;
use App\Models\ProgramBeneficiaryItem;
use App\Models\User;
use App\Models\BeneficiaryDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminAnalyticsController extends Controller
{
    /**
     * Get comprehensive dashboard overview
     */
    public function dashboardOverview()
    {
        return response()->json([
            'inventory_summary' => $this->getInventorySummary(),
            'program_summary' => $this->getProgramSummary(),
            'beneficiary_summary' => $this->getBeneficiarySummary(),
            'financial_summary' => $this->getFinancialSummary(),
            'recent_activity' => $this->getRecentActivity()
        ]);
    }

    /**
     * Get detailed inventory analytics
     */
    public function inventoryAnalytics(Request $request)
    {
        $period = $request->get('period', '30'); // days
        $itemType = $request->get('item_type');
        
        return response()->json([
            'stock_levels' => $this->getStockLevels($itemType),
            'low_stock_alerts' => $this->getLowStockAlerts(),
            'stock_movements' => $this->getStockMovements($period, $itemType),
            'value_analysis' => $this->getInventoryValueAnalysis($itemType),
            'turnover_rates' => $this->getStockTurnoverRates($period, $itemType),
            'expiry_analysis' => $this->getExpiryAnalysis()
        ]);
    }

    /**
     * Get program performance analytics
     */
    public function programAnalytics(Request $request)
    {
        $period = $request->get('period', '90'); // days
        $status = $request->get('status');
        
        return response()->json([
            'program_performance' => $this->getProgramPerformance($period, $status),
            'completion_rates' => $this->getProgramCompletionRates($period),
            'distribution_efficiency' => $this->getDistributionEfficiency($period),
            'coordinator_performance' => $this->getCoordinatorPerformance($period),
            'geographic_distribution' => $this->getGeographicDistribution($period),
            'item_popularity' => $this->getItemPopularity($period)
        ]);
    }

    /**
     * Get beneficiary analytics
     */
    public function beneficiaryAnalytics(Request $request)
    {
        $period = $request->get('period', '180'); // days
        
        return response()->json([
            'beneficiary_demographics' => $this->getBeneficiaryDemographics(),
            'assistance_distribution' => $this->getAssistanceDistribution($period),
            'geographic_coverage' => $this->getGeographicCoverage(),
            'repeat_beneficiaries' => $this->getRepeatBeneficiaries($period),
            'beneficiary_value_distribution' => $this->getBeneficiaryValueDistribution($period)
        ]);
    }

    /**
     * Get financial analytics
     */
    public function financialAnalytics(Request $request)
    {
        $period = $request->get('period', '90'); // days
        
        return response()->json([
            'total_inventory_value' => $this->getTotalInventoryValue(),
            'distribution_value_trends' => $this->getDistributionValueTrends($period),
            'cost_per_beneficiary' => $this->getCostPerBeneficiary($period),
            'budget_utilization' => $this->getBudgetUtilization($period),
            'value_by_category' => $this->getValueByCategory($period)
        ]);
    }

    // ===== PRIVATE HELPER METHODS =====

    private function getInventorySummary()
    {
        $totalItems = Inventory::count();
        $totalStockValue = Inventory::with('stocks')->get()->sum(function ($inventory) {
            return $inventory->current_stock * ($inventory->unit_value ?? 0);
        });
        
        $lowStockCount = Inventory::with('stocks')->get()->filter(function ($inventory) {
            return $inventory->current_stock < 10; // threshold
        })->count();

        $recentMovements = InventoryStock::where('created_at', '>=', Carbon::now()->subDays(7))->count();

        return [
            'total_items' => $totalItems,
            'total_stock_value' => round($totalStockValue, 2),
            'low_stock_items' => $lowStockCount,
            'recent_movements_7days' => $recentMovements
        ];
    }

    private function getProgramSummary()
    {
        $totalPrograms = SubsidyProgram::count();
        $activePrograms = SubsidyProgram::where('status', 'ongoing')->count();
        $completedPrograms = SubsidyProgram::where('status', 'completed')->count();
        $pendingApproval = SubsidyProgram::where('approval_status', 'pending')->count();
        
        return [
            'total_programs' => $totalPrograms,
            'active_programs' => $activePrograms,
            'completed_programs' => $completedPrograms,
            'pending_approval' => $pendingApproval,
            'completion_rate' => $totalPrograms > 0 ? round(($completedPrograms / $totalPrograms) * 100, 1) : 0
        ];
    }

    private function getBeneficiarySummary()
    {
        $totalBeneficiaries = BeneficiaryDetail::count();
        $activeBeneficiaries = ProgramBeneficiary::distinct('beneficiary_id')->count();
        $uniqueBarangays = BeneficiaryDetail::distinct('barangay')->count();
        
        return [
            'total_registered_beneficiaries' => $totalBeneficiaries,
            'active_beneficiaries' => $activeBeneficiaries,
            'barangays_covered' => $uniqueBarangays,
            'coverage_rate' => $totalBeneficiaries > 0 ? round(($activeBeneficiaries / $totalBeneficiaries) * 100, 1) : 0
        ];
    }

    private function getFinancialSummary()
    {
        $totalDistributedValue = ProgramBeneficiaryItem::where('status', 'distributed')
            ->sum('total_value');
            
        $pendingValue = ProgramBeneficiaryItem::where('status', 'pending')
            ->sum('total_value');
            
        $averagePerBeneficiary = ProgramBeneficiary::join('program_beneficiary_items', 'program_beneficiaries.id', '=', 'program_beneficiary_items.program_beneficiary_id')
            ->where('program_beneficiary_items.status', 'distributed')
            ->groupBy('program_beneficiaries.id')
            ->selectRaw('SUM(program_beneficiary_items.total_value) as total')
            ->get()
            ->avg('total');

        return [
            'total_distributed_value' => round($totalDistributedValue, 2),
            'pending_distribution_value' => round($pendingValue, 2),
            'average_per_beneficiary' => round($averagePerBeneficiary ?? 0, 2)
        ];
    }

    private function getRecentActivity()
    {
        $recentStockMovements = InventoryStock::with(['inventory', 'transactor'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($stock) {
                return [
                    'type' => 'stock_movement',
                    'description' => "{$stock->movement_type} - {$stock->inventory->item_name}",
                    'quantity' => $stock->quantity,
                    'user' => $stock->transactor->fname . ' ' . $stock->transactor->lname,
                    'date' => $stock->created_at->format('M d, Y H:i')
                ];
            });

        $recentPrograms = SubsidyProgram::with('creator')
            ->latest()
            ->limit(3)
            ->get()
            ->map(function ($program) {
                return [
                    'type' => 'program_activity',
                    'description' => "Program: {$program->title}",
                    'status' => $program->status,
                    'user' => $program->creator->fname . ' ' . $program->creator->lname,
                    'date' => $program->created_at->format('M d, Y H:i')
                ];
            });

        return $recentStockMovements->merge($recentPrograms)->sortByDesc('date')->values();
    }

    private function getStockLevels($itemType = null)
    {
        $query = Inventory::with('stocks');
        
        if ($itemType) {
            $query->where('item_type', $itemType);
        }

        return $query->get()->map(function ($inventory) {
            return [
                'id' => $inventory->id,
                'item_name' => $inventory->item_name,
                'item_type' => $inventory->item_type,
                'unit' => $inventory->unit,
                'current_stock' => $inventory->current_stock,
                'unit_value' => $inventory->unit_value,
                'total_value' => $inventory->current_stock * ($inventory->unit_value ?? 0),
                'stock_status' => $inventory->current_stock < 10 ? 'low' : ($inventory->current_stock < 50 ? 'medium' : 'good')
            ];
        });
    }

    private function getLowStockAlerts()
    {
        return Inventory::with('stocks')
            ->get()
            ->filter(function ($inventory) {
                return $inventory->current_stock < 10; // configurable threshold
            })
            ->map(function ($inventory) {
                return [
                    'id' => $inventory->id,
                    'item_name' => $inventory->item_name,
                    'current_stock' => $inventory->current_stock,
                    'unit' => $inventory->unit,
                    'alert_level' => $inventory->current_stock == 0 ? 'critical' : 'warning'
                ];
            })
            ->values();
    }

    private function getStockMovements($period, $itemType = null)
    {
        $query = InventoryStock::with('inventory')
            ->where('created_at', '>=', Carbon::now()->subDays($period));
            
        if ($itemType) {
            $query->whereHas('inventory', function ($q) use ($itemType) {
                $q->where('item_type', $itemType);
            });
        }

        return $query->selectRaw('movement_type, COUNT(*) as count, SUM(ABS(quantity)) as total_quantity')
            ->groupBy('movement_type')
            ->orderBy('count', 'desc')
            ->get();
    }


    private function getStockTurnoverRates($period, $itemType = null)
    {
        $query = InventoryStock::with('inventory')
            ->where('created_at', '>=', Carbon::now()->subDays($period))
            ->where('movement_type', 'stock_out');
            
        if ($itemType) {
            $query->whereHas('inventory', function ($q) use ($itemType) {
                $q->where('item_type', $itemType);
            });
        }

        return $query->selectRaw('inventory_id, SUM(ABS(quantity)) as total_out')
            ->groupBy('inventory_id')
            ->with('inventory')
            ->get()
            ->map(function ($stock) {
                $avgStock = $stock->inventory->current_stock; // simplified
                $turnoverRate = $avgStock > 0 ? $stock->total_out / $avgStock : 0;
                
                return [
                    'item_name' => $stock->inventory->item_name,
                    'total_distributed' => $stock->total_out,
                    'current_stock' => $avgStock,
                    'turnover_rate' => round($turnoverRate, 2)
                ];
            })
            ->sortByDesc('turnover_rate')
            ->values();
    }

    private function getExpiryAnalysis()
    {
        $now = Carbon::now();
        
        return [
            'expired_items' => InventoryStock::where('expiry_date', '<', $now)
                ->where('running_balance', '>', 0)
                ->with('inventory')
                ->get()
                ->groupBy('inventory_id')
                ->map(function ($stocks, $inventoryId) {
                    $inventory = $stocks->first()->inventory;
                    return [
                        'item_name' => $inventory->item_name,
                        'expired_quantity' => $stocks->sum('quantity'),
                        'expiry_date' => $stocks->min('expiry_date')
                    ];
                })
                ->values(),
            'expiring_soon' => InventoryStock::whereBetween('expiry_date', [$now, $now->copy()->addDays(30)])
                ->where('running_balance', '>', 0)
                ->with('inventory')
                ->get()
                ->map(function ($stock) {
                    return [
                        'item_name' => $stock->inventory->item_name,
                        'quantity' => $stock->quantity,
                        'expiry_date' => $stock->expiry_date,
                        'days_until_expiry' => Carbon::parse($stock->expiry_date)->diffInDays()
                    ];
                })
        ];
    }

    private function getProgramPerformance($period, $status = null)
    {
        $query = SubsidyProgram::with(['beneficiaries.items'])
            ->where('created_at', '>=', Carbon::now()->subDays($period));
            
        if ($status) {
            $query->where('status', $status);
        }

        return $query->get()->map(function ($program) {
            $totalItems = $program->beneficiaries->sum(function ($b) {
                return $b->items->count();
            });
            $distributedItems = $program->beneficiaries->sum(function ($b) {
                return $b->items->where('status', 'distributed')->count();
            });
            
            return [
                'id' => $program->id,
                'title' => $program->title,
                'status' => $program->status,
                'total_beneficiaries' => $program->beneficiaries->count(),
                'total_items' => $totalItems,
                'distributed_items' => $distributedItems,
                'completion_percentage' => $totalItems > 0 ? round(($distributedItems / $totalItems) * 100, 1) : 0,
                'created_at' => $program->created_at->format('M d, Y')
            ];
        });
    }

    private function getProgramCompletionRates($period)
    {
        return SubsidyProgram::where('created_at', '>=', Carbon::now()->subDays($period))
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->status => $item->count];
            });
    }

    private function getDistributionEfficiency($period)
    {
        $items = ProgramBeneficiaryItem::where('created_at', '>=', Carbon::now()->subDays($period));
        
        $total = $items->count();
        $distributed = $items->where('status', 'distributed')->count();
        $pending = $items->where('status', 'pending')->count();
        
        return [
            'total_items' => $total,
            'distributed_items' => $distributed,
            'pending_items' => $pending,
            'distribution_rate' => $total > 0 ? round(($distributed / $total) * 100, 1) : 0,
            'average_processing_time' => $this->getAverageProcessingTime($period)
        ];
    }

    private function getCoordinatorPerformance($period)
    {
        return User::where('role', 'coordinator')
            ->with(['beneficiaryDetail'])
            ->get()
            ->map(function ($coordinator) use ($period) {
                $programsCreated = SubsidyProgram::where('created_by', $coordinator->id)
                    ->where('created_at', '>=', Carbon::now()->subDays($period))
                    ->count();
                    
                $stockTransactions = InventoryStock::where('transacted_by', $coordinator->id)
                    ->where('created_at', '>=', Carbon::now()->subDays($period))
                    ->count();
                
                return [
                    'coordinator_name' => $coordinator->fname . ' ' . $coordinator->lname,
                    'programs_created' => $programsCreated,
                    'stock_transactions' => $stockTransactions,
                    'sector' => $coordinator->sector->sector_name ?? 'N/A'
                ];
            })
            ->sortByDesc('programs_created')
            ->values();
    }

    
    private function getItemPopularity($period)
    {
        return ProgramBeneficiaryItem::join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
            ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
            ->where('subsidy_programs.created_at', '>=', Carbon::now()->subDays($period))
            ->selectRaw('item_name, assistance_type, COUNT(*) as request_count, SUM(quantity) as total_quantity')
            ->groupBy('item_name', 'assistance_type')
            ->orderBy('request_count', 'desc')
            ->limit(20)
            ->get();
    }

   

    private function getAssistanceDistribution($period)
    {
        return ProgramBeneficiaryItem::join('program_beneficiaries', 'program_beneficiary_items.program_beneficiary_id', '=', 'program_beneficiaries.id')
            ->join('subsidy_programs', 'program_beneficiaries.subsidy_program_id', '=', 'subsidy_programs.id')
            ->where('subsidy_programs.created_at', '>=', Carbon::now()->subDays($period))
            ->selectRaw('assistance_type, COUNT(*) as count, SUM(total_value) as total_value')
            ->groupBy('assistance_type')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->assistance_type => [
                    'count' => $item->count,
                    'total_value' => round($item->total_value ?? 0, 2)
                ]];
            });
    }

  

}