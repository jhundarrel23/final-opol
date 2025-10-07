<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmworkerActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'beneficiary_livelihood_id',
        'land_preparation',
        'planting',
        'cultivation',
        'harvesting',
        'others',
        'others_specify'
    ];

    protected $casts = [
        'land_preparation' => 'boolean',
        'planting' => 'boolean',
        'cultivation' => 'boolean',
        'harvesting' => 'boolean',
        'others' => 'boolean'
    ];

    // Relationships
    public function beneficiaryLivelihood()
    {
        return $this->belongsTo(BeneficiaryLivelihood::class);
    }
}