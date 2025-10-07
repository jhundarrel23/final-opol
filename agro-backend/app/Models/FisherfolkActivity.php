<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FisherfolkActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'beneficiary_livelihood_id',
        'fish_capture',
        'aquaculture',
        'gleaning',
        'fish_processing',
        'fish_vending',
        'others',
        'others_specify'
    ];

    protected $casts = [
        'fish_capture' => 'boolean',
        'aquaculture' => 'boolean',
        'gleaning' => 'boolean',
        'fish_processing' => 'boolean',
        'fish_vending' => 'boolean',
        'others' => 'boolean'
    ];

    // Relationships
    public function beneficiaryLivelihood()
    {
        return $this->belongsTo(BeneficiaryLivelihood::class);
    }
}