<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FarmerActivity;
use App\Models\FisherfolkActivity;
use App\Models\FarmworkerActivity;
use App\Models\AgriYouthActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ActivityController extends Controller
{
    /**
     * Store farmer activities.
     */
    public function storeFarmerActivities(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_livelihood_id' => 'required|exists:beneficiary_livelihoods,id',
                'rice' => 'boolean',
                'corn' => 'boolean',
                'other_crops' => 'boolean',
                'other_crops_specify' => 'nullable|string|max:150',
                'livestock' => 'boolean',
                'livestock_specify' => 'nullable|string|max:150',
                'poultry' => 'boolean',
                'poultry_specify' => 'nullable|string|max:150'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $activity = FarmerActivity::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $activity->load('beneficiaryLivelihood'),
                'message' => 'Farmer activities created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating farmer activities: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create farmer activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store fisherfolk activities.
     */
    public function storeFisherfolkActivities(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_livelihood_id' => 'required|exists:beneficiary_livelihoods,id',
                'fish_capture' => 'boolean',
                'aquaculture' => 'boolean',
                'gleaning' => 'boolean',
                'fish_processing' => 'boolean',
                'fish_vending' => 'boolean',
                'others' => 'boolean',
                'others_specify' => 'nullable|string|max:150'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $activity = FisherfolkActivity::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $activity->load('beneficiaryLivelihood'),
                'message' => 'Fisherfolk activities created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating fisherfolk activities: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create fisherfolk activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store farmworker activities.
     */
    public function storeFarmworkerActivities(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_livelihood_id' => 'required|exists:beneficiary_livelihoods,id',
                'land_preparation' => 'boolean',
                'planting' => 'boolean',
                'cultivation' => 'boolean',
                'harvesting' => 'boolean',
                'others' => 'boolean',
                'others_specify' => 'nullable|string|max:150'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $activity = FarmworkerActivity::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $activity->load('beneficiaryLivelihood'),
                'message' => 'Farmworker activities created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating farmworker activities: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create farmworker activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store agri youth activities.
     */
    public function storeAgriYouthActivities(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'beneficiary_livelihood_id' => 'required|exists:beneficiary_livelihoods,id',
                'is_agri_youth' => 'boolean',
                'is_part_of_farming_household' => 'boolean',
                'is_formal_agri_course' => 'boolean',
                'is_nonformal_agri_course' => 'boolean',
                'is_agri_program_participant' => 'boolean',
                'others' => 'boolean',
                'others_specify' => 'nullable|string|max:150'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $activity = AgriYouthActivity::create($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $activity->load('beneficiaryLivelihood'),
                'message' => 'Agri youth activities created successfully'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating agri youth activities: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create agri youth activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}