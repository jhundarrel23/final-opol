<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LivelihoodCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_name',
        'description'
    ];

    // Relationships
    public function farmProfiles()
    {
        return $this->hasMany(FarmProfile::class);
    }

    public function beneficiaryLivelihoods()
    {
        return $this->hasMany(BeneficiaryLivelihood::class);
    }
}