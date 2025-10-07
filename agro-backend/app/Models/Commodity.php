<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Commodity extends Model
{
    protected $fillable = [
        'commodity_name',
        'category_id',
        'sector_id'
    ];

    protected $casts = [
        'category_id' => 'integer',
        'sector_id' => 'integer'
    ];

    /**
     * Get the category that owns the commodity.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(CommodityCategory::class, 'category_id');
    }

    /**
     * Get the sector that owns the commodity.
     */
    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    /**
     * Get the parcel commodities for the commodity.
     */
    public function parcelCommodities(): HasMany
    {
        return $this->hasMany(ParcelCommodity::class, 'commodity_id');
    }

    /**
     * Scope a query to only include commodities of a given category.
     */
    public function scopeByCategory($query, $categoryName)
    {
        return $query->whereHas('category', function ($q) use ($categoryName) {
            $q->where('category_name', $categoryName);
        });
    }

    /**
     * Scope a query to only include commodities of a given sector.
     */
    public function scopeBySector($query, $sectorId)
    {
        return $query->where('sector_id', $sectorId);
    }

    /**
     * Get formatted display name with category
     */
    public function getDisplayNameAttribute()
    {
        return $this->commodity_name . ' (' . $this->category->category_name . ')';
    }
}