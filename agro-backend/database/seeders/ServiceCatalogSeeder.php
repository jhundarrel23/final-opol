<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceCatalog;

class ServiceCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            // LIVESTOCK SECTOR
            ['name' => 'Vaccination - Foot & Mouth Disease', 'sector' => 'livestock', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Vaccination - Hemorrhagic Septicemia', 'sector' => 'livestock', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Vaccination - Rabies', 'sector' => 'livestock', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Deworming', 'sector' => 'livestock', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Health Checkup', 'sector' => 'livestock', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Artificial Insemination', 'sector' => 'livestock', 'unit' => 'service', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Pregnancy Diagnosis', 'sector' => 'livestock', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Feed Supplement Distribution', 'sector' => 'livestock', 'unit' => 'bag', 'requires_schedule' => false, 'requires_location' => true],
            ['name' => 'Pasture Improvement', 'sector' => 'livestock', 'unit' => 'hectare', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Emergency Veterinary Care', 'sector' => 'livestock', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            
            // POULTRY SECTOR
            ['name' => 'Vaccination - Newcastle Disease', 'sector' => 'poultry', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Vaccination - Avian Influenza', 'sector' => 'poultry', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Vaccination - Infectious Bronchitis', 'sector' => 'poultry', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Poultry Deworming', 'sector' => 'poultry', 'unit' => 'head', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Flock Health Monitoring', 'sector' => 'poultry', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Day-Old Chick Distribution', 'sector' => 'poultry', 'unit' => 'head', 'requires_schedule' => false, 'requires_location' => true],
            ['name' => 'Biosecurity Assessment', 'sector' => 'poultry', 'unit' => 'farm', 'requires_schedule' => true, 'requires_location' => true],
            
            // RICE SECTOR
            ['name' => 'Land Preparation Service', 'sector' => 'rice', 'unit' => 'hectare', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Soil Testing', 'sector' => 'rice', 'unit' => 'sample', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Pesticide Application', 'sector' => 'rice', 'unit' => 'application', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Fertilizer Application', 'sector' => 'rice', 'unit' => 'application', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Irrigation Maintenance', 'sector' => 'rice', 'unit' => 'system', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Mechanical Harvesting', 'sector' => 'rice', 'unit' => 'hectare', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Threshing Service', 'sector' => 'rice', 'unit' => 'sack', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Seedling Distribution', 'sector' => 'rice', 'unit' => 'kilogram', 'requires_schedule' => false, 'requires_location' => true],
            ['name' => 'Crop Monitoring', 'sector' => 'rice', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            
            // CORN SECTOR
            ['name' => 'Soil Analysis', 'sector' => 'corn', 'unit' => 'sample', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Herbicide Application', 'sector' => 'corn', 'unit' => 'application', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Crop Monitoring', 'sector' => 'corn', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Mechanical Planting', 'sector' => 'corn', 'unit' => 'hectare', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Corn Shelling Service', 'sector' => 'corn', 'unit' => 'kilogram', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Hybrid Seed Distribution', 'sector' => 'corn', 'unit' => 'kilogram', 'requires_schedule' => false, 'requires_location' => true],
            ['name' => 'Fertilizer Distribution', 'sector' => 'corn', 'unit' => 'bag', 'requires_schedule' => false, 'requires_location' => true],
            
            // FISHERIES SECTOR
            ['name' => 'Water Quality Testing', 'sector' => 'fisheries', 'unit' => 'sample', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Pond Preparation', 'sector' => 'fisheries', 'unit' => 'pond', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Fingerling Distribution', 'sector' => 'fisheries', 'unit' => 'piece', 'requires_schedule' => false, 'requires_location' => true],
            ['name' => 'Fish Health Diagnosis', 'sector' => 'fisheries', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Harvest Assistance', 'sector' => 'fisheries', 'unit' => 'harvest', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Pond Fertilizer Application', 'sector' => 'fisheries', 'unit' => 'application', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Fish Feed Distribution', 'sector' => 'fisheries', 'unit' => 'bag', 'requires_schedule' => false, 'requires_location' => true],
            
            // HIGH-VALUE CROPS
            ['name' => 'Pest & Disease Diagnosis', 'sector' => 'hvc', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Field Advisory Visit', 'sector' => 'hvc', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Drip Irrigation Installation', 'sector' => 'hvc', 'unit' => 'system', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Greenhouse Setup Assistance', 'sector' => 'hvc', 'unit' => 'structure', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Seedling Distribution', 'sector' => 'hvc', 'unit' => 'piece', 'requires_schedule' => false, 'requires_location' => true],
            ['name' => 'Organic Fertilizer Application', 'sector' => 'hvc', 'unit' => 'application', 'requires_schedule' => true, 'requires_location' => true],
            
            // GENERAL SERVICES (Available to all sectors)
            ['name' => 'Technical Training Session', 'sector' => 'general', 'unit' => 'session', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Farm Business Planning Workshop', 'sector' => 'general', 'unit' => 'session', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Cooperative Formation Training', 'sector' => 'general', 'unit' => 'session', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Farm Visit Consultation', 'sector' => 'general', 'unit' => 'visit', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Crop Insurance Facilitation', 'sector' => 'general', 'unit' => 'enrollment', 'requires_schedule' => false, 'requires_location' => false],
            ['name' => 'Market Linkage Assistance', 'sector' => 'general', 'unit' => 'transaction', 'requires_schedule' => false, 'requires_location' => false],
            ['name' => 'Credit Access Facilitation', 'sector' => 'general', 'unit' => 'application', 'requires_schedule' => false, 'requires_location' => false],
            ['name' => 'Record Keeping Training', 'sector' => 'general', 'unit' => 'session', 'requires_schedule' => true, 'requires_location' => true],
            
            // MECHANIZATION SERVICES (Available to all sectors)
            ['name' => 'Four-Wheel Tractor Service', 'sector' => 'mechanization', 'unit' => 'hectare', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Hand Tractor Service', 'sector' => 'mechanization', 'unit' => 'hectare', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Combine Harvester Service', 'sector' => 'mechanization', 'unit' => 'hectare', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Thresher Rental', 'sector' => 'mechanization', 'unit' => 'day', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Corn Sheller Rental', 'sector' => 'mechanization', 'unit' => 'day', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Rice Mill Service', 'sector' => 'mechanization', 'unit' => 'kilogram', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Equipment Repair Service', 'sector' => 'mechanization', 'unit' => 'service', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Preventive Maintenance', 'sector' => 'mechanization', 'unit' => 'service', 'requires_schedule' => true, 'requires_location' => true],
            
            // AGRI-YOUTH PROGRAMS (Available to all sectors)
            ['name' => 'Agricultural Youth Camp', 'sector' => 'agri-youth', 'unit' => 'participant', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Farm Business Training', 'sector' => 'agri-youth', 'unit' => 'session', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Digital Agriculture Training', 'sector' => 'agri-youth', 'unit' => 'session', 'requires_schedule' => true, 'requires_location' => true],
            ['name' => 'Farm Internship Placement', 'sector' => 'agri-youth', 'unit' => 'placement', 'requires_schedule' => true, 'requires_location' => false],
            ['name' => 'Starter Kit Distribution', 'sector' => 'agri-youth', 'unit' => 'kit', 'requires_schedule' => false, 'requires_location' => true],
            ['name' => 'Youth Mentorship Program', 'sector' => 'agri-youth', 'unit' => 'month', 'requires_schedule' => true, 'requires_location' => false],
        ];

        foreach ($services as $service) {
            ServiceCatalog::firstOrCreate(
                [
                    'name' => $service['name'],
                    'sector' => $service['sector'],
                ],
                $service
            );
        }
    }
}