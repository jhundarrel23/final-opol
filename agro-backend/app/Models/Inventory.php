<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'item_name',
        'unit',
        'item_type',
        'assistance_category',
        'is_trackable_stock',
        'unit_value',
        'description',
    ];

    // Always include this field when serializing
    protected $appends = ['current_stock'];

    public function stocks()
    {
        return $this->hasMany(InventoryStock::class);
    }


    
    
    /**
     * Get the latest running balance for this inventory.
     * This ensures Available Stock matches the last recorded transaction.
     */
    public function getCurrentStockAttribute()
    {
        return $this->stocks()
            ->latest('id')
            ->value('running_balance') ?? 0;
    }
}
