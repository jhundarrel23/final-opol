<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RsbsaEnrollment;
use App\Models\BeneficiaryDetail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RsbsaEnrollmentController extends Controller
{
    // Barangay code mapping for Opol, Misamis Oriental
    private const BARANGAY_CODES = [
        'AWANG' => '001',
        'BAGOCBOC' => '002',
        'BARRA' => '003',
        'BONBON' => '004',
        'CAUYONAN' => '005',
        'IGPIT' => '006',
        'LIMONDA' => '007',
        'LUYONGBONBON' => '008',
        'MALANANG' => '009',
        'NANGCAON' => '010',
        'PATAG' => '011',
        'POBLACION' => '012',
        'TABOC' => '013',
        'TINGALAN' => '014',
    ];

    /**
     * Generate barangay-based reference code
     * Format: 10-43-21-XXX-YYYYYY
     * Example: 10-43-21-001-000001
     */
    private function generateReferenceCode($beneficiaryId)
    {
        $beneficiary = BeneficiaryDetail::findOrFail($beneficiaryId);
        
        // Normalize barangay name: uppercase and remove all spaces
        $barangayName = strtoupper(trim($beneficiary->barangay ?? ''));
        $barangayName = preg_replace('/\s+/', '', $barangayName);
        
        // Get barangay code
        $barangayCode = self::BARANGAY_CODES[$barangayName] ?? '999';
        
        // Debug log if barangay not found
        if ($barangayCode === '999') {
            Log::warning('Barangay code not found', [
                'original' => $beneficiary->barangay,
                'normalized' => $barangayName,
                'available_codes' => array_keys(self::BARANGAY_CODES)
            ]);
        }

        // Get next sequence number for this barangay
        $sequence = DB::table('rsbsa_enrollments')
            ->join('beneficiary_details', 'rsbsa_enrollments.beneficiary_id', '=', 'beneficiary_details.id')
            ->whereRaw('UPPER(REPLACE(beneficiary_details.barangay, " ", "")) = ?', [$barangayName])
            ->count() + 1;

        // Format: 10-43-21-XXX-YYYYYY
        return sprintf(
            '10-43-21-%s-%06d',
            $barangayCode,
            $sequence
        );
    }

    /**
     * Store a newly created enrollment.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $payload = $request->all();
            
            // Set defaults
            $payload['enrollment_year'] = $payload['enrollment_year'] ?? intval(date('Y'));
            $payload['enrollment_type'] = $payload['enrollment_type'] ?? 'new';
            $payload['application_status'] = $payload['application_status'] ?? 'pending';

            $validator = Validator::make($payload, [
                'user_id' => 'required|exists:users,id',
                'beneficiary_id' => 'required|exists:beneficiary_details,id',
                'farm_profile_id' => 'required|exists:farm_profiles,id',
                'enrollment_year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
                'enrollment_type' => 'required|in:new,renewal,update',
                'application_status' => 'required|in:pending,approved,rejected,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Generate barangay-based reference code
            $data['application_reference_code'] = $this->generateReferenceCode($data['beneficiary_id']);

            // Set status timestamps
            if (($data['application_status'] ?? null) === 'approved') {
                $data['approved_at'] = now();
            }
            if (($data['application_status'] ?? null) === 'rejected') {
                $data['rejected_at'] = now();
            }

            $enrollment = RsbsaEnrollment::create($data);

            return response()->json([
                'success' => true,
                'data' => $enrollment->load(['user', 'beneficiaryDetail', 'farmProfile']),
                'message' => 'RSBSA enrollment created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating RSBSA enrollment: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create RSBSA enrollment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing enrollment.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $enrollment = RsbsaEnrollment::findOrFail($id);

            // Prevent editing if not pending
            if ($enrollment->application_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This enrollment is locked and cannot be updated.'
                ], 403);
            }

            $payload = $request->all();
            $payload['enrollment_year'] = $payload['enrollment_year'] ?? intval(date('Y'));

            $validator = Validator::make($payload, [
                'beneficiary_id' => 'sometimes|required|exists:beneficiary_details,id',
                'farm_profile_id' => 'sometimes|required|exists:farm_profiles,id',
                'enrollment_year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
                'enrollment_type' => 'sometimes|required|in:new,renewal,update',
                'application_status' => 'sometimes|required|in:pending,approved,rejected,cancelled',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();

            // Handle timestamps if status is updated
            if (($data['application_status'] ?? null) === 'approved') {
                $data['approved_at'] = now();
            }
            if (($data['application_status'] ?? null) === 'rejected') {
                $data['rejected_at'] = now();
            }

            $enrollment->update($data);

            return response()->json([
                'success' => true,
                'data' => $enrollment->fresh()->load(['user', 'beneficiaryDetail', 'farmProfile']),
                'message' => 'RSBSA enrollment updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating RSBSA enrollment: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update RSBSA enrollment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get enrollment by user ID (latest).
     */
    public function getByUserId(string $userId): JsonResponse
    {
        try {
            $enrollment = RsbsaEnrollment::with([
                'user',
                'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
                'beneficiaryDetail.beneficiaryLivelihoods.farmerActivity',
                'beneficiaryDetail.beneficiaryLivelihoods.fisherfolkActivity',
                'beneficiaryDetail.beneficiaryLivelihoods.farmworkerActivity',
                'beneficiaryDetail.beneficiaryLivelihoods.agriYouthActivity',
                'farmProfile.farmParcels.commodities'
            ])->where('user_id', $userId)->latest()->first();

            if (!$enrollment) {
                return response()->json([
                    'success' => false,
                    'message' => 'No enrollment found for this user'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $enrollment,
                'message' => 'Enrollment retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching enrollment by user ID: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $userId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch enrollment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reference number for a user's latest enrollment.
     */
    public function getReferenceNumber(string $userId): JsonResponse
    {
        try {
            $enrollment = RsbsaEnrollment::where('user_id', $userId)
                ->whereNotNull('application_reference_code')
                ->latest('id')
                ->first();

            if (!$enrollment) {
                return response()->json([
                    'success' => false,
                    'message' => 'No enrollment with reference number found for this user',
                    'reference_number' => null
                ], 404);
            }

            return response()->json([
                'success' => true,
                'reference_number' => $enrollment->application_reference_code,
                'application_status' => $enrollment->application_status,
                'enrollment_year' => $enrollment->enrollment_year,
                'created_at' => $enrollment->created_at,
                'message' => 'Reference number retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching reference number: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $userId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reference number',
                'error' => $e->getMessage(),
                'reference_number' => null
            ], 500);
        }
    }

    /**
     * Check if user already has submitted enrollment (pending or approved).
     */
    public function application_status(string $userId): JsonResponse
    {
        try {
            $enrollment = RsbsaEnrollment::where('user_id', $userId)
                ->latest('id')
                ->first();

            $status = $enrollment?->application_status;
            $hasActive = in_array($status, ['pending', 'approved'], true);

            return response()->json([
                'success' => true,
                'has_active_enrollment' => $hasActive,
                'status' => $status,
                'message' => $enrollment
                    ? match ($status) {
                        'pending' => 'Application is under review.',
                        'approved' => 'Application approved.',
                        'rejected' => 'Application was rejected.',
                        'cancelled' => 'Application was cancelled.',
                        default => 'Unknown application status.'
                    }
                    : 'User can submit a new enrollment.',
                'reference_number' => $enrollment?->application_reference_code,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error checking active enrollment: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $userId,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to check enrollment status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel a pending enrollment by the beneficiary.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        try {
            $user = auth()->user();
            $enrollment = RsbsaEnrollment::findOrFail($id);

            if ($enrollment->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to cancel this enrollment.'
                ], 403);
            }

            if ($enrollment->application_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending applications can be cancelled.'
                ], 400);
            }

            $enrollment->application_status = 'cancelled';
            $enrollment->save();

            return response()->json([
                'success' => true,
                'message' => 'Enrollment cancelled successfully.',
                'data' => $enrollment
            ]);
        } catch (\Throwable $e) {
            Log::error('Error cancelling enrollment: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel enrollment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get barangay statistics (for admin dashboard)
     */
    public function getBarangayStatistics(): JsonResponse
    {
        try {
            $stats = [];

            foreach (self::BARANGAY_CODES as $barangay => $code) {
                $count = DB::table('rsbsa_enrollments')
                    ->join('beneficiary_details', 'rsbsa_enrollments.beneficiary_id', '=', 'beneficiary_details.id')
                    ->whereRaw('UPPER(REPLACE(beneficiary_details.barangay, " ", "")) = ?', [$barangay])
                    ->count();

                $stats[] = [
                    'barangay' => $barangay,
                    'code' => $code,
                    'reference_prefix' => "10-43-21-{$code}",
                    'enrollment_count' => $count,
                    'next_sequence' => str_pad($count + 1, 6, '0', STR_PAD_LEFT)
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'total_barangays' => count($stats),
                'total_enrollments' => array_sum(array_column($stats, 'enrollment_count'))
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}