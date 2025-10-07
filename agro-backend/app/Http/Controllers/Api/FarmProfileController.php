<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FarmProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class FarmProfileController extends Controller
{
    /**
     * Store a newly created farm profile.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Debug: Log the incoming request data
            Log::info('Farm Profile Creation Request:', [
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $validator = Validator::make($request->all(), [
                'beneficiary_id' => 'required|exists:beneficiary_details,id',
                'livelihood_category_id' => 'required|exists:livelihood_categories,id'
            ]);

            if ($validator->fails()) {
                Log::error('Farm Profile Validation Failed:', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            Log::info('Farm Profile Validation Passed:', [
                'validated_data' => $validator->validated()
            ]);

            $farmProfile = FarmProfile::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $farmProfile->load(['beneficiaryDetail', 'livelihoodCategory']),
                'message' => 'Farm profile created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating farm profile: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create farm profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified farm profile.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $farmProfile = FarmProfile::with([
                'beneficiaryDetail',
                'livelihoodCategory',
                'farmParcels.sector'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $farmProfile,
                'message' => 'Farm profile retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching farm profile: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Farm profile not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified farm profile.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $farmProfile = FarmProfile::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'livelihood_category_id' => 'exists:livelihood_categories,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $farmProfile->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $farmProfile->load(['beneficiaryDetail', 'livelihoodCategory']),
                'message' => 'Farm profile updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating farm profile: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update farm profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}