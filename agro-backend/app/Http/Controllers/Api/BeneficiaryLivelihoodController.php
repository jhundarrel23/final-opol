<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BeneficiaryLivelihood;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BeneficiaryLivelihoodController extends Controller
{
    /**
     * Store a newly created beneficiary livelihood.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_id' => 'required|exists:beneficiary_details,id',
                'livelihood_category_id' => 'required|exists:livelihood_categories,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if relationship already exists
            $existing = BeneficiaryLivelihood::where('beneficiary_id', $request->beneficiary_id)
                ->where('livelihood_category_id', $request->livelihood_category_id)
                ->first();

            if ($existing) {
                // Check if user has any active (non-cancelled) enrollments
                $hasActiveEnrollment = \App\Models\RsbsaEnrollment::where('user_id', function($query) use ($request) {
                    $query->select('user_id')
                          ->from('beneficiary_details')
                          ->where('id', $request->beneficiary_id);
                })
                ->where('application_status', '!=', 'cancelled')
                ->exists();

                // If user has active enrollment, block the relationship
                if ($hasActiveEnrollment) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Beneficiary livelihood relationship already exists for active enrollment'
                    ], 409);
                }

                // For cancelled applications, return the existing record instead of creating new one
                return response()->json([
                    'success' => true,
                    'data' => $existing->load(['beneficiaryDetail', 'livelihoodCategory']),
                    'message' => 'Using existing livelihood relationship from cancelled application',
                    'warning' => 'This livelihood was previously associated with a cancelled enrollment'
                ], 200);
            }

            $beneficiaryLivelihood = BeneficiaryLivelihood::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $beneficiaryLivelihood->load(['beneficiaryDetail', 'livelihoodCategory']),
                'message' => 'Beneficiary livelihood created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating beneficiary livelihood: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create beneficiary livelihood',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get beneficiary livelihoods by beneficiary ID.
     */
    public function getByBeneficiary(string $beneficiaryId): JsonResponse
    {
        try {
            $livelihoods = BeneficiaryLivelihood::with([
                'livelihoodCategory',
                'farmerActivity',
                'fisherfolkActivity',
                'farmworkerActivity',
                'agriYouthActivity'
            ])->where('beneficiary_id', $beneficiaryId)->get();

            return response()->json([
                'success' => true,
                'data' => $livelihoods,
                'message' => 'Beneficiary livelihoods retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching beneficiary livelihoods: ' . $e->getMessage(), [
                'exception' => $e,
                'beneficiary_id' => $beneficiaryId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiary livelihoods',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}