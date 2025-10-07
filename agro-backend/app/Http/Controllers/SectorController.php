<?php

namespace App\Http\Controllers;

use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SectorController extends Controller
{
    /**
     * Display a listing of all non-deleted sectors.
     */
    public function index()
    {
        return Sector::all(); // Only returns non-deleted by default
    }

    /**
     * Display a listing of ALL sectors, including soft-deleted.
     */
    public function allWithTrashed()
    {
        return Sector::withTrashed()->get();
    }

    /**
     * Store a newly created sector.
     */
    public function store(Request $request)
    {
        $request->validate([
          'sector_name' => 'required|string|max:255',

        ]);

        $sector = Sector::create([
            'sector_name' => $request->sector_name,
            'created_by' => Auth::id(),
            'status' => 'active'
        ]);

        return response()->json($sector, 201);
    }

    /**
     * Check if a sector name already exists (case insensitive).
     */
   public function checkName(Request $request)
{
    $name = strtolower($request->query('name'));

    $sector = Sector::withTrashed()
        ->whereRaw('LOWER(sector_name) = ?', [$name])
        ->first();

    if (!$sector) {
        return response()->json([
            'exists' => false,
            'deleted_at' => true
        ]);
    }

    return response()->json([
        'exists' => true,
        'deleted_at' => $sector->trashed()
    ]);
}


    /**
     * Display the specified sector.
     */
    public function show($id)
    {
        $sector = Sector::withTrashed()->findOrFail($id); // Include deleted records
        return response()->json($sector);
    }

    /**
     * Update the specified sector.
     */
    public function update(Request $request, Sector $sector)
    {
        $request->validate([
            'sector_name' => 'sometimes|string|max:255|unique:sectors,sector_name,' . $sector->id,
            'status' => 'in:active,inactive',
        ]);

        $sector->update($request->only(['sector_name', 'status']));

        return response()->json($sector);
    }

    /**
     * Soft delete the specified sector.
     */
   public function destroy($id)
{
    $sector = Sector::findOrFail($id);

    // Update status to inactive
    $sector->status = 'inactive';
    $sector->save();

    // Then soft delete
    $sector->delete();

    return response()->json(['message' => 'Sector deleted successfully and marked as inactive.']);
}


    /**
     * Restore a soft-deleted sector.
     */
    public function restore($id)
    {
        $sector = Sector::onlyTrashed()->findOrFail($id);
        $sector->restore();

        return response()->json(['message' => 'Sector restored successfully']);
    }

    /**
     * Permanently delete a soft-deleted sector.
     */
    public function forceDelete($id)
    {
        $sector = Sector::onlyTrashed()->findOrFail($id);
        $sector->forceDelete();

        return response()->json(['message' => 'Sector permanently deleted']);
    }

    /**
 * Get coordinators and their assigned beneficiaries for a specific sector
 */
public function getCoordinatorsWithBeneficiaries($id)
{
    $sector = Sector::with([
        'coordinators' => function($query) {
            $query->where('status', 'active')
                  ->with([
                      'beneficiaries' => function($q) {
                          $q->with([
                              'beneficiaryDetail.user',
                              'farmProfile.farmParcels.parcelCommodities.commodity'
                          ]);
                      }
                  ]);
        }
    ])->findOrFail($id);

    // Transform the data for better frontend consumption
    $coordinators = $sector->coordinators->map(function($coordinator) {
        return [
            'id' => $coordinator->id,
            'name' => trim("{$coordinator->fname} {$coordinator->mname} {$coordinator->lname} {$coordinator->extension_name}"),
            'email' => $coordinator->email,
            'username' => $coordinator->username,
            'beneficiaries' => $coordinator->beneficiaries->map(function($enrollment) {
                $beneficiary = $enrollment->beneficiaryDetail;
                $user = $beneficiary->user;
                
                        return [
                'enrollment_id' => $enrollment->id,
                'beneficiary_id' => $beneficiary->id,
                'rsbsa_number' => $beneficiary->rsbsa_number,
                'name' => trim("{$user->fname} {$user->mname} {$user->lname} {$user->extension_name}"),
                'barangay' => $beneficiary->barangay,
                'contact_number' => $beneficiary->contact_number,
                'enrollment_status' => $enrollment->application_status,
                'enrollment_year' => $enrollment->enrollment_year,
                'farm_profile' => $enrollment->farmProfile ? [
                    'id' => $enrollment->farmProfile->id,
                    'total_parcels' => $enrollment->farmProfile->farmParcels->count(),
                    'total_area' => $enrollment->farmProfile->farmParcels->sum('total_farm_area'),
                ] : null
            ];

            })
        ];
    });

    return response()->json([
        'sector' => [
            'id' => $sector->id,
            'name' => $sector->sector_name,
            'status' => $sector->status
        ],
        'coordinators' => $coordinators,
        'total_coordinators' => $coordinators->count(),
        'total_beneficiaries' => $coordinators->sum(fn($c) => $c['beneficiaries']->count())
    ]);
}

/**
 * Get a summary of all sectors with coordinator and beneficiary counts
 */

public function getSectorSummary()
{
    $sectors = Sector::active()
        ->with(['coordinators' => function($query) {
            $query->where('status', 'active')
                  ->select('id', 'sector_id', 'fname', 'mname', 'lname', 'extension_name');
        }])
        ->get()
        ->map(function($sector) {
            // Build list of coordinator names
            $coordinatorNames = $sector->coordinators->map(function($c) {
                return trim("{$c->fname} {$c->mname} {$c->lname} {$c->extension_name}");
            });

            // Count beneficiaries through coordinators
            $beneficiaryCount = \DB::table('coordinator_beneficiaries')
                ->join('users', 'coordinator_beneficiaries.coordinator_id', '=', 'users.id')
                ->where('users.sector_id', $sector->id)
                ->where('users.status', 'active')
                ->distinct('coordinator_beneficiaries.enrollment_id')
                ->count();

            return [
                'id' => $sector->id,
                'name' => $sector->sector_name,
                'status' => $sector->status,
                'coordinators' => $coordinatorNames, // 👈 names instead of just count
                'coordinators_count' => $sector->coordinators->count(),
                'beneficiaries_count' => $beneficiaryCount
            ];
        });

    return response()->json($sectors);
}

}