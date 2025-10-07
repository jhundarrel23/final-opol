<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FarmParcel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;


class FarmParcelController extends Controller
{
    /**
     * Store a single farm parcel with commodities.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'farm_profile_id' => 'required|exists:farm_profiles,id',
                'parcel_number' => 'nullable|string|max:100',
                'barangay' => 'required|string|max:100',
                'total_farm_area' => 'required|numeric|min:0.01',
                'tenure_type' => 'required|in:registered_owner,tenant,lessee',
                'landowner_name' => 'nullable|string|max:255',
                'ownership_document_number' => 'nullable|string|max:255',
                'ownership_document_type' => 'nullable|string|in:certificate_of_land_transfer,emancipation_patent,individual_cloa,collective_cloa,co_ownership_cloa,agricultural_sales_patent,homestead_patent,free_patent,certificate_of_title,certificate_ancestral_domain_title,certificate_ancestral_land_title,tax_declaration,others',
                'is_ancestral_domain' => 'boolean',
                'is_agrarian_reform_beneficiary' => 'boolean',
                'remarks' => 'nullable|string',

                'commodities' => 'array',
                'commodities.*.commodity_id' => 'required|exists:commodities,id',
                'commodities.*.size_hectares' => 'nullable|numeric|min:0',
                'commodities.*.number_of_heads' => 'nullable|integer|min:0',
                'commodities.*.farm_type' => 'nullable|string|in:irrigated,rainfed upland,rainfed lowland',
                'commodities.*.is_organic_practitioner' => 'nullable|boolean',
                'commodities.*.remarks' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $data = $validator->validated();
            $commodities = $data['commodities'] ?? [];
            $parcelData = collect($data)->except(['commodities'])->toArray();

            $farmParcel = FarmParcel::create($parcelData);

            if (!empty($commodities)) {
                // Prepare pivot data for many-to-many relationship
                $pivotData = [];
                foreach ($commodities as $commodity) {
                    $pivotData[$commodity['commodity_id']] = [
                        'size_hectares' => $commodity['size_hectares'] ?? 0,
                        'number_of_heads' => $commodity['number_of_heads'] ?? 0,
                        'farm_type' => $commodity['farm_type'] ?? null,
                        'is_organic_practitioner' => (bool)($commodity['is_organic_practitioner'] ?? false),
                        'remarks' => $commodity['remarks'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                
                // Attach commodities with pivot data
                $farmParcel->commodities()->attach($pivotData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $farmParcel->load(['farmProfile', 'commodities']),
                'message' => 'Farm parcel created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating farm parcel: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create farm parcel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store multiple farm parcels (each with commodities).
     */
    public function storeBulk(Request $request): JsonResponse
    {
        try {
            Log::info('=== Farm Parcels Bulk Creation Request ===', ['data' => $request->all()]);

            $validator = Validator::make($request->all(), [
                'parcels' => 'required|array|min:1',
                'parcels.*.farm_profile_id' => 'required|exists:farm_profiles,id',
                'parcels.*.parcel_number' => 'nullable|string|max:100',
                'parcels.*.barangay' => 'required|string|max:100',
                'parcels.*.total_farm_area' => 'required|numeric|min:0.01',
                'parcels.*.tenure_type' => 'required|in:registered_owner,tenant,lessee',
                'parcels.*.landowner_name' => 'nullable|string|max:255',
                'parcels.*.ownership_document_number' => 'nullable|string|max:255',
                'parcels.*.ownership_document_type' => 'nullable|string|in:certificate_of_land_transfer,emancipation_patent,individual_cloa,collective_cloa,co_ownership_cloa,agricultural_sales_patent,homestead_patent,free_patent,certificate_of_title,certificate_ancestral_domain_title,certificate_ancestral_land_title,tax_declaration,others',
                'parcels.*.is_ancestral_domain' => 'boolean',
                'parcels.*.is_agrarian_reform_beneficiary' => 'boolean',
                'parcels.*.remarks' => 'nullable|string',

                'parcels.*.commodities' => 'required|array|min:1',
                'parcels.*.commodities.*.commodity_id' => 'required|exists:commodities,id',
                'parcels.*.commodities.*.size_hectares' => 'nullable|numeric|min:0',
                'parcels.*.commodities.*.number_of_heads' => 'nullable|integer|min:0',
                'parcels.*.commodities.*.farm_type' => 'nullable|string|in:irrigated,rainfed upland,rainfed lowland',
                'parcels.*.commodities.*.is_organic_practitioner' => 'boolean',
                'parcels.*.commodities.*.remarks' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                Log::error('=== Farm Parcels Validation Failed ===', ['errors' => $validator->errors()->toArray()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // DEBUG: Log validated data after validation passes
            Log::info('=== VALIDATION PASSED - RAW REQUEST DATA ===', [
                'request_all' => $request->all(),
                'request_parcels' => $request->input('parcels'),
                'validated_data' => $validator->validated()
            ]);

            DB::beginTransaction();
            $createdParcels = [];

            foreach ($request->parcels as $index => $parcelData) {
                // DEBUG: Log detailed parcel processing
                Log::info('=== PROCESSING PARCEL ===', [
                    'index' => $index,
                    'ownership_document_type' => $parcelData['ownership_document_type'] ?? 'NOT_SET',
                    'ownership_document_type_type' => gettype($parcelData['ownership_document_type'] ?? null),
                    'ownership_document_number' => $parcelData['ownership_document_number'] ?? 'NOT_SET',
                    'full_parcel_data' => $parcelData
                ]);

                $commodities = $parcelData['commodities'] ?? [];
                unset($parcelData['commodities']);

                // Ensure booleans
                $parcelData['is_ancestral_domain'] = (bool) ($parcelData['is_ancestral_domain'] ?? false);
                $parcelData['is_agrarian_reform_beneficiary'] = (bool) ($parcelData['is_agrarian_reform_beneficiary'] ?? false);

                // DEBUG: Log final data before creation
                Log::info('=== FINAL PARCEL DATA BEFORE CREATE ===', [
                    'index' => $index,
                    'final_parcel_data' => $parcelData,
                    'ownership_document_type_final' => $parcelData['ownership_document_type'] ?? 'NOT_SET_FINAL',
                    'ownership_document_type_exists' => array_key_exists('ownership_document_type', $parcelData),
                    'ownership_document_type_value' => isset($parcelData['ownership_document_type']) ? $parcelData['ownership_document_type'] : 'KEY_NOT_SET'
                ]);

                $parcel = FarmParcel::create($parcelData);

                // DEBUG: Log what was actually created
                Log::info('=== PARCEL CREATED ===', [
                    'index' => $index,
                    'created_parcel_id' => $parcel->id,
                    'created_ownership_document_type' => $parcel->ownership_document_type,
                    'created_ownership_document_type_raw' => $parcel->getRawOriginal('ownership_document_type'),
                    'created_parcel_attributes' => $parcel->getAttributes(),
                    'created_parcel_data' => $parcel->toArray()
                ]);

                if (!empty($commodities)) {
                    // Prepare pivot data for many-to-many relationship
                    $pivotData = [];
                    foreach ($commodities as $commodityData) {
                        $commodityData['is_organic_practitioner'] = (bool) ($commodityData['is_organic_practitioner'] ?? false);
                        
                        $pivotData[$commodityData['commodity_id']] = [                       
                            'size_hectares' => $commodityData['size_hectares'] ?? 0,
                            'number_of_heads' => $commodityData['number_of_heads'] ?? 0,
                            'farm_type' => $commodityData['farm_type'] ?? null,
                            'is_organic_practitioner' => $commodityData['is_organic_practitioner'],
                            'remarks' => $commodityData['remarks'] ?? null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                    
                    // Attach commodities with pivot data
                    $parcel->commodities()->attach($pivotData);
                }

                $createdParcels[] = $parcel->load(['farmProfile', 'commodities']);
            }

            DB::commit();

            // DEBUG: Log final response
            Log::info('=== FARM PARCELS CREATED SUCCESSFULLY ===', [
                'total_parcels_created' => count($createdParcels),
                'created_parcels_ownership_types' => array_map(function($parcel) {
                    return [
                        'id' => $parcel->id,
                        'ownership_document_type' => $parcel->ownership_document_type
                    ];
                }, $createdParcels)
            ]);

            return response()->json([
                'success' => true,
                'data' => $createdParcels,
                'message' => 'Farm parcels created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('=== Error creating farm parcels ===', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create farm parcels',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified farm parcel.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $farmParcel = FarmParcel::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'parcel_number' => 'nullable|string|max:100',
                'barangay' => 'string|max:100',
                'total_farm_area' => 'numeric|min:0.01',
                'tenure_type' => 'in:registered_owner,tenant,lessee',
                'landowner_name' => 'nullable|string|max:255',
                'ownership_document_number' => 'nullable|string|max:255',
                'ownership_document_type' => 'nullable|string|in:certificate_of_land_transfer,emancipation_patent,individual_cloa,collective_cloa,co_ownership_cloa,agricultural_sales_patent,homestead_patent,free_patent,certificate_of_title,certificate_ancestral_domain_title,certificate_ancestral_land_title,tax_declaration,others',
                'is_ancestral_domain' => 'boolean',
                'is_agrarian_reform_beneficiary' => 'boolean', 
                'remarks' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $farmParcel->update($validator->validated());

            return response()->json([
                'success' => true,
                'data' => $farmParcel->load(['farmProfile', 'commodities']),
                'message' => 'Farm parcel updated successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating farm parcel: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id,
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update farm parcel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified farm parcel.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $farmParcel = FarmParcel::findOrFail($id);
            $farmParcel->delete();

            return response()->json([
                'success' => true,
                'message' => 'Farm parcel deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting farm parcel: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete farm parcel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function forUser(string $userId): \Illuminate\Http\JsonResponse
    {
        $enrollment = \App\Models\RsbsaEnrollment::with([
            'farmProfile.farmParcels.commodities'
        ])->where('user_id', $userId)->latest()->first();

        if (!$enrollment || !$enrollment->farmProfile) {
            return response()->json([
                'success' => true,
                'data' => [],
                'total_count' => 0,
                'message' => 'No farm profile or parcels found for this user'
            ]);
        }

        $parcels = $enrollment->farmProfile->farmParcels;

        return response()->json([
            'success' => true,
            'data' => $parcels->load(['commodities']),
            'total_count' => $parcels->count(),
            'message' => 'Farm parcels retrieved successfully'
        ]);
    }
}