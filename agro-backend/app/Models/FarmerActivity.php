<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'beneficiary_livelihood_id',
        'rice',
        'corn',
        'other_crops',
        'other_crops_specify',
        'livestock',
        'livestock_specify',
        'poultry',
        'poultry_specify'
    ];

    protected $casts = [
        'rice' => 'boolean',
        'corn' => 'boolean',
        'other_crops' => 'boolean',
        'livestock' => 'boolean',
        'poultry' => 'boolean'
    ];

    // Relationships
    public function beneficiaryLivelihood()
    {
        return $this->belongsTo(BeneficiaryLivelihood::class);
    }
}