<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sector;
use App\Models\LivelihoodCategory;
use App\Models\CommodityCategory;
use App\Models\Commodity;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class ReferenceDataController extends Controller
{
    public function getSectors(Request $request): JsonResponse
    {
        try {
            $query = Sector::query();

            if ($request->filled('active_only')) {
                $query->active(); // make sure you have an `active` scope
            }

            $sectors = $query->orderBy('sector_name')->get(); // <- column corrected

            return response()->json([
                'success' => true,
                'data' => $sectors,
                'message' => 'Sectors retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching sectors: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sectors',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLivelihoodCategories(Request $request): JsonResponse
    {
        try {
            $query = LivelihoodCategory::query();

            if ($request->filled('active_only')) {
                $query->where('status', 'active');
            }

            $categories = $query->orderBy('category_name')->get(); // <- column corrected

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Livelihood categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching livelihood categories: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch livelihood categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCommodityCategories(Request $request): JsonResponse
    {
        try {
            $query = CommodityCategory::query();

            if ($request->filled('active_only')) {
                $query->where('status', 'active');
            }

            $categories = $query->orderBy('category_name')->get(); // <- column corrected

            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Commodity categories retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching commodity categories: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch commodity categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCommodities(Request $request): JsonResponse
{
    try {
        $query = Commodity::with(['category', 'sector']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('sector_id')) {
            $query->where('sector_id', $request->input('sector_id'));
        }

        if ($request->filled('active_only')) {
            $query->where('status', 'active');
        }

        $commodities = $query->orderBy('commodity_name')->get();

        // Transform data for frontend
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
        Log::error('Error fetching commodities: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch commodities',
            'error' => $e->getMessage()
        ], 500);
    }
}
}
