<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubsidyProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'status',
        'barangay', 
        'approval_status',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];

    // 🔗 Program creator (usually coordinator)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // 🔗 Program approver (usually admin)
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // 🔗 Program has many beneficiaries
    public function beneficiaries()
    {
        return $this->hasMany(ProgramBeneficiary::class, 'subsidy_program_id');
    }
}