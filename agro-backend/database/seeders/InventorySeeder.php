<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $items = [
            // 🌱 Seeds
            ['item_name' => 'Rice Seeds', 'unit' => 'kg', 'item_type' => 'seed', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 50.00, 'description' => 'Certified rice seeds'],
            ['item_name' => 'Corn Seeds', 'unit' => 'kg', 'item_type' => 'seed', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 45.00, 'description' => 'Hybrid corn seeds'],
            ['item_name' => 'Vegetable Seeds Pack', 'unit' => 'pack', 'item_type' => 'seed', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 100.00, 'description' => 'Assorted vegetable seeds'],

            // 🌾 Fertilizers
            ['item_name' => 'Urea (46-0-0)', 'unit' => 'bag', 'item_type' => 'fertilizer', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 1200.00, 'description' => 'Nitrogen fertilizer'],
            ['item_name' => 'Complete Fertilizer (14-14-14)', 'unit' => 'bag', 'item_type' => 'fertilizer', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 1400.00, 'description' => 'Balanced fertilizer'],
            ['item_name' => 'Organic Fertilizer', 'unit' => 'sack', 'item_type' => 'fertilizer', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 800.00, 'description' => 'Composted organic matter'],

            // 🧴 Pesticides
            ['item_name' => 'Insecticide', 'unit' => 'liter', 'item_type' => 'pesticide', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 600.00, 'description' => 'General use insecticide'],
            ['item_name' => 'Fungicide', 'unit' => 'liter', 'item_type' => 'pesticide', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 550.00, 'description' => 'Anti-fungal treatment'],
            ['item_name' => 'Herbicide', 'unit' => 'liter', 'item_type' => 'pesticide', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 500.00, 'description' => 'Weed control chemical'],

            // ⚙️ Equipment
            ['item_name' => 'Hand Tractor', 'unit' => 'unit', 'item_type' => 'equipment', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 50000.00, 'description' => 'Small-scale hand tractor'],
            ['item_name' => 'Water Pump', 'unit' => 'unit', 'item_type' => 'equipment', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 15000.00, 'description' => 'Portable water pump'],
            ['item_name' => 'Knapsack Sprayer', 'unit' => 'unit', 'item_type' => 'equipment', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 2000.00, 'description' => 'Manual sprayer for pesticides'],

            // ⛽ Fuel
            ['item_name' => 'Diesel', 'unit' => 'liter', 'item_type' => 'fuel', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 70.00, 'description' => 'Diesel fuel for machinery'],
            ['item_name' => 'Gasoline', 'unit' => 'liter', 'item_type' => 'fuel', 'assistance_category' => 'physical', 'is_trackable_stock' => true, 'unit_value' => 75.00, 'description' => 'Gasoline fuel for engines'],

            // 💵 Cash Assistance
            ['item_name' => 'Cash Assistance - Small Farmer', 'unit' => 'PHP', 'item_type' => 'cash', 'assistance_category' => 'monetary', 'is_trackable_stock' => false, 'unit_value' => 3000.00, 'description' => 'Cash grant for small farmers'],
            ['item_name' => 'Cash Assistance - Large Farmer', 'unit' => 'PHP', 'item_type' => 'cash', 'assistance_category' => 'monetary', 'is_trackable_stock' => false, 'unit_value' => 5000.00, 'description' => 'Cash grant for large farmers'],

            // 🛠 Services
            ['item_name' => 'Training Session', 'unit' => 'session', 'item_type' => 'other', 'assistance_category' => 'service', 'is_trackable_stock' => false, 'unit_value' => 0.00, 'description' => 'Agricultural training service'],
            ['item_name' => 'Soil Testing Service', 'unit' => 'sample', 'item_type' => 'other', 'assistance_category' => 'service', 'is_trackable_stock' => false, 'unit_value' => 500.00, 'description' => 'Soil analysis service'],
        ];

        foreach ($items as &$item) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
        }

        DB::table('inventories')->insert($items);
    }
}
