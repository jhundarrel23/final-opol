<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $userRole = $user->role;
            
            // Generate dynamic notifications based on user role and current data
            $notifications = $this->generateDynamicNotifications($user, $userRole);
            
            return response()->json([
                'success' => true,
                'data' => $notifications,
                'total_count' => count($notifications),
                'unread_count' => count(array_filter($notifications, fn($n) => $n['unread']))
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching notifications',
                'data' => []
            ], 500);
        }
    }

    /**
     * Generate dynamic notifications based on user data.
     */
    private function generateDynamicNotifications($user, $userRole)
    {
        $notifications = [];
        
        if ($userRole === 'admin') {
            // Admin notifications for program management
            $pendingPrograms = $this->getPendingProgramsCount();
            if ($pendingPrograms > 0) {
                $notifications[] = [
                    'id' => 'pending_programs_' . time(),
                    'type' => 'program_submitted',
                    'title' => 'Programs Pending Approval',
                    'message' => "You have {$pendingPrograms} program(s) waiting for approval",
                    'timestamp' => now()->toISOString(),
                    'unread' => true,
                    'priority' => 'high',
                    'data' => [
                        'pending_count' => $pendingPrograms,
                        'action_required' => 'approval'
                    ]
                ];
            }
            
            // Admin notifications for enrollment management
            $pendingEnrollments = $this->getPendingEnrollmentsCount();
            if ($pendingEnrollments > 0) {
                $notifications[] = [
                    'id' => 'pending_enrollments_' . time(),
                    'type' => 'enrollment_pending',
                    'title' => 'Enrollments Pending Review',
                    'message' => "You have {$pendingEnrollments} enrollment(s) waiting for review",
                    'timestamp' => now()->toISOString(),
                    'unread' => true,
                    'priority' => 'high',
                    'data' => [
                        'pending_count' => $pendingEnrollments,
                        'action_required' => 'review'
                    ]
                ];
            }
            
        
        } elseif ($userRole === 'coordinator') {
      
            $availableBeneficiaries = $this->getAvailableBeneficiariesCount($user);
            if ($availableBeneficiaries > 0) {
                $sectorName = $user->sector->sector_name ?? 'Unknown Sector';
                $isRBO = ($user->sector_id == 6); // RBO sector ID
                
                $categoryName = 'All Categories';
                if (!$isRBO) {
                    $category = \DB::table('commodity_categories')
                        ->join('commodities', 'commodity_categories.id', '=', 'commodities.category_id')
                        ->where('commodities.sector_id', $user->sector_id)
                        ->select('commodity_categories.category_name')
                        ->first();
                    $categoryName = $category->category_name ?? 'Your Category';
                }
                
                // Only create notification if there are actually new beneficiaries
                // (this prevents spam notifications)
                $notifications[] = [
                    'id' => 'available_' . $user->id . '_' . $availableBeneficiaries,
                    'type' => 'beneficiary_available',
                    'title' => 'New Beneficiaries Available',
                    'message' => "You have {$availableBeneficiaries} new beneficiaries available for assignment in {$sectorName}" . 
                                (!$isRBO ? " ({$categoryName})" : ''),
                    'timestamp' => now()->toISOString(),
                    'unread' => true,
                    'priority' => 'medium',
                    'data' => [
                        'available_count' => $availableBeneficiaries,
                        'sector_name' => $sectorName,
                        'category_name' => $categoryName,
                        'is_rbo' => $isRBO
                    ]
                ];
            }
            
            // Only show recent assignments if they happened in the last 2 hours (not 24 hours)
            $recentAssignments = $this->getRecentBeneficiaryAssignments($user, 2); // 2 hours instead of 24
            if ($recentAssignments > 0) {
                $notifications[] = [
                    'id' => 'assigned_' . $user->id . '_' . $recentAssignments,
                    'type' => 'beneficiary_assigned',
                    'title' => 'Recent Beneficiary Assignments',
                    'message' => "You have assigned {$recentAssignments} beneficiaries in the last 2 hours",
                    'timestamp' => now()->toISOString(),
                    'unread' => true,
                    'priority' => 'medium',
                    'data' => [
                        'assigned_count' => $recentAssignments,
                        'timeframe' => '2 hours'
                    ]
                ];
            }
        }
        
        return $notifications;
    }

    /**
     * Get count of available beneficiaries for the coordinator.
     */
    private function getAvailableBeneficiariesCount($user)
    {
        try {
            $coordinatorId = $user->id;
            $coordinatorSectorId = $user->sector_id;
            $isRBO = ($coordinatorSectorId == 6);
            
            $query = \App\Models\RsbsaEnrollment::where('application_status', 'approved')
                ->whereDoesntHave('coordinatorBeneficiaries', function($q) use ($coordinatorId) {
                    $q->where('coordinator_id', $coordinatorId);
                });
            
            if (!$isRBO) {
                $coordinatorCategoryId = \DB::table('commodities')
                    ->where('sector_id', $coordinatorSectorId)
                    ->value('category_id');
                
                if ($coordinatorCategoryId) {
                    $query->whereHas('beneficiaryDetail.farmProfiles.farmParcels.commodities', function($q) use ($coordinatorCategoryId) {
                        $q->where('category_id', $coordinatorCategoryId);
                    });
                }
            }
            
            return $query->count();
            
        } catch (\Exception $e) {
            Log::error('Error getting available beneficiaries count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get count of recent beneficiary assignments.
     */
    private function getRecentBeneficiaryAssignments($user, $hours = 2)
    {
        try {
            return \App\Models\CoordinatorBeneficiary::where('coordinator_id', $user->id)
                ->where('created_at', '>=', now()->subHours($hours))
                ->count();
                
        } catch (\Exception $e) {
            Log::error('Error getting recent assignments count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get count of pending programs for admin.
     */
    private function getPendingProgramsCount()
    {
        try {
            return \App\Models\SubsidyProgram::where('approval_status', 'pending')
                ->count();
                
        } catch (\Exception $e) {
            Log::error('Error getting pending programs count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get count of pending enrollments for admin.
     */
    private function getPendingEnrollmentsCount()
    {
        try {
            return \App\Models\RsbsaEnrollment::where('application_status', 'pending')
                ->count();
                
        } catch (\Exception $e) {
            Log::error('Error getting pending enrollments count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get count of new coordinator registrations for admin.
     */
    private function getNewCoordinatorsCount()
    {
        try {
            return \App\Models\User::where('role', 'coordinator')
                ->where('created_at', '>=', now()->subDays(7)) // Last 7 days
                ->count();
                
        } catch (\Exception $e) {
            Log::error('Error getting new coordinators count: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get unread count for the authenticated user.
     */
    public function unreadCount()
    {
        try {
            $user = Auth::user();
            $notifications = $this->generateDynamicNotifications($user, $user->role);
            $unreadCount = count(array_filter($notifications, fn($n) => $n['unread']));
            
            return response()->json([
                'success' => true,
                'unread_count' => $unreadCount
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error getting unread count: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'unread_count' => 0
            ], 500);
        }
    }

    /**
     * Mark notification as read (for localStorage sync).
     */
    public function markAsRead(Request $request, $id)
    {
        // Since we're using localStorage, this is mainly for API consistency
        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        // Since we're using localStorage, this is mainly for API consistency
        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }
}
