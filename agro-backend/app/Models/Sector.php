<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sector extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sector_name',
        'status',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function coordinators()
    {
        return $this->hasMany(User::class, 'sector_id', 'id')
                    ->where('role', 'coordinator'); // ✅ Added this
    }

    public function farmParcels()
    {
        return $this->hasMany(FarmParcel::class);
    }

    public function commodities()
    {
        return $this->hasMany(Commodity::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
