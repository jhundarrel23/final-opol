<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BeneficiaryDetail;
use App\Models\SubsidyProgram;
use App\Models\ProgramBeneficiary;
use App\Models\ProgramBeneficiaryItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class BeneficiaryController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['beneficiaryDetail'])
            ->whereIn('role', ['coordinator', 'beneficiary']);

        // Apply filters
        if ($request->filled('barangay')) {
            $query->whereHas('beneficiaryDetail', function($q) use ($request) {
                $q->where('barangay', $request->barangay);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('sex')) {
            $query->whereHas('beneficiaryDetail', function($q) use ($request) {
                $q->where('sex', $request->sex);
            });
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users,
            'message' => 'Users retrieved successfully'
        ]);
    }

    public function show(string $userId)
    {
        $user = User::with([
            'beneficiaryDetail',
            'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory'
        ])->findOrFail($userId);

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User retrieved successfully'
        ]);
    }

    public function updateUser(Request $request, string $userId)
    {
        $user = User::findOrFail($userId);

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot edit admin users'
            ], 403);
        }

        $data = $request->validate([
            'fname' => 'required|string|max:100',
            'mname' => 'nullable|string|max:100',
            'lname' => 'required|string|max:100',
            'extension_name' => 'nullable|string|max:20',
            'username' => 'required|string|max:100|unique:users,username,' . $userId,
            'email' => 'required|email|unique:users,email,' . $userId,
            'role' => 'required|in:coordinator,beneficiary',
            'status' => 'required|in:active,inactive,suspended',
            'password' => 'nullable|string|min:8|confirmed',
            'sector_id' => 'nullable|integer'
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        unset($data['password_confirmation']);

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user->fresh(['beneficiaryDetail']),
            'message' => 'User updated successfully'
        ]);
    }

    public function updateBeneficiary(Request $request, string $userId)
    {
        $user = User::findOrFail($userId);
        
        if ($user->role !== 'beneficiary') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a beneficiary'
            ], 400);
        }

        $beneficiary = BeneficiaryDetail::where('user_id', $userId)->firstOrFail();

        $data = $request->validate([
            'barangay' => 'nullable|string|max:100',
            'municipality' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'region' => 'nullable|string|max:100',
            'contact_number' => 'nullable|string|max:20',
            'emergency_contact_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date|before_or_equal:today',
            'place_of_birth' => 'nullable|string|max:255',
            'sex' => 'nullable|in:male,female',
            'civil_status' => 'nullable|in:single,married,widowed,separated,divorced',
            'highest_education' => 'nullable|in:None,Pre-school,Elementary,Junior High School,Senior High School,Vocational,College,Post Graduate',
            'religion' => 'nullable|string|max:100',
            'is_pwd' => 'boolean',
            'has_government_id' => 'nullable|in:yes,no',
            'is_association_member' => 'nullable|in:yes,no',
            'mothers_maiden_name' => 'nullable|string|max:150',
            'is_household_head' => 'boolean'
        ]);

        $beneficiary->update($data);

        return response()->json([
            'success' => true,
            'data' => $beneficiary->fresh(),
            'message' => 'Beneficiary details updated successfully'
        ]);
    }

    public function toggleStatus(string $userId)
    {
        $user = User::findOrFail($userId);
        
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot change admin user status'
            ], 403);
        }

        $currentStatus = $user->status;
        $newStatus = $currentStatus === 'active' ? 'inactive' : 'active';
        
        $user->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $user->id,
                'username' => $user->username,
                'full_name' => trim($user->fname . ' ' . $user->lname),
                'old_status' => $currentStatus,
                'new_status' => $newStatus
            ],
            'message' => "User account {$newStatus} successfully"
        ]);
    }

    public function getStats()
    {
        $totalUsers = User::whereIn('role', ['coordinator', 'beneficiary'])->count();
        $activeUsers = User::whereIn('role', ['coordinator', 'beneficiary'])
                         ->where('status', 'active')->count();
        $inactiveUsers = User::whereIn('role', ['coordinator', 'beneficiary'])
                           ->where('status', 'inactive')->count();
        $suspendedUsers = User::whereIn('role', ['coordinator', 'beneficiary'])
                            ->where('status', 'suspended')->count();
        
        $totalBeneficiaries = User::where('role', 'beneficiary')->count();
        $beneficiariesWithDetails = User::where('role', 'beneficiary')
                                      ->whereHas('beneficiaryDetail')->count();
        
        $totalCoordinators = User::where('role', 'coordinator')->count();
        $activeCoordinators = User::where('role', 'coordinator')
                                ->where('status', 'active')->count();
        
        $byBarangay = BeneficiaryDetail::selectRaw('barangay, count(*) as count')
            ->whereHas('user', function($q) {
                $q->whereIn('role', ['coordinator', 'beneficiary'])
                  ->where('status', 'active');
            })
            ->whereNotNull('barangay')
            ->where('barangay', '!=', '')
            ->groupBy('barangay')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $monthlyRegistrations = User::whereIn('role', ['coordinator', 'beneficiary'])
            ->selectRaw('MONTH(created_at) as month, MONTHNAME(created_at) as month_name, COUNT(*) as count')
            ->whereYear('created_at', date('Y'))
            ->groupBy('month', 'month_name')
            ->orderBy('month')
            ->get();

        $recentRegistrations = User::whereIn('role', ['coordinator', 'beneficiary'])
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total_users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'inactive_users' => $inactiveUsers,
                    'suspended_users' => $suspendedUsers,
                    'total_beneficiaries' => $totalBeneficiaries,
                    'total_coordinators' => $totalCoordinators,
                    'active_coordinators' => $activeCoordinators,
                    'beneficiaries_with_details' => $beneficiariesWithDetails,
                    'completion_rate' => $totalBeneficiaries > 0 
                        ? round(($beneficiariesWithDetails / $totalBeneficiaries) * 100, 1) 
                        : 0,
                    'recent_registrations' => $recentRegistrations
                ],
                'geographic' => [
                    'by_barangay' => $byBarangay
                ],
                'trends' => [
                    'monthly_registrations' => $monthlyRegistrations
                ]
            ],
            'message' => 'Statistics retrieved successfully'
        ]);
    }

    public function getFilterOptions()
    {
        $barangays = BeneficiaryDetail::distinct()
            ->whereNotNull('barangay')
            ->where('barangay', '!=', '')
            ->pluck('barangay')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'barangays' => $barangays,
                'roles' => ['beneficiary', 'coordinator'],
                'statuses' => ['active', 'inactive', 'suspended'],
                'genders' => ['male', 'female']
            ],
            'message' => 'Filter options retrieved successfully'
        ]);
    }

    public function getUserSubsidies(string $userId)
    {
        $user = User::with('beneficiaryDetail')->findOrFail($userId);
        
        if (!$user->beneficiaryDetail) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No beneficiary details found'
            ]);
        }

        $programs = SubsidyProgram::with([
            'creator:id,fname,lname,role,sector_id',
            'creator.sector:id,sector_name',
            'approver:id,fname,lname,role',
            'beneficiaries' => function($q) use ($user) {
                $q->where('beneficiary_id', $user->beneficiaryDetail->id)
                  ->with([
                      'beneficiary:id,rsbsa_number,barangay,user_id',
                      'beneficiary.user:id,fname,lname',
                      'items.inventory:id,item_name,unit'
                  ]);
            }
        ])
        ->whereHas('beneficiaries', function($q) use ($user) {
            $q->where('beneficiary_id', $user->beneficiaryDetail->id);
        })
        ->where('approval_status', 'approved')
        ->whereIn('status', ['ongoing', 'completed'])
        ->latest()
        ->get();

        $subsidies = $programs->map(function ($program) {
            $beneficiary = $program->beneficiaries->first();
            
            return [
                'id' => $program->id,
                'program_name' => $program->title,
                'description' => $program->description,
                'start_date' => $program->start_date,
                'end_date' => $program->end_date,
                'status' => $program->status,
                'approval_status' => $program->approval_status,
                'application_date' => $beneficiary->created_at,
                'date_approved' => $program->approved_at,
                'creator' => [
                    'name' => $program->creator->fname . ' ' . $program->creator->lname,
                    'role' => $program->creator->role,
                    'sector' => $program->creator->sector->sector_name ?? 'N/A'
                ],
                'approver' => $program->approver ? [
                    'name' => $program->approver->fname . ' ' . $program->approver->lname,
                    'role' => $program->approver->role,
                ] : null,
                'items' => $beneficiary ? $beneficiary->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'quantity' => $item->quantity,
                        'unit' => $item->unit,
                        'unit_value' => $item->unit_value,
                        'total_value' => $item->total_value,
                        'status' => $item->status,
                        'approval_status' => $item->approval_status,
                        'released_at' => $item->released_at,
                        'inventory' => $item->inventory ? [
                            'id' => $item->inventory->id,
                            'item_name' => $item->inventory->item_name,
                            'unit' => $item->inventory->unit
                        ] : null
                    ];
                }) : [],
                'summary' => $beneficiary ? [
                    'total_items' => $beneficiary->items->count(),
                    'total_value' => $beneficiary->items->sum('total_value'),
                    'pending_items' => $beneficiary->items->where('status', 'pending')->count(),
                    'distributed_items' => $beneficiary->items->where('status', 'distributed')->count()
                ] : null
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $subsidies,
            'message' => 'User subsidy records retrieved successfully'
        ]);
    }

    public function getUserFarmDetails(string $userId)
    {
        try {
            $user = User::with('beneficiaryDetail')->findOrFail($userId);

            if (!$user->beneficiaryDetail) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'farm_profiles' => [],
                        'summary' => [
                            'total_farm_profiles' => 0,
                            'total_parcels' => 0,
                            'total_farm_area' => 0,
                            'total_commodities' => 0,
                            'organic_parcels' => 0
                        ]
                    ],
                    'message' => 'No beneficiary details found'
                ]);
            }

            $farmProfiles = $user->beneficiaryDetail->farmProfiles()
                ->with(['farmParcels.sector', 'farmParcels.commodities'])
                ->get();

            $farmData = $farmProfiles->map(function ($profile) {
                $parcels = $profile->farmParcels ?? collect();

                return [
                    'id' => $profile->id,
                    'farm_profile_info' => [
                        'reference_number' => $profile->reference_number ?? 'N/A',
                        'total_farm_area' => $profile->total_farm_area ?? 0,
                        'municipality' => $profile->municipality ?? 'N/A',
                        'barangay' => $profile->barangay ?? 'N/A',
                    ],
                    'farm_parcels' => $parcels->map(function ($parcel) {
                        $commodities = $parcel->commodities ?? collect();

                        return [
                            'id' => $parcel->id,
                            'parcel_number' => $parcel->parcel_number ?? 'N/A',
                            'barangay' => $parcel->barangay ?? 'N/A',
                            'total_farm_area' => $parcel->total_farm_area ?? 0,
                            'tenure_type' => $parcel->tenure_type ?? 'N/A',
                            'tenure_type_display' => $parcel->tenure_type 
                                ? \App\Models\FarmParcel::TENURE_TYPES[$parcel->tenure_type] ?? $parcel->tenure_type
                                : 'N/A',
                            'landowner_name' => $parcel->landowner_name ?? null,
                            'ownership_document_type' => $parcel->ownership_document_type ?? null,
                            'is_ancestral_domain' => $parcel->is_ancestral_domain ?? false,
                            'is_agrarian_reform_beneficiary' => $parcel->is_agrarian_reform_beneficiary ?? false,
                            'sector' => $parcel->sector ? [
                                'id' => $parcel->sector->id,
                                'name' => $parcel->sector->sector_name
                            ] : null,
                            'commodities' => $commodities->map(function ($commodity) {
                                return [
                                    'id' => $commodity->id,
                                    'commodity_name' => $commodity->commodity_name ?? 'N/A',
                                    'display_name' => $commodity->display_name ?? $commodity->commodity_name ?? 'N/A',
                                    'commodity_type' => $commodity->commodity_type ?? 'N/A',
                                    'size_hectares' => $commodity->pivot->size_hectares ?? 0,
                                    'number_of_heads' => $commodity->pivot->number_of_heads ?? 0,
                                    'farm_type' => $commodity->pivot->farm_type ?? 'N/A',
                                    'is_organic_practitioner' => $commodity->pivot->is_organic_practitioner ?? false,
                                    'remarks' => $commodity->pivot->remarks ?? null
                                ];
                            }),
                            'parcel_summary' => [
                                'total_commodities' => $commodities->count(),
                                'total_commodity_area' => $commodities->sum(fn($c) => $c->pivot->size_hectares ?? 0),
                                'remaining_area' => max(0, ($parcel->total_farm_area ?? 0) - $commodities->sum(fn($c) => $c->pivot->size_hectares ?? 0)),
                                'is_fully_utilized' => $commodities->sum(fn($c) => $c->pivot->size_hectares ?? 0) >= ($parcel->total_farm_area ?? 0),
                                'has_organic_commodities' => $commodities->contains(fn($c) => $c->pivot->is_organic_practitioner ?? false)
                            ]
                        ];
                    }),
                    'profile_summary' => [
                        'total_parcels' => $parcels->count(),
                        'total_area' => $parcels->sum('total_farm_area'),
                        'total_commodities' => $parcels->sum(fn($parcel) => ($parcel->commodities ?? collect())->count())
                    ]
                ];
            });

            $summary = [
                'total_farm_profiles' => $farmProfiles->count(),
                'total_parcels' => $farmProfiles->sum(fn($profile) => ($profile->farmParcels ?? collect())->count()),
                'total_farm_area' => $farmProfiles->sum(fn($profile) => ($profile->farmParcels ?? collect())->sum('total_farm_area')),
                'total_commodities' => $farmProfiles->sum(fn($profile) => ($profile->farmParcels ?? collect())->sum(fn($parcel) => ($parcel->commodities ?? collect())->count())),
                'organic_parcels' => $farmProfiles->sum(fn($profile) => ($profile->farmParcels ?? collect())->sum(fn($parcel) => ($parcel->commodities ?? collect())->contains(fn($c) => $c->pivot->is_organic_practitioner ?? false) ? 1 : 0))
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'farm_profiles' => $farmData,
                    'summary' => $summary,
                    'user' => [
                        'id' => $user->id,
                        'name' => trim($user->fname . ' ' . $user->lname),
                        'role' => $user->role,
                        'beneficiary_detail_id' => $user->beneficiaryDetail->id,
                        'rsbsa_number' => $user->beneficiaryDetail->rsbsa_number,
                        'barangay' => $user->beneficiaryDetail->barangay
                    ]
                ],
                'message' => 'User farm details retrieved successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching farm details', [
                'user_id' => $userId,
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch farm details: ' . $e->getMessage()
            ], 500);
        }
    }
}