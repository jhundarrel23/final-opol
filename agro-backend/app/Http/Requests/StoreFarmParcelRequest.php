<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFarmParcelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check(); // Add your authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'parcels' => 'required|array|min:1',
            'parcels.*.farm_profile_id' => 'required|exists:farm_profiles,id',
            'parcels.*.sector_id' => 'required|exists:sectors,id',
            'parcels.*.parcel_number' => 'nullable|string|max:100',
            'parcels.*.barangay' => 'required|string|max:100',
            'parcels.*.total_farm_area' => 'required|numeric|min:0.01',
            'parcels.*.tenure_type' => 'required|in:registered_owner,tenant,lessee',
            'parcels.*.landowner_name' => 'nullable|string|max:255',
            'parcels.*.ownership_document_number' => 'nullable|string|max:255',
            'parcels.*.is_ancestral_domain' => 'boolean',
            'parcels.*.is_agrarian_reform_beneficiary' => 'boolean',
            'parcels.*.farm_type' => 'required|in:irrigated,rainfed upland,rainfed lowland',
            'parcels.*.is_organic_practitioner' => 'boolean',
            'parcels.*.remarks' => 'nullable|string',

            // Commodities validation
            'parcels.*.commodities' => 'required|array|min:1',
            'parcels.*.commodities.*.commodity_id' => 'required|exists:commodities,id',
            'parcels.*.commodities.*.size_hectares' => 'nullable|numeric|min:0',
            'parcels.*.commodities.*.number_of_heads' => 'nullable|integer|min:0',
            'parcels.*.commodities.*.farm_type' => 'nullable|string|in:irrigated,rainfed upland,rainfed lowland',
            'parcels.*.commodities.*.is_organic_practitioner' => 'boolean',
            'parcels.*.commodities.*.remarks' => 'nullable|string'
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        // Assuming commodities table has a `type` column (e.g. rice, corn, hvc, livestock, poultry)
        $validator->sometimes('parcels.*.commodities.*.size_hectares', 'required|numeric|min:0.01', function ($input, $item) {
            return in_array(optional($item)->commodity_id, ['rice', 'corn', 'hvc']);
        });

        $validator->sometimes('parcels.*.commodities.*.number_of_heads', 'required|integer|min:1', function ($input, $item) {
            return in_array(optional($item)->commodity_id, ['livestock', 'poultry']);
        });

      
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'parcels.*.total_farm_area.min' => 'Total farm area must be at least 0.01 hectares.',
            'parcels.*.commodities.*.commodity_id.required' => 'Commodity type is required for each commodity.',
            'parcels.*.commodities.*.commodity_id.exists' => 'Selected commodity does not exist.',
            'parcels.*.commodities.*.size_hectares.required' => 'Size in hectares is required for crop commodities.',
            'parcels.*.commodities.*.number_of_heads.required' => 'Number of heads is required for livestock/poultry.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'parcels.*.farm_profile_id' => 'farm profile',
            'parcels.*.total_farm_area' => 'total farm area',
            'parcels.*.commodities.*.commodity_id' => 'commodity type',
        ];
    }
}
