<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_catalog_id',
        'coordinator_id',
        'barangay',
        'service_date',
        'remarks',
        'status',
    ];

    // Relationships
    public function catalog()
    {
        return $this->belongsTo(ServiceCatalog::class, 'service_catalog_id');
    }

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    public function beneficiaries()
    {
        return $this->hasMany(ServiceBeneficiary::class, 'service_event_id');
    }

    public function stocks()
    {
        return $this->belongsToMany(InventoryStock::class, 'service_event_stocks')
                    ->withPivot('quantity_used', 'remarks')
                    ->withTimestamps();
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'related');
    }
}
