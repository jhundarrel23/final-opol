<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceEventStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_event_id',
        'inventory_stock_id',
        'quantity_used',
        'remarks'
    ];

    // Relationships
    public function serviceEvent()
    {
        return $this->belongsTo(ServiceEvent::class, 'service_event_id');
    }

    public function inventoryStock()
    {
        return $this->belongsTo(InventoryStock::class, 'inventory_stock_id');
    }
}
