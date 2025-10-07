<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BeneficiaryDetail;
use App\Models\RsbsaEnrollment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class BeneficiaryDetailsController extends Controller
{
    /**
     * Display a listing of beneficiary details.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = BeneficiaryDetail::with(['user', 'beneficiaryLivelihoods.livelihoodCategory']);

            // Apply filters
            if ($request->has('barangay')) {
                $query->byBarangay($request->barangay);
            }
            
            $beneficiaries = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $beneficiaries,
                'message' => 'Beneficiary details retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching beneficiary details: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiary details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created beneficiary detail.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            Log::info('Beneficiary Details Creation Request:', [
                'request_data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'rsbsa_number' => 'nullable|string|max:50|unique:beneficiary_details,rsbsa_number',
                'barangay' => 'required|string|max:100',
                'municipality' => 'nullable|string|max:100',
                'province' => 'nullable|string|max:100',
                'region' => 'nullable|string|max:100',
                'contact_number' => 'required|string|max:20',
                'emergency_contact_number' => 'nullable|string|max:20',
                'birth_date' => 'required|date|before_or_equal:today',
                'place_of_birth' => 'nullable|string|max:255',
                'sex' => 'required|in:male,female',
                'civil_status' => 'nullable|in:single,married,widowed,separated,divorced',
                'highest_education' => 'nullable|in:None,Pre-school,Elementary,Junior High School,Senior High School,Vocational,College,Post Graduate',
                'religion' => 'nullable|string|max:100', 
                'has_government_id' => 'nullable|in:yes,no',
                'is_association_member' => 'nullable|in:yes,no',
                'mothers_maiden_name' => 'nullable|string|max:150',	
                'is_pwd' => 'nullable|boolean',
                'is_household_head' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                Log::error('Beneficiary Details Validation Failed:', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = array_merge(
                $validator->validated(),
                [
                    'municipality' => $request->municipality ?? 'Opol',
                    'province' => $request->province ?? 'Misamis Oriental',
                    'region' => $request->region ?? 'Region X (Northern Mindanao)',
                ]
            );

            BeneficiaryDetail::upsert(
                [$data],
                ['user_id'],
                array_keys($data)
            );

            // Fetch the saved record
            $beneficiaryDetail = BeneficiaryDetail::where('user_id', $data['user_id'])
                ->with(['user', 'beneficiaryLivelihoods'])
                ->first();

            return response()->json([
                'success' => true,
                'data' => $beneficiaryDetail,
                'message' => 'Beneficiary detail saved successfully (insert/update)'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error saving beneficiary detail: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save beneficiary detail',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified beneficiary detail.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $beneficiaryDetail = BeneficiaryDetail::with([
                'user',
                'beneficiaryLivelihoods.livelihoodCategory',
                'beneficiaryLivelihoods.farmerActivity',
                'beneficiaryLivelihoods.fisherfolkActivity',
                'beneficiaryLivelihoods.farmworkerActivity',
                'beneficiaryLivelihoods.agriYouthActivity',
                'farmProfiles.farmParcels',
                'rsbsaEnrollments'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $beneficiaryDetail,
                'message' => 'Beneficiary detail retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching beneficiary detail: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Beneficiary detail not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get beneficiary detail by user ID.
     */
    public function getByUserId(string $userId): JsonResponse
    {
        try {
            $beneficiaryDetail = BeneficiaryDetail::with([
                'user',
                'beneficiaryLivelihoods.livelihoodCategory',
                'beneficiaryLivelihoods.farmerActivity',
                'beneficiaryLivelihoods.fisherfolkActivity',
                'beneficiaryLivelihoods.farmworkerActivity',
                'beneficiaryLivelihoods.agriYouthActivity',
                'farmProfiles.farmParcels',
                'rsbsaEnrollments'
            ])->where('user_id', $userId)->first();

            if (!$beneficiaryDetail) {
                return response()->json([
                    'success' => false,
                    'message' => 'No beneficiary detail found for this user'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $beneficiaryDetail,
                'message' => 'Beneficiary detail retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching beneficiary detail by user ID: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $userId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch beneficiary detail',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified beneficiary detail.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $beneficiaryDetail = BeneficiaryDetail::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'rsbsa_number' => 'nullable|string|max:50|unique:beneficiary_details,rsbsa_number,' . $id,
                'barangay' => 'string|max:100',
                'municipality' => 'string|max:100',
                'province' => 'string|max:100',
                'region' => 'string|max:100',
                'contact_number' => 'string|max:20',
                'emergency_contact_number' => 'nullable|string|max:20',
                'birth_date' => 'date',
                'place_of_birth' => 'nullable|string|max:150',
                'sex' => 'in:male,female',
                'civil_status' => 'nullable|in:single,married,widowed,separated,divorced',
                'name_of_spouse' => 'nullable|string|max:150',
                'highest_education' => 'nullable|in:None,Pre-school,Elementary,Junior High School,Senior High School,Vocational,College,Post Graduate',
                'religion' => 'nullable|string|max:100',
                'is_pwd' => 'boolean',
                'has_government_id' => 'in:yes,no',
                'gov_id_type' => 'nullable|string|max:100',
                'gov_id_number' => 'nullable|string|max:100',
                'is_association_member' => 'in:yes,no',
                'association_name' => 'nullable|string|max:200',
                'mothers_maiden_name' => 'nullable|string|max:150',
                'is_household_head' => 'boolean',
                'household_head_name' => 'nullable|string|max:150'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $beneficiaryDetail->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $beneficiaryDetail->load(['user', 'beneficiaryLivelihoods']),
                'message' => 'Beneficiary detail updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating beneficiary detail: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update beneficiary detail',
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

    public function checkEnrollmentStatus($userId): JsonResponse
    {
        try {
            // Find beneficiary details using user_id
            $beneficiaryDetails = BeneficiaryDetail::where('user_id', $userId)->first();
            
            if (!$beneficiaryDetails) {
                return response()->json([
                    'success' => true,
                    'data' => ['application_status' => 'not_enrolled'],
                    'message' => 'User not enrolled'
                ]);
            }

            // Get latest enrollment record
            $latestEnrollment = RsbsaEnrollment::where('beneficiary_id', $beneficiaryDetails->id)
                ->latest('created_at')
                ->first();

            $status = $latestEnrollment ? $latestEnrollment->application_status : 'not_enrolled';

            return response()->json([
                'success' => true,
                'data' => [
                    'application_status' => $status,
                    'application_reference_code' => $latestEnrollment?->application_reference_code,
                    'approved_at' => $latestEnrollment?->approved_at
                ],
                'message' => 'Status retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving status',
                'data' => ['application_status' => 'error']
            ], 500);
        }
    }
}