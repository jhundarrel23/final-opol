<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FarmParcelCommodity extends Model
{
    use HasFactory;

    protected $table = 'parcel_commodities';

    protected $fillable = [
        'farm_parcel_id',
        'commodity_id',
        'size_hectares',
        'number_of_heads',
        'farm_type',
        'is_organic_practitioner',
        'remarks',
    ];

    protected $casts = [
        'farm_parcel_id' => 'integer',
        'commodity_id' => 'integer',
        'size_hectares' => 'decimal:2',
        'number_of_heads' => 'integer',
        'is_organic_practitioner' => 'boolean',
    ];

    // 🔗 Relationships
    public function farmParcel(): BelongsTo
    {
        return $this->belongsTo(FarmParcel::class);
    }

    public function commodity(): BelongsTo
    {
        return $this->belongsTo(Commodity::class, 'commodity_id');
    }

    // 🔑 Accessors
    public function getCategoryAttribute()
    {
        return $this->commodity?->category;
    }

    public function getCommodityTypeAttribute()
    {
        return $this->commodity?->category?->category_name;
    }

    // 🔧 Business logic
    public function requiresNumberOfHeads(): bool
    {
        return in_array(strtolower($this->commodity?->category?->category_name), ['livestock', 'poultry']);
    }

    public function allowsFarmType(): bool
    {
        return strtolower($this->commodity?->category?->category_name) !== 'agri_fisher';
    }

    // 🔎 Scopes
    public function scopeOfCategory($query, $categoryName)
    {
        return $query->whereHas('commodity.category', function ($q) use ($categoryName) {
            $q->where('category_name', $categoryName);
        });
    }

    public function scopeOfCommodity($query, $commodityId)
    {
        return $query->where('commodity_id', $commodityId);
    }

    public function scopeOrganic($query)
    {
        return $query->where('is_organic_practitioner', true);
    }


}
