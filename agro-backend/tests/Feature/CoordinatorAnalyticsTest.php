<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\FarmProfile;
use App\Models\FarmParcel;
use App\Models\Commodity;
use App\Models\CoordinatorBeneficiary;
use App\Models\RsbsaEnrollment;
use App\Models\FarmParcelCommodity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CoordinatorAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_coordinator_analytics_summarizes_assigned_beneficiaries_and_area()
    {
        // Create a coordinator user
        $coordinator = User::factory()->create([
            'role' => 'coordinator',
        ]);

        // Create beneficiary user and related farm profile
        $beneficiary = User::factory()->create();
        $farmProfile = FarmProfile::create([
            'beneficiary_id' => $beneficiary->id,
            'livelihood_category_id' => null,
        ]);

        // Enrollment linked to farm profile
        $enrollment = RsbsaEnrollment::create([
            'user_id' => $beneficiary->id,
            'beneficiary_id' => null,
            'farm_profile_id' => $farmProfile->id,
            'application_reference_code' => 'REF-001',
            'enrollment_year' => 2025,
            'enrollment_type' => 'new',
            'application_status' => 'approved',
        ]);

        // Assign enrollment to coordinator
        CoordinatorBeneficiary::create([
            'coordinator_id' => $coordinator->id,
            'enrollment_id' => $enrollment->id,
            'assigned_at' => now(),
        ]);

        // Create parcels and parcel commodities
        $parcel = FarmParcel::create([
            'farm_profile_id' => $farmProfile->id,
            'sector_id' => null,
            'parcel_number' => 'P-1',
            'barangay' => 'Test',
            'total_farm_area' => 5.00,
            'tenure_type' => 'tenant',
        ]);

        // Commodity
        $commodity = Commodity::create([
            'commodity_name' => 'Rice',
            'category_id' => null,
            'sector_id' => null,
        ]);

        // Two commodity allocations with different farm types
        FarmParcelCommodity::create([
            'farm_parcel_id' => $parcel->id,
            'commodity_id' => $commodity->id,
            'size_hectares' => 2.50,
            'farm_type' => 'irrigated',
        ]);

        FarmParcelCommodity::create([
            'farm_parcel_id' => $parcel->id,
            'commodity_id' => $commodity->id,
            'size_hectares' => 1.25,
            'farm_type' => 'rainfed upland',
        ]);

        // Authenticate as coordinator using Sanctum
        Sanctum::actingAs($coordinator);

        $response = $this->getJson('/api/coordinator/analytics');

        $response->assertOk()
            ->assertJsonFragment([
                'assigned_beneficiaries' => 1,
            ]);

        $data = $response->json();

        $this->assertEquals(3.75, (float) $data['total_parcel_commodity_area_hectares']);
        $this->assertArrayHasKey('irrigated', $data['farm_type_breakdown']);
        $this->assertArrayHasKey('rainfed upland', $data['farm_type_breakdown']);
        $this->assertEquals(2.50, (float) $data['farm_type_breakdown']['irrigated']['total_area']);
        $this->assertEquals(1.25, (float) $data['farm_type_breakdown']['rainfed upland']['total_area']);
    }
}


