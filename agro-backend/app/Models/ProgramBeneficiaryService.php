<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramBeneficiaryService extends Model
{
    use HasFactory;

    protected $fillable = [
        'services_program_id',
        'beneficiary_id',
        'service_catalog_id',
        'units',
        'delivered_at',
        'location',
        'metadata',
        'status',
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'metadata' => 'array',
    ];
}


