<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryStock extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'inventory_id',
        'quantity',
        'movement_type',
        'transaction_type',
        'unit_cost',
        'total_value',
        'running_balance',
        'reference_number', // ✅ FIXED: was 'reference'
        'source',
        'destination',
        'program_id', // ✅ ADDED
        'program_beneficiary_item_id', // ✅ ADDED
        'date_received',
        'transaction_date',
        'batch_number',
        'expiry_date',
        'is_expired', // ✅ ADDED
        'is_near_expiry', // ✅ ADDED
        'remarks',
        'status',
        'is_verified',
        'verified_by',
        'transacted_by',
        'approved_by', // ✅ ADDED
        'approved_at',
        'verified_at', // ✅ ADDED
        'completed_at', // ✅ ADDED
        'cancelled_at', // ✅ ADDED
        'cancellation_reason', // ✅ ADDED
        'attachments', // ✅ ADDED
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'date_received' => 'date',
        'expiry_date' => 'date',
        'approved_at' => 'datetime',
        'verified_at' => 'datetime', // ✅ ADDED
        'completed_at' => 'datetime', // ✅ ADDED
        'cancelled_at' => 'datetime', // ✅ ADDED
        'is_verified' => 'boolean',
        'is_expired' => 'boolean', // ✅ ADDED
        'is_near_expiry' => 'boolean', // ✅ ADDED
        'attachments' => 'array', // ✅ ADDED for JSON field
    ];

    /**
     * Get the inventory that this stock transaction belongs to.
     */
    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    /**
     * Get the user who processed this transaction.
     */
    public function transactor()
    {
        return $this->belongsTo(User::class, 'transacted_by');
    }

    /**
     * Get the user who verified this transaction.
     */
    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the user who approved this transaction.
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the program linked to this stock transaction.
     */
    public function program()
    {
        return $this->belongsTo(SubsidyProgram::class, 'program_id');
    }

    /**
     * Get the program beneficiary item linked to this stock transaction.
     */
    public function programBeneficiaryItem()
    {
        return $this->belongsTo(ProgramBeneficiaryItem::class, 'program_beneficiary_item_id');
    }
}