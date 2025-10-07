<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RsbsaEnrollment;
use App\Models\CoordinatorBeneficiary;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class CoordinatorBeneficiaryController extends Controller
{
    const STATUS_APPROVED = 'approved';
    const DEFAULT_VALUE = 'N/A';
    const RBO_SECTOR_ID = 6;

    /**
     * Extract commodities from a beneficiary (with category filtering).
     */
    private function extractCommodities($beneficiary, $categoryId = null)
    {
        $commodities = [];

        foreach ($beneficiary->farmProfiles ?? [] as $profile) {
            foreach ($profile->farmParcels ?? [] as $parcel) {
                foreach ($parcel->commodities ?? [] as $commodity) {
                    if ($commodity) {
                        if ($categoryId === null || $commodity->category_id == $categoryId) {
                            $commodities[] = [
                                'category'      => $commodity->category->category_name ?? 'Unknown',
                                'name'          => $commodity->commodity_name,
                                'parcelArea'    => $commodity->pivot->size_hectares ?? 0,
                                'numberOfHeads' => $commodity->pivot->number_of_heads ?? 0,
                                'farm_type'     => $commodity->pivot->farm_type ?? null,
                            ];
                        }
                    }
                }
            }
        }

        return $commodities;
    }

    /**
     * Transform beneficiary data (modal or full).
     */
    private function transformBeneficiaryData($enrollment, $assignmentData = null, $mode = 'full', $categoryId = null)
    {
        $beneficiary = $enrollment->beneficiaryDetail;
        $user = $beneficiary?->user;

        if (!$beneficiary || !$user) return null;

        $commodities = $this->extractCommodities($beneficiary, $categoryId);

        if ($mode === 'modal') {
            return [
                'enrollment_id'   => $enrollment->id,
                'reference_code'  => $enrollment->application_reference_code,
                'rsbsa_number'    => $beneficiary->rsbsa_number ?? self::DEFAULT_VALUE,
                'name'            => $this->formatFullName($user),
                'address'         => $beneficiary->barangay ?? self::DEFAULT_VALUE,
                'contact_number'  => $beneficiary->contact_number ?? $user->phone_number ?? self::DEFAULT_VALUE,
                'commodities'     => $commodities,
                'enrollment_year' => $enrollment->enrollment_year,
                'enrollment_type' => $enrollment->enrollment_type,
            ];
        }

        $totalFarmArea = collect($commodities)->sum('parcelArea');

        return [
            'id'                => $beneficiary->id,
            'enrollment_id'     => $enrollment->id,
            'assignment_id'     => $assignmentData['assignment_id'] ?? null,
            'rsbsaNumber'       => $beneficiary->rsbsa_number ?? null,
            'systemGeneratedRsbaNumber' => $enrollment->application_reference_code ?? null,

            'lastName'          => $user->lname ?? null,
            'firstName'         => $user->fname ?? null,
            'middleName'        => $user->mname ?? null,
            'suffixExtension'   => $user->extension_name ?? null,
            'name'              => $this->formatFullName($user),

            'contactNo'         => $beneficiary->contact_number ?? $user->phone_number ?? null,
            'sex'               => ucfirst($beneficiary->sex ?? 'N/A'),

            'streetPurokBarangay'=> $beneficiary->barangay ?? null,
            'municipality'      => $beneficiary->municipality ?? null,
            'province'          => $beneficiary->province ?? null,
            'region'            => $beneficiary->region ?? null,

            'commodities'       => $commodities,
            'farmArea'          => $totalFarmArea,
            'totalParcelArea'   => $totalFarmArea,
            'farmTypes'         => collect($commodities)->pluck('farm_type')->unique()->filter()->values()->all(),

            'status'            => $enrollment->application_status ?? 'pending',
            'createdAt'         => $assignmentData['created_at'] ?? $enrollment->created_at,
            'updatedAt'         => $enrollment->updated_at,

            'user_id'           => $user->id,
            'beneficiary_id'    => $beneficiary->id,
            'email'             => $user->email ?? null,
            'birthDate'         => $beneficiary->birth_date ?? null,
            'civilStatus'       => $beneficiary->civil_status ?? null,
            'isPwd'             => $beneficiary->is_pwd ?? false,
            'isHouseholdHead'   => $beneficiary->is_household_head ?? false,
        ];
    }

    /**
     * Format full name.
     */
    private function formatFullName($user)
    {
        return trim(implode(' ', array_filter([
            $user->fname,
            $user->mname,
            $user->lname,
            $user->extension_name
        ]))) ?: null;
    }

    /**
     * API response wrapper.
     */
    private function apiResponse($collection, $emptyMessage, $successMessage, $additionalData = [])
    {
        $response = [
            'success' => !$collection->isEmpty(),
            'message' => $collection->isEmpty() ? $emptyMessage : $successMessage,
            'data' => $collection->values(),
            'total_count' => $collection->count(),
        ];

        return response()->json(array_merge($response, $additionalData));
    }

    /**
     * Calculate sector-based statistics with proper units
     */
    private function calculateSectorStatistics($beneficiaries)
    {
        $sectors = [
            'rice' => [
                'count' => 0,
                'total_area' => 0,
                'unit' => 'hectares',
                'label' => 'Rice',
                'farm_types' => ['irrigated' => 0, 'rainfed upland' => 0, 'rainfed lowland' => 0]
            ],
            'corn' => [
                'count' => 0,
                'total_area' => 0,
                'unit' => 'hectares',
                'label' => 'Corn',
                'farm_types' => ['irrigated' => 0, 'rainfed upland' => 0, 'rainfed lowland' => 0]
            ],
            'hvc' => [
                'count' => 0,
                'total_area' => 0,
                'unit' => 'hectares',
                'label' => 'High-Value Crops'
            ],
            'livestock' => [
                'count' => 0,
                'total_heads' => 0,
                'unit' => 'heads',
                'label' => 'Livestock'
            ],
            'fisheries' => [
                'count' => 0,
                'total_area' => 0,
                'unit' => 'hectares',
                'label' => 'Fisheries'
            ],
            'other' => [
                'count' => 0,
                'total_area' => 0,
                'unit' => 'hectares',
                'label' => 'Other'
            ]
        ];

        $totalFarmArea = 0;

        foreach ($beneficiaries as $beneficiary) {
            $beneficiarySectors = [];
            
            foreach ($beneficiary['commodities'] ?? [] as $commodity) {
                $category = strtolower($commodity['category'] ?? '');
                $name = strtolower($commodity['name'] ?? '');
                $parcelArea = (float) ($commodity['parcelArea'] ?? 0);
                $numberOfHeads = (int) ($commodity['numberOfHeads'] ?? 0);
                $farmType = $commodity['farm_type'] ?? null;

                $totalFarmArea += $parcelArea;

                $sector = $this->classifySector($category, $name);
                
                if (!in_array($sector, $beneficiarySectors)) {
                    $beneficiarySectors[] = $sector;
                    $sectors[$sector]['count']++;
                }
                
                // Use appropriate measurement based on sector
                if ($sector === 'livestock') {
                    $sectors[$sector]['total_heads'] += $numberOfHeads;
                } else {
                    $sectors[$sector]['total_area'] += $parcelArea;
                }

                // Track farm types for rice and corn
                if (($sector === 'rice' || $sector === 'corn') && $farmType) {
                    if (isset($sectors[$sector]['farm_types'][$farmType])) {
                        $sectors[$sector]['farm_types'][$farmType]++;
                    }
                }
            }

            if (empty($beneficiary['commodities'])) {
                $sectors['other']['count']++;
            }
        }

        return [
            'total_beneficiaries' => $beneficiaries->count(),
            'total_farm_area' => round($totalFarmArea, 2),
            'sectors' => $sectors
        ];
    }

    /**
     * Classify commodity into agricultural sector
     */
    private function classifySector(string $category, string $name): string
    {
        if (str_contains($category, 'rice') || str_contains($name, 'rice') || str_contains($name, 'palay')) {
            return 'rice';
        }

        if (str_contains($category, 'corn') || str_contains($name, 'corn') || str_contains($name, 'mais')) {
            return 'corn';
        }

        if (str_contains($category, 'livestock') || str_contains($category, 'poultry') ||
            str_contains($name, 'pig') || str_contains($name, 'swine') ||
            str_contains($name, 'cattle') || str_contains($name, 'chicken') ||
            str_contains($name, 'duck') || str_contains($name, 'goat') ||
            str_contains($name, 'carabao')) {
            return 'livestock';
        }

        if (str_contains($category, 'fish') || str_contains($category, 'aquaculture') ||
            str_contains($name, 'tilapia') || str_contains($name, 'bangus') ||
            str_contains($name, 'milkfish') || str_contains($name, 'shrimp') ||
            str_contains($name, 'prawn')) {
            return 'fisheries';
        }

        if (str_contains($category, 'vegetable') || str_contains($category, 'fruit') ||
            str_contains($category, 'high-value') || str_contains($name, 'tomato') ||
            str_contains($name, 'eggplant') || str_contains($name, 'cabbage') ||
            str_contains($name, 'banana') || str_contains($name, 'mango') ||
            str_contains($name, 'pineapple')) {
            return 'hvc';
        }

        return 'other';
    }

    /**
     * Get empty statistics structure
     */
    private function getEmptyStatistics()
    {
        return [
            'total_beneficiaries' => 0,
            'total_farm_area' => 0,
            'sectors' => [
                'rice' => ['count' => 0, 'total_area' => 0, 'unit' => 'hectares', 'label' => 'Rice', 'farm_types' => []],
                'corn' => ['count' => 0, 'total_area' => 0, 'unit' => 'hectares', 'label' => 'Corn', 'farm_types' => []],
                'hvc' => ['count' => 0, 'total_area' => 0, 'unit' => 'hectares', 'label' => 'High-Value Crops'],
                'livestock' => ['count' => 0, 'total_heads' => 0, 'unit' => 'heads', 'label' => 'Livestock'],
                'fisheries' => ['count' => 0, 'total_area' => 0, 'unit' => 'hectares', 'label' => 'Fisheries'],
                'other' => ['count' => 0, 'total_area' => 0, 'unit' => 'hectares', 'label' => 'Other']
            ]
        ];
    }

    /**
     * Notify coordinator about new beneficiaries available for assignment.
     */
    private function notifyNewBeneficiariesAvailable($coordinatorId, $availableCount, $isRBO, $coordinatorCategoryId)
    {
        try {
            $coordinator = User::find($coordinatorId);
            if (!$coordinator) return;

            $sectorName = $coordinator->sector->sector_name ?? 'Unknown Sector';
            $categoryName = 'All Categories';
            
            if (!$isRBO && $coordinatorCategoryId) {
                $category = DB::table('commodity_categories')
                    ->where('id', $coordinatorCategoryId)
                    ->value('category_name');
                $categoryName = $category ?? 'Your Category';
            }

            $title = 'New Beneficiaries Available';
            $message = "You have {$availableCount} new beneficiaries available for assignment in {$sectorName}";
            if (!$isRBO) {
                $message .= " ({$categoryName})";
            }

            $notification = [
                'id' => time() . '_' . $coordinatorId,
                'type' => 'beneficiary_available',
                'title' => $title,
                'message' => $message,
                'timestamp' => now()->toISOString(),
                'unread' => true,
                'priority' => 'medium',
                'data' => [
                    'available_count' => $availableCount,
                    'sector_name' => $sectorName,
                    'category_name' => $categoryName,
                    'is_rbo' => $isRBO
                ]
            ];

            Log::info('New beneficiaries notification', [
                'coordinator_id' => $coordinatorId,
                'coordinator_name' => $coordinator->fname . ' ' . $coordinator->lname,
                'available_count' => $availableCount,
                'sector' => $sectorName,
                'category' => $categoryName,
                'notification' => $notification
            ]);

        } catch (Exception $e) {
            Log::error('Error creating beneficiary available notification: ' . $e->getMessage(), [
                'coordinator_id' => $coordinatorId,
                'available_count' => $availableCount
            ]);
        }
    }

    /**
     * Notify coordinator about successfully assigned beneficiaries.
     */
    private function notifyBeneficiariesAssigned($coordinatorId, $assignedCount)
    {
        try {
            $coordinator = User::find($coordinatorId);
            if (!$coordinator) return;

            $title = 'Beneficiaries Successfully Assigned';
            $message = "You have successfully assigned {$assignedCount} new beneficiaries to your account";

            $notification = [
                'id' => time() . '_assigned_' . $coordinatorId,
                'type' => 'beneficiary_assigned',
                'title' => $title,
                'message' => $message,
                'timestamp' => now()->toISOString(),
                'unread' => true,
                'priority' => 'medium',
                'data' => [
                    'assigned_count' => $assignedCount,
                    'coordinator_name' => $coordinator->fname . ' ' . $coordinator->lname
                ]
            ];

            Log::info('Beneficiaries assigned notification', [
                'coordinator_id' => $coordinatorId,
                'coordinator_name' => $coordinator->fname . ' ' . $coordinator->lname,
                'assigned_count' => $assignedCount,
                'notification' => $notification
            ]);

        } catch (Exception $e) {
            Log::error('Error creating beneficiary assigned notification: ' . $e->getMessage(), [
                'coordinator_id' => $coordinatorId,
                'assigned_count' => $assignedCount
            ]);
        }
    }

    /**
     * Fetch enrollments (for modal) - CATEGORY-BASED FILTERING
     */
    public function enrollmentList(Request $request)
    {
        try {
            $coordinatorId = Auth::id();
            $coordinator = Auth::user();
            $coordinatorSectorId = $coordinator->sector_id ?? null;

            if (!$coordinatorSectorId) {
                Log::warning('Coordinator sector not set', [
                    'coordinator_id' => $coordinatorId,
                    'coordinator_name' => $coordinator->fname . ' ' . $coordinator->lname
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Coordinator sector not set. Please contact administrator.',
                    'data' => [],
                    'total_count' => 0
                ]);
            }

            $isRBO = ($coordinatorSectorId == self::RBO_SECTOR_ID);
            $coordinatorCategoryId = null;

            if (!$isRBO) {
                $coordinatorCategoryId = DB::table('commodities')
                    ->where('sector_id', $coordinatorSectorId)
                    ->value('category_id');

                if (!$coordinatorCategoryId) {
                    Log::warning('No category found for coordinator sector', [
                        'coordinator_id' => $coordinatorId,
                        'sector_id' => $coordinatorSectorId
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'No category found for your sector. Please contact administrator.',
                        'data' => [],
                        'total_count' => 0
                    ]);
                }
            }

            Log::info('Coordinator enrollment list query', [
                'coordinator_id' => $coordinatorId,
                'sector_id' => $coordinatorSectorId,
                'category_id' => $coordinatorCategoryId,
                'is_rbo' => $isRBO
            ]);

            $query = RsbsaEnrollment::where('application_status', self::STATUS_APPROVED)
                ->with([
                    'beneficiaryDetail.user',
                    'beneficiaryDetail.farmProfiles.farmParcels.commodities.category',
                ])
                ->whereDoesntHave('coordinatorBeneficiaries', function($q) use ($coordinatorId) {
                    $q->where('coordinator_id', $coordinatorId);
                });

            if (!$isRBO && $coordinatorCategoryId) {
                $query->whereHas('beneficiaryDetail.farmProfiles.farmParcels.commodities', function($q) use ($coordinatorCategoryId) {
                    $q->where('category_id', $coordinatorCategoryId);
                });
            }

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('application_reference_code', 'like', "%{$search}%")
                      ->orWhereHas('beneficiaryDetail', function ($b) use ($search) {
                          $b->where('rsbsa_number', 'like', "%{$search}%");
                      })
                      ->orWhereHas('beneficiaryDetail.user', function ($b) use ($search) {
                          $b->whereRaw(
                              "CONCAT_WS(' ', fname, mname, lname, extension_name) LIKE ?",
                              ["%{$search}%"]
                          );
                      });
                });
            }

            $enrollments = $query->get();

            $flattened = $enrollments
                ->map(fn($enrollment) => $this->transformBeneficiaryData($enrollment, null, 'modal', $coordinatorCategoryId))
                ->filter();

            $availableCount = $flattened->count();
            if ($availableCount > 0) {
                $this->notifyNewBeneficiariesAvailable($coordinatorId, $availableCount, $isRBO, $coordinatorCategoryId);
            }

            return $this->apiResponse($flattened, 'No available enrollments found.', 'Available enrollments retrieved successfully');

        } catch (Exception $e) {
            Log::error('Error in enrollmentList: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'coordinator_id' => Auth::id(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching enrollments.',
                'data' => [],
                'total_count' => 0
            ], 500);
        }
    }

    /**
     * Fetch my beneficiaries (for table) with sector statistics
     */
    public function myBeneficiaries(Request $request)
    {
        try {
            $coordinatorId = Auth::id();
            $coordinator = Auth::user();
            $coordinatorSectorId = $coordinator->sector_id ?? null;

            if (!$coordinatorSectorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Coordinator sector not set.',
                    'data' => [],
                    'total_count' => 0,
                    'statistics' => $this->getEmptyStatistics()
                ]);
            }

            $isRBO = ($coordinatorSectorId == self::RBO_SECTOR_ID);
            $coordinatorCategoryId = null;

            if (!$isRBO) {
                $coordinatorCategoryId = DB::table('commodities')
                    ->where('sector_id', $coordinatorSectorId)
                    ->value('category_id');

                if (!$coordinatorCategoryId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No category found for your sector.',
                        'data' => [],
                        'total_count' => 0,
                        'statistics' => $this->getEmptyStatistics()
                    ]);
                }
            }

            $beneficiariesQuery = CoordinatorBeneficiary::with([
                'enrollment.beneficiaryDetail.user',
                'enrollment.beneficiaryDetail.farmProfiles.farmParcels.commodities.category',
            ])->where('coordinator_id', $coordinatorId);

            if (!$isRBO && $coordinatorCategoryId) {
                $beneficiariesQuery->whereHas('enrollment.beneficiaryDetail.farmProfiles.farmParcels.commodities', function($q) use ($coordinatorCategoryId) {
                    $q->where('category_id', $coordinatorCategoryId);
                });
            }

            $beneficiaries = $beneficiariesQuery->get();

            $flattened = $beneficiaries->map(function ($b) use ($coordinatorCategoryId) {
                $enrollment = $b->enrollment;
                if (!$enrollment) return null;

                return $this->transformBeneficiaryData($enrollment, [
                    'assignment_id' => $b->id,
                    'created_at' => $b->created_at
                ], 'full', $coordinatorCategoryId);
            })->filter();

            $statistics = $this->calculateSectorStatistics($flattened);

            return response()->json([
                'success' => !$flattened->isEmpty(),
                'message' => $flattened->isEmpty() 
                    ? 'No beneficiaries assigned yet.' 
                    : 'Assigned beneficiaries retrieved successfully',
                'data' => $flattened->values(),
                'total_count' => $flattened->count(),
                'statistics' => $statistics
            ]);

        } catch (\Exception $e) {
            Log::error('Error in myBeneficiaries: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching assigned beneficiaries.',
                'data' => [],
                'total_count' => 0,
                'statistics' => $this->getEmptyStatistics()
            ], 500);
        }
    }

    /**
     * Assign beneficiaries to coordinator.
     */
    public function addBeneficiaries(Request $request)
    {
        $request->validate([
            'enrollment_ids' => 'required|array',
            'enrollment_ids.*' => 'exists:rsbsa_enrollments,id'
        ]);

        try {
            $coordinatorId = Auth::id();
            $enrollmentIds = $request->enrollment_ids;
            
            $assignedCount = 0;
            $alreadyAssignedCount = 0;
            $totalRequested = count($enrollmentIds);

            DB::transaction(function () use ($enrollmentIds, $coordinatorId, &$assignedCount, &$alreadyAssignedCount) {
                foreach ($enrollmentIds as $enrollmentId) {
                    $assignment = CoordinatorBeneficiary::firstOrCreate([
                        'coordinator_id' => $coordinatorId,
                        'enrollment_id' => $enrollmentId
                    ]);

                    if ($assignment->wasRecentlyCreated) {
                        $assignedCount++;
                    } else {
                        $alreadyAssignedCount++;
                    }
                }
            });

            if ($assignedCount > 0) {
                $this->notifyBeneficiariesAssigned($coordinatorId, $assignedCount);
            }

            return response()->json([
                'success' => true,
                'message' => $assignedCount > 0 
                    ? "Successfully assigned {$assignedCount} beneficiaries!" 
                    : "All selected beneficiaries were already assigned.",
                'data' => [
                    'assigned_count' => $assignedCount,
                    'already_assigned_count' => $alreadyAssignedCount,
                    'total_requested' => $totalRequested
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Error in addBeneficiaries: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'enrollment_ids' => $request->enrollment_ids ?? []
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while assigning beneficiaries.'
            ], 500);
        }
    }

    /**
     * Remove assigned beneficiary.
     */
    public function removeBeneficiary($id)
    {
        try {
            $coordinatorId = Auth::id();

            $assignment = CoordinatorBeneficiary::where('id', $id)
                ->where('coordinator_id', $coordinatorId)
                ->first();

            if (!$assignment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Beneficiary not found or not assigned to you.'
                ], 404);
            }

            $assignment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Beneficiary removed successfully.'
            ]);
        } catch (Exception $e) {
            Log::error('Error in removeBeneficiary: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while removing the beneficiary.'
            ], 500);
        }
    }

    /**
     * Transfer beneficiaries between coordinators (Admin only).
     */
    public function transferBeneficiaries(Request $request)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $request->validate([
            'from_coordinator_id' => 'required|exists:users,id',
            'to_coordinator_id' => 'required|exists:users,id'
        ]);

        try {
            $fromCoord = User::find($request->from_coordinator_id);
            $toCoord = User::find($request->to_coordinator_id);
            
            $fromIsRBO = ($fromCoord->sector_id == self::RBO_SECTOR_ID);
            $toIsRBO = ($toCoord->sector_id == self::RBO_SECTOR_ID);

            if (!($fromIsRBO && $toIsRBO) && ($fromCoord->sector_id !== $toCoord->sector_id)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Coordinators must be in same sector or both must be RBO coordinators'
                ], 400);
            }

            $beneficiaryCount = DB::table('coordinator_beneficiaries')
                ->where('coordinator_id', $request->from_coordinator_id)
                ->count();

            if ($beneficiaryCount === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No beneficiaries found for the source coordinator'
                ], 404);
            }

            $transferred = DB::table('coordinator_beneficiaries')
                ->where('coordinator_id', $request->from_coordinator_id)
                ->update([
                    'coordinator_id' => $request->to_coordinator_id,
                    'updated_at' => now()
                ]);

            Log::info("Beneficiaries transferred", [
                'from_coordinator' => $request->from_coordinator_id,
                'to_coordinator' => $request->to_coordinator_id,
                'count' => $transferred,
                'transferred_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully transferred {$transferred} beneficiaries",
                'data' => [
                    'transferred_count' => $transferred,
                    'from_coordinator' => $fromCoord->fname . ' ' . $fromCoord->lname,
                    'to_coordinator' => $toCoord->fname . ' ' . $toCoord->lname
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Error in transferBeneficiaries: ' . $e->getMessage(), [
                'from_coordinator_id' => $request->from_coordinator_id,
                'to_coordinator_id' => $request->to_coordinator_id,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during the transfer'
            ], 500);
        }
    }
}