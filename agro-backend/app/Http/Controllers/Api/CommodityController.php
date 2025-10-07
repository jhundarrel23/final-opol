<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commodity;
use App\Models\CommodityCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommodityController extends Controller
{
   
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Commodity::with(['category', 'sector']);

          
            if ($request->has('category')) {
                $query->byCategory($request->category);
            }

         
            if ($request->has('sector_id')) {
                $query->bySector($request->sector_id);
            }

        
            if ($request->has('search')) {
                $query->where('commodity_name', 'LIKE', '%' . $request->search . '%');
            }

            $commodities = $query->orderBy('commodity_name')->get();

       
            $transformedCommodities = $commodities->map(function ($commodity) {
                return [
                    'id' => $commodity->id,
                    'commodity_name' => $commodity->commodity_name,
                    'display_name' => $commodity->commodity_name . ' (' . $commodity->category->category_name . ')',
                    'category' => [
                        'id' => $commodity->category->id,
                        'name' => $commodity->category->category_name
                    ],
                    'sector' => $commodity->sector ? [
                        'id' => $commodity->sector->id,
                        'name' => $commodity->sector->sector_name
                    ] : null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedCommodities,
                'message' => 'Commodities retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve commodities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

 
    public function getByCategory(): JsonResponse
    {
        try {
            $categories = CommodityCategory::with(['commodities.sector'])
                ->orderBy('category_name')
                ->get();

            $groupedCommodities = $categories->map(function ($category) {
                return [
                    'category_id' => $category->id,
                    'category_name' => $category->category_name,
                    'commodities' => $category->commodities->map(function ($commodity) {
                        return [
                            'id' => $commodity->id,
                            'commodity_name' => $commodity->commodity_name,
                            'sector' => $commodity->sector ? [
                                'id' => $commodity->sector->id,
                                'name' => $commodity->sector->sector_name
                            ] : null
                        ];
                    })
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $groupedCommodities,
                'message' => 'Commodities grouped by category retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve grouped commodities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all commodity categories
     */
    public function getCategories(): JsonResponse
    {
        try {
            $categories = CommodityCategory::orderBy('category_name')->get();

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Commodity categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve commodity categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific commodity with its relationships
     */
    public function show(Commodity $commodity): JsonResponse
    {
        try {
            $commodity->load(['category', 'sector']);

            $data = [
                'id' => $commodity->id,
                'commodity_name' => $commodity->commodity_name,
                'category' => [
                    'id' => $commodity->category->id,
                    'name' => $commodity->category->category_name
                ],
                'sector' => $commodity->sector ? [
                    'id' => $commodity->sector->id,
                    'name' => $commodity->sector->sector_name
                ] : null,
                'created_at' => $commodity->created_at,
                'updated_at' => $commodity->updated_at
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Commodity retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve commodity',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}