<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramBeneficiaryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_beneficiary_id',
        'item_name',
        'inventory_id',
        'assistance_type',
        'quantity',
        'unit',
        'coordinator_notes',
        'unit_value',
        'total_value',
        'status',
        'distributed_at',
        'distributed_by',
        'unclaimed_at',
        'unclaimed_reason',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
    ];

    public function programBeneficiary()
    {
        return $this->belongsTo(ProgramBeneficiary::class, 'program_beneficiary_id');
    }

 
    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id');
    }


    public function distributedBy()
    {
        return $this->belongsTo(User::class, 'distributed_by');
    }


    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}
