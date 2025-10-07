<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoordinatorBeneficiary extends Model
{
    use HasFactory;

    protected $table = 'coordinator_beneficiaries';

    protected $fillable = [
        'coordinator_id',
        'enrollment_id',
        'assigned_at'
    ];

    public $timestamps = true;

    protected $dates = [
        'assigned_at',
        'created_at',
        'updated_at',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Relationship to the RSBSA enrollment
     */
    public function enrollment()
    {
        return $this->belongsTo(RsbsaEnrollment::class, 'enrollment_id');
    }

    /**
     * Relationship to the coordinator (User)
     */
    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    /**
     * Scope to get all assignments for a specific coordinator
     */
    public function scopeForCoordinator($query, $coordinatorId)
    {
        return $query->where('coordinator_id', $coordinatorId);
    }

    public function coordinatorBeneficiaries()
{
    return $this->hasMany(\App\Models\CoordinatorBeneficiary::class, 'coordinator_id');
}
}
