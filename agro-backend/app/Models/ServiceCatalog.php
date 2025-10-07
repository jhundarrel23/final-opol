<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceCatalog extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sector_id',
        'unit',
        'description',
        'is_active'
    ];

    // Relationships
    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function serviceEvents()
    {
        return $this->hasMany(ServiceEvent::class, 'service_catalog_id');
    }
}
