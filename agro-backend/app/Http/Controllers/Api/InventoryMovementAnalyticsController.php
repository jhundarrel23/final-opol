<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\InventoryStock;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventoryMovementAnalyticsController extends Controller
{
    /**
     * Overall summary of inventory movements
     */
    public function summary()
    {
        try {
            $totalIn = InventoryStock::where('movement_type', 'stock_in')->sum('quantity');
            $totalOut = InventoryStock::whereIn('movement_type', ['stock_out', 'distribution'])->sum('quantity');
            $currentStock = Inventory::sum('current_stock');
            $stockInValue = InventoryStock::where('movement_type', 'stock_in')->sum('total_value');
            $stockOutValue = InventoryStock::whereIn('movement_type', ['stock_out', 'distribution'])->sum('total_value');

            return response()->json([
                'total_in' => (float) $totalIn,
                'total_out' => (float) $totalOut,
                'current_stock' => (float) $currentStock,
                'stock_in_value' => (float) $stockInValue,
                'stock_out_value' => (float) $stockOutValue,
                'net_movement' => (float) ($totalIn - $totalOut),
                'turnover_rate' => $stockInValue > 0 ? (float) (($stockOutValue / $stockInValue) * 100) : 0,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch summary data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Movement trends over time (stock in and stock out by date).
     */
    public function trends(Request $request)
    {
        try {
            $timeRange = (int) $request->query('time_range', 30);
            $startDate = now()->subDays($timeRange)->startOfDay();
            $endDate = now()->endOfDay();

            $data = InventoryStock::select(
                    DB::raw('DATE(transaction_date) as date'),
                    DB::raw("SUM(CASE WHEN movement_type = 'stock_in' THEN quantity ELSE 0 END) as total_in"),
                    DB::raw("SUM(CASE WHEN movement_type IN ('stock_out','distribution') THEN quantity ELSE 0 END) as total_out"),
                    DB::raw("SUM(CASE WHEN movement_type = 'stock_in' THEN total_value ELSE 0 END) as value_in"),
                    DB::raw("SUM(CASE WHEN movement_type IN ('stock_out','distribution') THEN total_value ELSE 0 END) as value_out")
                )
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->groupBy(DB::raw('DATE(transaction_date)'))
                ->orderBy('date')
                ->get();

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch trends data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Top items by stock movement value with enhanced data
     */
    public function topItems()
    {
        try {
            $data = InventoryStock::select(
                    'inventory_id',
                    DB::raw("SUM(CASE WHEN movement_type = 'stock_in' THEN quantity ELSE 0 END) as total_in"),
                    DB::raw("SUM(CASE WHEN movement_type IN ('stock_out','distribution') THEN quantity ELSE 0 END) as total_out"),
                    DB::raw("SUM(total_value) as total_value"),
                    DB::raw("AVG(unit_cost) as avg_unit_cost")
                )
                ->groupBy('inventory_id')
                ->with(['inventory' => function($query) {
                    $query->select('id', 'item_name', 'unit', 'current_stock', 'minimum_stock', 'maximum_stock');
                }])
                ->orderByDesc('total_value')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'inventory_id' => $item->inventory_id,
                        'total_in' => (int) $item->total_in,
                        'total_out' => (int) $item->total_out,
                        'total_value' => (float) $item->total_value,
                        'avg_unit_cost' => (float) $item->avg_unit_cost,
                        'current_stock' => $item->inventory ? (int) $item->inventory->current_stock : 0,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit,
                            'current_stock' => (int) $item->inventory->current_stock,
                            'minimum_stock' => (int) $item->inventory->minimum_stock,
                            'maximum_stock' => (int) $item->inventory->maximum_stock,
                        ] : null
                    ];
                });

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch top items data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Items that are expiring soon with enhanced information
     */
    public function expiringSoon()
    {
        try {
            $threshold = now()->addDays(30);

            $data = InventoryStock::whereNotNull('expiry_date')
                ->where('expiry_date', '>=', now())
                ->where('expiry_date', '<=', $threshold)
                ->with(['inventory' => function($query) {
                    $query->select('id', 'item_name', 'unit');
                }])
                ->select('*', DB::raw('DATEDIFF(expiry_date, NOW()) as days_until_expiry'))
                ->orderBy('expiry_date')
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'inventory_id' => $item->inventory_id,
                        'batch_number' => $item->batch_number,
                        'quantity' => (int) $item->quantity,
                        'expiry_date' => $item->expiry_date,
                        'days_until_expiry' => (int) $item->days_until_expiry,
                        'total_value' => (float) $item->total_value,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit,
                        ] : null
                    ];
                });

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch expiring items data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Stock levels distribution (Critical, Low, Optimal, Excess)
     */
    public function stockLevels()
    {
        try {
            $critical = Inventory::whereColumn('current_stock', '<=', 'minimum_stock')
                ->where('current_stock', '>', 0)->count();
                
            $outOfStock = Inventory::where('current_stock', '=', 0)->count();
            
            $low = Inventory::where('current_stock', '>', DB::raw('minimum_stock'))
                ->where('current_stock', '<=', DB::raw('minimum_stock * 1.2'))
                ->count();
                
            $excess = Inventory::whereColumn('current_stock', '>', 'maximum_stock')->count();
            
            $optimal = Inventory::where('current_stock', '>', DB::raw('minimum_stock * 1.2'))
                ->whereColumn('current_stock', '<=', 'maximum_stock')
                ->count();

            return response()->json([
                'critical' => $critical + $outOfStock,
                'low' => $low,
                'optimal' => $optimal,
                'excess' => $excess,
                'out_of_stock' => $outOfStock
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch stock levels data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transaction types distribution
     */
    public function transactionTypes(Request $request)
    {
        try {
            $timeRange = (int) $request->query('time_range', 30);
            $startDate = now()->subDays($timeRange)->startOfDay();
            $endDate = now()->endOfDay();

            $data = InventoryStock::whereBetween('transaction_date', [$startDate, $endDate])
                ->select('transaction_type')
                ->selectRaw('COUNT(*) as count, SUM(quantity) as total_quantity, SUM(total_value) as total_value')
                ->groupBy('transaction_type')
                ->orderByDesc('total_quantity')
                ->get()
                ->map(function ($item) {
                    return [
                        'transaction_type' => $item->transaction_type ?: 'Unknown',
                        'count' => (int) $item->count,
                        'total_quantity' => (float) $item->total_quantity,
                        'total_value' => (float) $item->total_value
                    ];
                });

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch transaction types data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete dashboard endpoint with all analytics data
     */
    public function dashboard(Request $request)
    {
        try {
            $timeRange = (int) $request->query('time_range', 30);
            $startDate = now()->subDays($timeRange)->startOfDay();
            $endDate = now()->endOfDay();

            // Summary Statistics
            $totalIn = InventoryStock::whereBetween('transaction_date', [$startDate, $endDate])
                ->where('movement_type', 'stock_in')->sum('quantity');
            $totalOut = InventoryStock::whereBetween('transaction_date', [$startDate, $endDate])
                ->whereIn('movement_type', ['stock_out', 'distribution'])->sum('quantity');
            $stockInValue = InventoryStock::whereBetween('transaction_date', [$startDate, $endDate])
                ->where('movement_type', 'stock_in')->sum('total_value');
            $stockOutValue = InventoryStock::whereBetween('transaction_date', [$startDate, $endDate])
                ->whereIn('movement_type', ['stock_out', 'distribution'])->sum('total_value');
            $currentStock = Inventory::sum('current_stock');

            $summary = [
                'total_in' => (float) $totalIn,
                'total_out' => (float) $totalOut,
                'stock_in_value' => (float) $stockInValue,
                'stock_out_value' => (float) $stockOutValue,
                'current_stock' => (float) $currentStock,
                'net_movement' => (float) ($totalIn - $totalOut),
                'turnover_rate' => $stockInValue > 0 ? (float) (($stockOutValue / $stockInValue) * 100) : 0,
            ];

            // Transaction Types Distribution
            $transactionTypes = InventoryStock::whereBetween('transaction_date', [$startDate, $endDate])
                ->select('transaction_type')
                ->selectRaw('COUNT(*) as count, SUM(quantity) as total_quantity, SUM(total_value) as total_value')
                ->groupBy('transaction_type')
                ->orderByDesc('total_quantity')
                ->get()
                ->map(function ($item) {
                    return [
                        'transaction_type' => $item->transaction_type ?: 'Unknown',
                        'count' => (int) $item->count,
                        'total_quantity' => (float) $item->total_quantity,
                        'total_value' => (float) $item->total_value
                    ];
                });

            // Top Items by Value
            $topItemsByValue = InventoryStock::with(['inventory' => function($query) {
                    $query->select('id', 'item_name', 'unit', 'current_stock', 'minimum_stock', 'maximum_stock');
                }])
                ->whereBetween('transaction_date', [$startDate, $endDate])
                ->select('inventory_id')
                ->selectRaw('
                    SUM(CASE WHEN movement_type = "stock_in" THEN quantity ELSE 0 END) as total_in,
                    SUM(CASE WHEN movement_type IN ("stock_out","distribution") THEN quantity ELSE 0 END) as total_out,
                    SUM(total_value) as total_value,
                    AVG(unit_cost) as avg_unit_cost
                ')
                ->groupBy('inventory_id')
                ->orderByDesc('total_value')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'inventory_id' => $item->inventory_id,
                        'total_in' => (int) $item->total_in,
                        'total_out' => (int) $item->total_out,
                        'total_value' => (float) $item->total_value,
                        'avg_unit_cost' => (float) $item->avg_unit_cost,
                        'current_stock' => $item->inventory ? (int) $item->inventory->current_stock : 0,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit,
                            'current_stock' => (int) $item->inventory->current_stock,
                            'minimum_stock' => (int) $item->inventory->minimum_stock,
                            'maximum_stock' => (int) $item->inventory->maximum_stock,
                        ] : null
                    ];
                });

            // Stock Levels Distribution
            $critical = Inventory::whereColumn('current_stock', '<=', 'minimum_stock')
                ->where('current_stock', '>', 0)->count();
            $outOfStock = Inventory::where('current_stock', '=', 0)->count();
            $low = Inventory::where('current_stock', '>', DB::raw('minimum_stock'))
                ->where('current_stock', '<=', DB::raw('minimum_stock * 1.2'))
                ->count();
            $excess = Inventory::whereColumn('current_stock', '>', 'maximum_stock')->count();
            $optimal = Inventory::where('current_stock', '>', DB::raw('minimum_stock * 1.2'))
                ->whereColumn('current_stock', '<=', 'maximum_stock')
                ->count();

            $stockLevels = [
                'critical' => $critical + $outOfStock,
                'low' => $low,
                'optimal' => $optimal,
                'excess' => $excess,
                'out_of_stock' => $outOfStock
            ];

            // Expiring Items
            $expiringThreshold = now()->addDays(30);
            $expiringItems = InventoryStock::whereNotNull('expiry_date')
                ->where('expiry_date', '>=', now())
                ->where('expiry_date', '<=', $expiringThreshold)
                ->with(['inventory' => function($query) {
                    $query->select('id', 'item_name', 'unit');
                }])
                ->select('*', DB::raw('DATEDIFF(expiry_date, NOW()) as days_until_expiry'))
                ->orderBy('expiry_date')
                ->limit(20)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'inventory_id' => $item->inventory_id,
                        'batch_number' => $item->batch_number,
                        'quantity' => (int) $item->quantity,
                        'expiry_date' => $item->expiry_date,
                        'days_until_expiry' => (int) $item->days_until_expiry,
                        'total_value' => (float) $item->total_value,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit,
                        ] : null
                    ];
                });

            // Inventory Health (items with potential issues)
            $inventoryHealth = Inventory::select('id', 'item_name', 'current_stock', 'minimum_stock', 'maximum_stock', 'unit')
                ->where(function($query) {
                    $query->whereColumn('current_stock', '<=', 'minimum_stock')
                          ->orWhereColumn('current_stock', '>', 'maximum_stock')
                          ->orWhere('current_stock', 0);
                })
                ->limit(20)
                ->get()
                ->map(function ($item) {
                    $status = 'optimal';
                    if ($item->current_stock == 0) {
                        $status = 'out_of_stock';
                    } elseif ($item->current_stock <= $item->minimum_stock) {
                        $status = 'critical';
                    } elseif ($item->current_stock > $item->maximum_stock) {
                        $status = 'excess';
                    }
                    
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'current_stock' => (int) $item->current_stock,
                        'minimum_stock' => (int) $item->minimum_stock,
                        'maximum_stock' => (int) $item->maximum_stock,
                        'unit' => $item->unit,
                        'status' => $status
                    ];
                });

            return response()->json([
                'success' => true,
                'time_range' => $timeRange,
                'period' => [
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString()
                ],
                'summary' => $summary,
                'transaction_types' => $transactionTypes,
                'top_items_by_value' => $topItemsByValue,
                'inventory_health' => $inventoryHealth,
                'stock_levels' => $stockLevels,
                'expiring_items' => $expiringItems,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch dashboard data',
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
}