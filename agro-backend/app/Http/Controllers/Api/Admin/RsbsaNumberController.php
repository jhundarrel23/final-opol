<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BeneficiaryDetail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;

class RsbsaNumberController extends Controller
{
    /**
     * Get all beneficiaries with RSBSA number status.
     */
    public function getAllBeneficiaries(Request $request): JsonResponse
    {
        try {
            $beneficiaries = BeneficiaryDetail::with(['user:id,fname,lname,email', 'farmProfile'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($beneficiary) {
                    $name = isset($beneficiary->user)
                        ? trim(($beneficiary->user->fname ?? '') . ' ' . ($beneficiary->user->lname ?? ''))
                        : 'N/A';

                    return [
                        'id' => $beneficiary->id,
                        'user_id' => $beneficiary->user_id,
                        'name' => $name,
                        'email' => $beneficiary->user->email ?? 'N/A',
                        'barangay' => $beneficiary->barangay,
                        'municipality' => $beneficiary->municipality,
                        'rsbsa_number' => $beneficiary->rsbsa_number,
                        'rsbsa_status' => $this->getRsbsaStatus($beneficiary),
                        'created_at' => $beneficiary->created_at,
                        'updated_at' => $beneficiary->updated_at
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $beneficiaries,
                'message' => 'Beneficiaries retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching beneficiaries: ' . $e->getMessage(), [
                'exception' => $e
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiaries',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign RSBSA number to beneficiary.
     */
    public function assignOfficialRsbsa(Request $request, int $beneficiaryId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'rsbsa_number' => 'required|string|max:50',
                'overwrite' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $beneficiary = BeneficiaryDetail::findOrFail($beneficiaryId);
            $newNumber = trim($request->rsbsa_number);
            
            // Check if beneficiary already has RSBSA number
            if ($beneficiary->rsbsa_number && !$request->boolean('overwrite')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary already has an RSBSA number',
                    'code' => 'ALREADY_HAS_RSBSA'
                ], 400);
            }

            // Check if number is taken by another beneficiary
            $conflict = BeneficiaryDetail::where('rsbsa_number', $newNumber)
                ->where('id', '!=', $beneficiaryId)
                ->first();

            if ($conflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'RSBSA number already assigned to another beneficiary',
                    'code' => 'NUMBER_TAKEN'
                ], 422);
            }

            $beneficiary->rsbsa_number = $newNumber;
            $beneficiary->save();

            $fresh = $beneficiary->fresh(['user:id,fname,lname,email']);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $fresh->id,
                    'user_id' => $fresh->user_id,
                    'name' => isset($fresh->user) ? trim(($fresh->user->fname ?? '') . ' ' . ($fresh->user->lname ?? '')) : 'N/A',
                    'email' => $fresh->user->email ?? 'N/A',
                    'barangay' => $fresh->barangay,
                    'municipality' => $fresh->municipality,
                    'rsbsa_number' => $fresh->rsbsa_number,
                ],
                'message' => 'RSBSA number assigned successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error assigning RSBSA: ' . $e->getMessage(), [
                'exception' => $e,
                'beneficiary_id' => $beneficiaryId,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to assign RSBSA number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update RSBSA number for beneficiary.
     */
    public function updateOfficialRsbsa(Request $request, int $beneficiaryId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'rsbsa_number' => 'required|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $beneficiary = BeneficiaryDetail::findOrFail($beneficiaryId);
            $newNumber = trim($request->rsbsa_number);

            // Check if another beneficiary has this number
            $conflict = BeneficiaryDetail::where('rsbsa_number', $newNumber)
                ->where('id', '!=', $beneficiaryId)
                ->first();

            if ($conflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'RSBSA number already assigned to another beneficiary',
                    'code' => 'NUMBER_TAKEN'
                ], 422);
            }

            $beneficiary->rsbsa_number = $newNumber;
            $beneficiary->save();

            $fresh = $beneficiary->fresh(['user:id,fname,lname,email']);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $fresh->id,
                    'user_id' => $fresh->user_id,
                    'name' => isset($fresh->user) ? trim(($fresh->user->fname ?? '') . ' ' . ($fresh->user->lname ?? '')) : 'N/A',
                    'email' => $fresh->user->email ?? 'N/A',
                    'barangay' => $fresh->barangay,
                    'municipality' => $fresh->municipality,
                    'rsbsa_number' => $fresh->rsbsa_number,
                ],
                'message' => 'RSBSA number updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating RSBSA: ' . $e->getMessage(), [
                'exception' => $e,
                'beneficiary_id' => $beneficiaryId,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update RSBSA number',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check RSBSA number availability.
     */
    public function checkRsbsaAvailability(string $rsbsaNumber): JsonResponse
    {
        try {
            $exists = BeneficiaryDetail::where('rsbsa_number', $rsbsaNumber)->exists();

            return response()->json([
                'success' => true,
                'available' => !$exists,
                'message' => $exists ? 'RSBSA number already exists' : 'RSBSA number is available'
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking RSBSA availability: ' . $e->getMessage(), [
                'exception' => $e,
                'rsbsa_number' => $rsbsaNumber
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to check RSBSA availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Determine RSBSA status for display.
     */
    private function getRsbsaStatus(BeneficiaryDetail $beneficiary): string
    {
        return $beneficiary->rsbsa_number ? 'assigned' : 'pending';
    }
}