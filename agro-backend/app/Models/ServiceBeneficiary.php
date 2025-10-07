<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceBeneficiary extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_event_id',
        'beneficiary_id',
        'species',
        'quantity',
        'remarks',
        'status',
    ];

    // Relationships
    public function serviceEvent()
    {
        return $this->belongsTo(ServiceEvent::class, 'service_event_id');
    }

    public function beneficiary()
    {
        return $this->belongsTo(BeneficiaryDetail::class, 'beneficiary_id');
    }
}
