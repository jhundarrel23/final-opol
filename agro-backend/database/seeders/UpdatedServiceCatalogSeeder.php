<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceCatalog;
use App\Models\Sector;

class UpdatedServiceCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * This seeder creates service catalogs aligned with the actual sectors
     * in the system: Farmer, Farmworker, Fisherfolk, Agri-Youth
     */
    public function run(): void
    {
        // Get sector IDs
        $farmerSector = Sector::where('sector_name', 'Farmer')->first();
        $farmworkerSector = Sector::where('sector_name', 'Farmworker')->first();
        $fisherfolkSector = Sector::where('sector_name', 'Fisherfolk')->first();
        $agriYouthSector = Sector::where('sector_name', 'Agri-Youth')->first();

        // Check if sectors exist
        if (!$farmerSector || !$farmworkerSector || !$fisherfolkSector || !$agriYouthSector) {
            $this->command->error('Sectors not found! Please run SectorSeeder first.');
            return;
        }

        $services = [
            // ==========================================
            // FARMER SECTOR SERVICES
            // ==========================================
            [
                'name' => 'Rice Seed Distribution',
                'sector_id' => $farmerSector->id,
                'unit' => 'kg',
                'description' => 'Distribution of certified rice seeds to farmers',
                'is_active' => true,
            ],
            [
                'name' => 'Corn Seed Distribution',
                'sector_id' => $farmerSector->id,
                'unit' => 'kg',
                'description' => 'Distribution of hybrid corn seeds',
                'is_active' => true,
            ],
            [
                'name' => 'Fertilizer Distribution',
                'sector_id' => $farmerSector->id,
                'unit' => 'bag',
                'description' => 'Distribution of fertilizers for crop production',
                'is_active' => true,
            ],
            [
                'name' => 'Pesticide Distribution',
                'sector_id' => $farmerSector->id,
                'unit' => 'liter',
                'description' => 'Distribution of pesticides for pest control',
                'is_active' => true,
            ],
            [
                'name' => 'Land Preparation Service',
                'sector_id' => $farmerSector->id,
                'unit' => 'hectare',
                'description' => 'Mechanical land preparation using tractors',
                'is_active' => true,
            ],
            [
                'name' => 'Soil Testing Service',
                'sector_id' => $farmerSector->id,
                'unit' => 'sample',
                'description' => 'Laboratory soil analysis for crop recommendations',
                'is_active' => true,
            ],
            [
                'name' => 'Crop Insurance Enrollment',
                'sector_id' => $farmerSector->id,
                'unit' => 'enrollment',
                'description' => 'Assistance in enrolling farmers in crop insurance programs',
                'is_active' => true,
            ],
            [
                'name' => 'Farm Mechanization Training',
                'sector_id' => $farmerSector->id,
                'unit' => 'session',
                'description' => 'Training on proper use of farm machinery',
                'is_active' => true,
            ],
            [
                'name' => 'Crop Production Training',
                'sector_id' => $farmerSector->id,
                'unit' => 'session',
                'description' => 'Training on modern crop production techniques',
                'is_active' => true,
            ],
            [
                'name' => 'Irrigation System Maintenance',
                'sector_id' => $farmerSector->id,
                'unit' => 'system',
                'description' => 'Maintenance and repair of irrigation systems',
                'is_active' => true,
            ],
            [
                'name' => 'Harvesting Service',
                'sector_id' => $farmerSector->id,
                'unit' => 'hectare',
                'description' => 'Mechanical harvesting using combine harvesters',
                'is_active' => true,
            ],
            [
                'name' => 'Post-Harvest Facility Access',
                'sector_id' => $farmerSector->id,
                'unit' => 'sack',
                'description' => 'Access to drying and storage facilities',
                'is_active' => true,
            ],

            // ==========================================
            // FARMWORKER SECTOR SERVICES
            // ==========================================
            [
                'name' => 'Livelihood Training',
                'sector_id' => $farmworkerSector->id,
                'unit' => 'session',
                'description' => 'Skills training for alternative livelihood',
                'is_active' => true,
            ],
            [
                'name' => 'Safety Equipment Distribution',
                'sector_id' => $farmworkerSector->id,
                'unit' => 'set',
                'description' => 'Personal protective equipment for farm workers',
                'is_active' => true,
            ],
            [
                'name' => 'Health and Safety Training',
                'sector_id' => $farmworkerSector->id,
                'unit' => 'session',
                'description' => 'Training on farm safety and health practices',
                'is_active' => true,
            ],
            [
                'name' => 'Skills Development Program',
                'sector_id' => $farmworkerSector->id,
                'unit' => 'session',
                'description' => 'Technical skills training for farm workers',
                'is_active' => true,
            ],
            [
                'name' => 'Work Tools Distribution',
                'sector_id' => $farmworkerSector->id,
                'unit' => 'set',
                'description' => 'Distribution of basic farm tools',
                'is_active' => true,
            ],
            [
                'name' => 'Emergency Financial Assistance',
                'sector_id' => $farmworkerSector->id,
                'unit' => 'assistance',
                'description' => 'Emergency financial support for farmworkers',
                'is_active' => true,
            ],

            // ==========================================
            // FISHERFOLK SECTOR SERVICES
            // ==========================================
            [
                'name' => 'Fingerling Distribution',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'piece',
                'description' => 'Distribution of fish fingerlings for culture',
                'is_active' => true,
            ],
            [
                'name' => 'Fish Feed Distribution',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'bag',
                'description' => 'Distribution of commercial fish feeds',
                'is_active' => true,
            ],
            [
                'name' => 'Fishing Gear Distribution',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'set',
                'description' => 'Distribution of fishing nets and gear',
                'is_active' => true,
            ],
            [
                'name' => 'Water Quality Testing',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'sample',
                'description' => 'Laboratory testing of pond/sea water quality',
                'is_active' => true,
            ],
            [
                'name' => 'Pond Preparation Service',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'pond',
                'description' => 'Assistance in preparing fish ponds for stocking',
                'is_active' => true,
            ],
            [
                'name' => 'Aquaculture Training',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'session',
                'description' => 'Training on modern aquaculture techniques',
                'is_active' => true,
            ],
            [
                'name' => 'Fish Disease Management',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'visit',
                'description' => 'Technical assistance for fish health issues',
                'is_active' => true,
            ],
            [
                'name' => 'Boat Engine Repair',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'service',
                'description' => 'Repair and maintenance of fishing boat engines',
                'is_active' => true,
            ],
            [
                'name' => 'Life Vest Distribution',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'piece',
                'description' => 'Distribution of safety life vests',
                'is_active' => true,
            ],
            [
                'name' => 'Post-Harvest Training',
                'sector_id' => $fisherfolkSector->id,
                'unit' => 'session',
                'description' => 'Training on fish preservation and processing',
                'is_active' => true,
            ],

            // ==========================================
            // AGRI-YOUTH SECTOR SERVICES
            // ==========================================
            [
                'name' => 'Agri-Entrepreneurship Training',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'session',
                'description' => 'Business training for young farmers',
                'is_active' => true,
            ],
            [
                'name' => 'Starter Kit Distribution',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'kit',
                'description' => 'Complete starter kits for young farmers',
                'is_active' => true,
            ],
            [
                'name' => 'Digital Agriculture Training',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'session',
                'description' => 'Training on smart farming and agri-tech',
                'is_active' => true,
            ],
            [
                'name' => 'Farm Internship Program',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'placement',
                'description' => 'Placement in model farms for hands-on experience',
                'is_active' => true,
            ],
            [
                'name' => 'Young Farmers Organization',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'membership',
                'description' => 'Support in forming youth farmer associations',
                'is_active' => true,
            ],
            [
                'name' => 'Agricultural Youth Camp',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'participant',
                'description' => 'Immersive agricultural training camps',
                'is_active' => true,
            ],
            [
                'name' => 'Mentorship Program',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'month',
                'description' => 'One-on-one mentoring with experienced farmers',
                'is_active' => true,
            ],
            [
                'name' => 'Financial Literacy Training',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'session',
                'description' => 'Training on farm financial management',
                'is_active' => true,
            ],
            [
                'name' => 'Market Access Support',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'linkage',
                'description' => 'Connecting youth farmers to markets',
                'is_active' => true,
            ],
            [
                'name' => 'Technology Equipment Distribution',
                'sector_id' => $agriYouthSector->id,
                'unit' => 'unit',
                'description' => 'Distribution of modern farm equipment',
                'is_active' => true,
            ],

            // ==========================================
            // CROSS-SECTOR SERVICES (Available to all)
            // ==========================================
            [
                'name' => 'Cooperative Formation Assistance',
                'sector_id' => $farmerSector->id, // Default to Farmer but available to all
                'unit' => 'cooperative',
                'description' => 'Legal and organizational support for forming cooperatives',
                'is_active' => true,
            ],
            [
                'name' => 'Credit Access Facilitation',
                'sector_id' => $farmerSector->id,
                'unit' => 'application',
                'description' => 'Assistance in accessing agricultural loans',
                'is_active' => true,
            ],
            [
                'name' => 'Farm Visit and Consultation',
                'sector_id' => $farmerSector->id,
                'unit' => 'visit',
                'description' => 'On-site technical consultation and advice',
                'is_active' => true,
            ],
            [
                'name' => 'Document Assistance',
                'sector_id' => $farmerSector->id,
                'unit' => 'document',
                'description' => 'Help with permits, licenses, and certifications',
                'is_active' => true,
            ],
            [
                'name' => 'Market Information Dissemination',
                'sector_id' => $farmerSector->id,
                'unit' => 'bulletin',
                'description' => 'Regular updates on market prices and trends',
                'is_active' => true,
            ],
        ];

        // Insert or update service catalogs
        foreach ($services as $service) {
            ServiceCatalog::updateOrCreate(
                [
                    'name' => $service['name'],
                    'sector_id' => $service['sector_id'],
                ],
                $service
            );
        }

        $this->command->info('✅ Successfully seeded ' . count($services) . ' service catalogs!');
        $this->command->info('📊 Distribution:');
        $this->command->info('   - Farmer: ' . ServiceCatalog::where('sector_id', $farmerSector->id)->count() . ' services');
        $this->command->info('   - Farmworker: ' . ServiceCatalog::where('sector_id', $farmworkerSector->id)->count() . ' services');
        $this->command->info('   - Fisherfolk: ' . ServiceCatalog::where('sector_id', $fisherfolkSector->id)->count() . ' services');
        $this->command->info('   - Agri-Youth: ' . ServiceCatalog::where('sector_id', $agriYouthSector->id)->count() . ' services');
    }
}
