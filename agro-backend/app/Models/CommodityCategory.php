<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommodityCategory extends Model
{
    protected $fillable = [
        'category_name'
    ];

    /**
     * Get the commodities for the category.
     */
    public function commodities(): HasMany
    {
        return $this->hasMany(Commodity::class, 'category_id');
    }
}