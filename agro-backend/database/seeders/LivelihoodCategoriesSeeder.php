<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LivelihoodCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Seed Livelihood Categories
        $livelihoodCategories = [
            [
                'livelihood_category_name' => 'Farmer',
                'description' => 'Individuals engaged in crop production and farming activities',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'livelihood_category_name' => 'Farm Worker',
                'description' => 'Individuals who work on farms but do not own the land',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'livelihood_category_name' => 'Fisherfolk',
                'description' => 'Individuals engaged in fishing and aquaculture activities',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'livelihood_category_name' => 'Agri-Youth',
                'description' => 'Young individuals (15-30 years) engaged in agricultural activities',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ];

        foreach ($livelihoodCategories as $category) {
            DB::table('livelihood_categories')->insertOrIgnore([
                'category_name' => $category['livelihood_category_name'],
                'description' => $category['description'],
                'created_at' => $category['created_at'],
                'updated_at' => $category['updated_at'],
            ]);
        }

        $this->command->info('Livelihood categories seeded successfully!');
    }
}
