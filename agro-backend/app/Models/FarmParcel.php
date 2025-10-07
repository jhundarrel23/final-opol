<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FarmParcel extends Model
{
    use HasFactory;

    protected $table = 'farm_parcels';

    protected $fillable = [
        'farm_profile_id',
        'sector_id',
        'parcel_number',
        'barangay',
        'total_farm_area',
        'tenure_type',
        'landowner_name',
        'ownership_document_number',
        'ownership_document_type',
        'is_ancestral_domain',
        'is_agrarian_reform_beneficiary',
        'remarks'
    ];

    protected $casts = [
        'total_farm_area' => 'decimal:2',
        'is_ancestral_domain' => 'boolean',
        'is_agrarian_reform_beneficiary' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $dates = [
        'created_at',
        'updated_at'
    ];

    // Constants for enum values
    const TENURE_TYPES = [
        'registered_owner' => 'Registered Owner',
        'tenant' => 'Tenant',
        'lessee' => 'Lessee'
    ];

    const OWNERSHIP_DOCUMENT_TYPES = [
        'certificate_of_land_transfer' => 'Certificate of Land Transfer',
        'emancipation_patent' => 'Emancipation Patent',
        'individual_cloa' => 'Individual Certificate of Land Ownership Award (CLOA)',
        'collective_cloa' => 'Collective CLOA',
        'co_ownership_cloa' => 'Co-ownership CLOA',
        'agricultural_sales_patent' => 'Agricultural Sales Patent',
        'homestead_patent' => 'Homestead Patent',
        'free_patent' => 'Free Patent',
        'certificate_of_title' => 'Certificate of Title or Regular Title',
        'certificate_ancestral_domain_title' => 'Certificate of Ancestral Domain Title',
        'certificate_ancestral_land_title' => 'Certificate of Ancestral Land Title',
        'tax_declaration' => 'Tax Declaration',
        'others' => 'Others (e.g. Barangay Certification)'
    ];

    /**
     * Relations
     */

    public function farmProfile(): BelongsTo
    {
        return $this->belongsTo(FarmProfile::class, 'farm_profile_id');
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function parcelCommodities(): HasMany
    {
        return $this->hasMany(FarmParcelCommodity::class, 'farm_parcel_id');
    }

    public function commodities(): BelongsToMany
    {
        return $this->belongsToMany(
            Commodity::class,
            'parcel_commodities',
            'farm_parcel_id',
            'commodity_id'
        )->withPivot([
            'size_hectares',
            'number_of_heads',
            'farm_type',
            'is_organic_practitioner',
            'remarks',
            'created_at',
            'updated_at'
        ])->withTimestamps();
    }

    /**
     * Accessors & Mutators
     */

    public function getTenureTypeDisplayAttribute(): string
    {
        return self::TENURE_TYPES[$this->tenure_type] ?? $this->tenure_type;
    }

    public function getOwnershipDocumentTypeDisplayAttribute(): ?string
    {
        return $this->ownership_document_type 
            ? (self::OWNERSHIP_DOCUMENT_TYPES[$this->ownership_document_type] ?? $this->ownership_document_type)
            : null;
    }

    public function getTotalCommodityAreaAttribute(): float
    {
        return $this->commodities->sum('pivot.size_hectares') ?? 0.0;
    }

    public function getIsFullyUtilizedAttribute(): bool
    {
        return $this->total_commodity_area >= $this->total_farm_area;
    }

    public function getRemainingAreaAttribute(): float
    {
        return max(0, $this->total_farm_area - $this->total_commodity_area);
    }

    public function getHasOrganicCommoditiesAttribute(): bool
    {
        return $this->commodities->where('pivot.is_organic_practitioner', true)->isNotEmpty();
    }

    /**
     * Scopes
     */

    public function scopeOfSector($query, $sectorId)
    {
        return $query->where('sector_id', $sectorId);
    }

    public function scopeOfTenureType($query, $tenureType)
    {
        return $query->where('tenure_type', $tenureType);
    }

    public function scopeOfBarangay($query, $barangay)
    {
        return $query->where('barangay', $barangay);
    }

    public function scopeOrganic($query)
    {
        return $query->whereHas('commodities', function ($q) {
            $q->where('is_organic_practitioner', true);
        });
    }

    public function scopeAncestralDomain($query)
    {
        return $query->where('is_ancestral_domain', true);
    }

    public function scopeAgrianReformBeneficiary($query)
    {
        return $query->where('is_agrarian_reform_beneficiary', true);
    }

    public function scopeMinArea($query, $minArea)
    {
        return $query->where('total_farm_area', '>=', $minArea);
    }

    public function scopeMaxArea($query, $maxArea)
    {
        return $query->where('total_farm_area', '<=', $maxArea);
    }

    public function scopeAreaBetween($query, $minArea, $maxArea)
    {
        return $query->whereBetween('total_farm_area', [$minArea, $maxArea]);
    }

    public function scopeWithCommodity($query, $commodityId)
    {
        return $query->whereHas('commodities', function ($q) use ($commodityId) {
            $q->where('commodity_id', $commodityId);
        });
    }

    public function scopeWithFarmType($query, $farmType)
    {
        return $query->whereHas('commodities', function ($q) use ($farmType) {
            $q->where('farm_type', $farmType);
        });
    }

    /**
     * Business Logic Methods
     */

    public function requiresLandownerName(): bool
    {
        return in_array($this->tenure_type, ['tenant', 'lessee']);
    }

    public function getCommodityBreakdown(): array
    {
        $breakdown = [];
        
        foreach ($this->commodities as $commodity) {
            $breakdown[] = [
                'commodity_name' => $commodity->display_name ?? $commodity->commodity_name,
                'size_hectares' => $commodity->pivot->size_hectares,
                'percentage' => $this->total_farm_area > 0 
                    ? round(($commodity->pivot->size_hectares / $this->total_farm_area) * 100, 2)
                    : 0,
                'farm_type' => $commodity->pivot->farm_type,
                'is_organic' => $commodity->pivot->is_organic_practitioner,
                'number_of_heads' => $commodity->pivot->number_of_heads
            ];
        }

        return $breakdown;
    }

    public function validateAreaAllocation(): array
    {
        $errors = [];
        $totalCommodityArea = $this->total_commodity_area;

        if ($totalCommodityArea > $this->total_farm_area) {
            $errors[] = "Total commodity area ({$totalCommodityArea} ha) exceeds farm area ({$this->total_farm_area} ha)";
        }

        if ($totalCommodityArea == 0) {
            $errors[] = "At least one commodity must be allocated";
        }

        return $errors;
    }

    /**
     * Static Methods
     */

    public static function getTenureTypes(): array
    {
        return self::TENURE_TYPES;
    }

    public static function getOwnershipDocumentTypes(): array
    {
        return self::OWNERSHIP_DOCUMENT_TYPES;
    }

    public static function getStatistics(): array
    {
        return [
            'total_parcels' => self::count(),
            'total_area' => self::sum('total_farm_area'),
            'average_area' => self::avg('total_farm_area'),
            'by_tenure_type' => self::groupBy('tenure_type')
                ->selectRaw('tenure_type, count(*) as count, sum(total_farm_area) as total_area')
                ->pluck('count', 'tenure_type')
                ->toArray(),
            'ancestral_domain_count' => self::where('is_ancestral_domain', true)->count(),
            'agrarian_reform_count' => self::where('is_agrarian_reform_beneficiary', true)->count(),
            'organic_parcels_count' => self::organic()->count()
        ];
    }
}
