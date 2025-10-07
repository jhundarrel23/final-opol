<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoordinatorBeneficiary;
use App\Models\Commodity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CoordinatorAnalyticsController extends Controller
{
	public function index(Request $request)
	{
		$coordinatorId = Auth::id();
		$commodityId = $request->integer('commodity_id');

		// Count distinct enrollments assigned to this coordinator
		$assignedBeneficiaries = CoordinatorBeneficiary::query()
			->where('coordinator_id', $coordinatorId)
			->distinct('enrollment_id')
			->count('enrollment_id');

		// Build base query linking assignments -> enrollments -> farm profiles -> parcels -> parcel commodities
		$base = DB::table('coordinator_beneficiaries as cb')
			->join('rsbsa_enrollments as re', 're.id', '=', 'cb.enrollment_id')
			->join('farm_parcels as fp', 'fp.farm_profile_id', '=', 're.farm_profile_id')
			->join('parcel_commodities as pc', 'pc.farm_parcel_id', '=', 'fp.id')
			->where('cb.coordinator_id', $coordinatorId);

		if ($commodityId) {
			$base->where('pc.commodity_id', $commodityId);
		}

		$totalArea = (clone $base)->sum('pc.size_hectares');
		$totalParcels = (clone $base)->distinct('fp.id')->count('fp.id');
		$totalFarmArea = (clone $base)->distinct('fp.id')->sum('fp.total_farm_area');

		$breakdownRows = (clone $base)
			->select('pc.farm_type', DB::raw('SUM(pc.size_hectares) as total_area'), DB::raw('COUNT(*) as entries'))
			->groupBy('pc.farm_type')
			->get();

		$farmTypeBreakdown = [];
		foreach ($breakdownRows as $row) {
			$farmTypeBreakdown[$row->farm_type ?? 'unspecified'] = [
				'total_area' => (float) $row->total_area,
				'entries' => (int) $row->entries,
			];
		}

		// Build normalized array expected by frontend (farm_distribution)
		$farmDistribution = [];
		foreach ($farmTypeBreakdown as $type => $stats) {
			$area = (float) ($stats['total_area'] ?? 0);
			$percentage = $totalArea > 0 ? round(($area / $totalArea) * 100, 2) : 0.0;
			$farmDistribution[] = [
				'farm_type' => $type,
				'area' => $area,
				'percentage' => $percentage,
				'entries' => (int) ($stats['entries'] ?? 0),
			];
		}

		// Top commodities by allocated area within coordinator scope
		$topCommodities = (clone $base)
			->select('pc.commodity_id', DB::raw('SUM(pc.size_hectares) as area'))
			->groupBy('pc.commodity_id')
			->orderByDesc('area')
			->limit(10)
			->pluck('area', 'pc.commodity_id')
			->toArray();

		$commodityNames = Commodity::whereIn('id', array_keys($topCommodities))
			->pluck('commodity_name', 'id')
			->toArray();

		$topCommoditiesArr = [];
		foreach ($topCommodities as $commodityIdKey => $area) {
			$topCommoditiesArr[] = [
				'commodity_id' => (int) $commodityIdKey,
				'commodity_name' => $commodityNames[$commodityIdKey] ?? ('Commodity #' . $commodityIdKey),
				'area' => (float) $area,
			];
		}

		// Monthly assigned beneficiaries (last 12 months)
		$monthlyAssignments = DB::table('coordinator_beneficiaries')
			->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as ym, COUNT(DISTINCT enrollment_id) as count")
			->where('coordinator_id', $coordinatorId)
			->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
			->groupBy('ym')
			->orderBy('ym')
			->get();

		$monthlySeries = [];
		foreach ($monthlyAssignments as $row) {
			$monthlySeries[] = [
				'month' => $row->ym,
				'count' => (int) $row->count,
			];
		}

		return response()->json([
			// Original keys
			'assigned_beneficiaries' => $assignedBeneficiaries,
			'total_parcel_commodity_area_hectares' => (float) $totalArea,
			'farm_type_breakdown' => $farmTypeBreakdown,
			// Added useful stats
			'parcels_count' => (int) $totalParcels,
			'total_farm_area_hectares' => (float) $totalFarmArea,
			// Normalized keys expected by frontend hook/components
			'total_beneficiaries' => (int) $assignedBeneficiaries,
			'total_hectares' => (float) $totalArea,
			'farm_distribution' => $farmDistribution,
			'top_commodities' => $topCommoditiesArr,
			'monthly_assignments' => $monthlySeries,
			'filters' => [
				'commodity_id' => $commodityId,
			],
		]);
	}
}