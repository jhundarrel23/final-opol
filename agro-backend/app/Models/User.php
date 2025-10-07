<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'sector_id',
        'fname',
        'mname',
        'lname',
        'extension_name',   
        'username',
        'email',
        'password',
        'role',
        'status',
        'force_password_reset'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'force_password_reset' => 'boolean',
    ];

    public function sector()    
    {
        return $this->belongsTo(\App\Models\Sector::class, 'sector_id');
    }

    public function beneficiaryDetail()
    {
        return $this->hasOne(\App\Models\BeneficiaryDetail::class, 'user_id');
    }

    public function beneficiaries()
    {
        return $this->belongsToMany(
            \App\Models\RsbsaEnrollment::class,
            'coordinator_beneficiaries',
            'coordinator_id',
            'enrollment_id'
        )->withTimestamps();
    }

    protected static function booted()
    {
        static::saving(function ($user) {
            if ($user->role !== 'coordinator') {
                $user->force_password_reset = false;
            }
        });
    }
}
