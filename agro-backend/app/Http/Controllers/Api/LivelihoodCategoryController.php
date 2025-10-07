<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LivelihoodCategory;
use Illuminate\Http\Request;

class LivelihoodCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $categories = LivelihoodCategory::all();
            
            return response()->json([
                'success' => true,
                'data' => $categories,
                'message' => 'Livelihood categories retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve livelihood categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}