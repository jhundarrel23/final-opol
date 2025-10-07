<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BeneficiaryLivelihood extends Model
{
    use HasFactory;

    protected $fillable = [
        'beneficiary_id',
        'livelihood_category_id'
    ];

    // Relationships
    public function beneficiaryDetail()
    {
        return $this->belongsTo(BeneficiaryDetail::class, 'beneficiary_id');
    }

    public function livelihoodCategory()
    {
        return $this->belongsTo(LivelihoodCategory::class);
    }

    public function farmerActivity()
    {
        return $this->hasOne(FarmerActivity::class);
    }

    public function fisherfolkActivity()
    {
        return $this->hasOne(FisherfolkActivity::class);
    }

    public function farmworkerActivity()
    {
        return $this->hasOne(FarmworkerActivity::class);
    }

    public function agriYouthActivity()
    {
        return $this->hasOne(AgriYouthActivity::class);
    }
}