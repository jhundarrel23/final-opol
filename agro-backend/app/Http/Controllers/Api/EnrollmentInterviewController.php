<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RsbsaEnrollment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EnrollmentInterviewController extends Controller
{
    /**
     * List enrollments for interview.
     * - Admins: see all
     * - Coordinators: see all interviews (both pending and verified by them)
     */
   public function index(Request $request): JsonResponse
{
    $user = auth()->user();

    $query = RsbsaEnrollment::query()->with([
        'user',
        'beneficiaryDetail',
        'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
        'farmProfile',
        'farmProfile.livelihoodCategory',
        'farmProfile.farmParcels',
        'farmProfile.farmParcels.parcelCommodities.commodity',
        'reviewer'
    ]);

    if ($user->role === 'coordinator') {
        $query->where(function ($q) use ($user) {
            $q->where(function ($subQ) {
                // Unassigned pending
                $subQ->whereNull('reviewed_by')
                     ->where('application_status', 'pending');
            })->orWhere(function ($subQ) use ($user) {
                // Completed by this coordinator (pending, approved, or rejected)
                $subQ->where('reviewed_by', $user->id)
                     ->whereNotNull('interview_completed_at')
                     ->whereIn('application_status', ['pending', 'approved', 'rejected']);
            });
        });
    }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('application_reference_code', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQ) use ($search) {
                      $userQ->where('fname', 'like', "%{$search}%")
                            ->orWhere('lname', 'like', "%{$search}%");
                  })
                  ->orWhereHas('beneficiaryDetail', function ($benefQ) use ($search) {
                      $benefQ->where('contact_number', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->input('per_page', 10);
        $enrollments = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($enrollments);
    }

    /**
     * Mark an enrollment interview as completed by coordinator.
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'coordinator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollment = RsbsaEnrollment::with([
            'user',
            'beneficiaryDetail',
            'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
            'farmProfile',
            'farmProfile.livelihoodCategory',
            'farmProfile.farmParcels',
            'farmProfile.farmParcels.parcelCommodities.commodity'
        ])->findOrFail($id);

        if ($enrollment->reviewed_by !== null) {
            return response()->json(['message' => 'Interview already completed by another coordinator'], 400);
        }

        $enrollment->reviewed_by = $user->id;
        $enrollment->interview_completed_at = now();
        $enrollment->save();

        $enrollment->load('reviewer');

        return response()->json([
            'message' => 'Interview completed successfully',
            'data' => $enrollment
        ]);
    }

    /**
     * Show interviews completed by the logged-in coordinator.
     */
    public function myInterviews(Request $request): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'coordinator') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = RsbsaEnrollment::where('reviewed_by', $user->id)
                                ->whereNotNull('interview_completed_at')
                                ->with([
                                    'user',
                                    'beneficiaryDetail',
                                    'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
                                    'farmProfile',
                                    'farmProfile.livelihoodCategory',
                                    'farmProfile.farmParcels',
                                    'farmProfile.farmParcels.parcelCommodities.commodity',
                                    'reviewer'
                                ]);

        $perPage = $request->input('per_page', 10);
        $enrollments = $query->orderBy('interview_completed_at', 'desc')->paginate($perPage);

        return response()->json($enrollments);
    }

    /**
     * Approve an enrollment (Admin only).
     */
    public function approve(int $id): JsonResponse
    {
        $user = auth()->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $enrollment = RsbsaEnrollment::with([
            'user',
            'beneficiaryDetail',
            'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
            'farmProfile',
            'farmProfile.livelihoodCategory',
            'farmProfile.farmParcels',
            'farmProfile.farmParcels.parcelCommodities.commodity'
        ])->findOrFail($id);

        if ($enrollment->application_status === 'approved') {
            return response()->json(['message' => 'Already approved'], 400);
        }

        if ($enrollment->application_status === 'rejected') {
            return response()->json(['message' => 'Cannot approve rejected enrollment'], 400);
        }

        $enrollment->application_status = 'approved';
        $enrollment->approved_at = now(); // ✅ only timestamp
        $enrollment->save();

        return response()->json([
            'message' => 'Enrollment approved successfully',
            'data' => $enrollment
        ]);
    }

    /**
     * Reject an enrollment (Admin only).
     */
   public function reject(Request $request, int $id): JsonResponse
{
    $user = auth()->user();

    if (!in_array($user->role, ['admin', 'coordinator'])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $enrollment = RsbsaEnrollment::with([
        'user',
        'beneficiaryDetail',
        'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
        'farmProfile',
        'farmProfile.livelihoodCategory',
        'farmProfile.farmParcels',
        'farmProfile.farmParcels.parcelCommodities.commodity'
    ])->findOrFail($id);

    if (in_array($enrollment->application_status, ['approved', 'rejected'])) {
        return response()->json(['message' => 'Already processed'], 400);
    }

    // ✅ Update status and track who processed the rejection
    $enrollment->application_status = 'rejected';
    $enrollment->rejected_at = now();
    $enrollment->reviewed_by = $user->id; // 👈 track the interviewer/rejector
    $enrollment->save();

    return response()->json([
        'message' => 'Enrollment rejected successfully',
        'data' => $enrollment->load('reviewer') // so frontend sees who handled it
    ]);
}



    /**
     * Admin view: List all enrollments (with optional search).
     */
    public function adminIndex(Request $request): JsonResponse
{
    $user = auth()->user();

    if ($user->role !== 'admin') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $query = RsbsaEnrollment::with([
        'user', 
        'beneficiaryDetail',
        'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
        'farmProfile',
        'farmProfile.livelihoodCategory',
        'farmProfile.farmParcels',
        'farmProfile.farmParcels.parcelCommodities.commodity',
        'reviewer' 
    ])
    ->where('application_status', 'pending')
    ->whereNotNull('reviewed_by'); 

    $perPage = min((int) $request->input('per_page', 10), 100);
    $enrollments = $query->orderBy('created_at', 'desc')->paginate($perPage);

    return response()->json($enrollments);
}


    /**
 * Admin: View history (approved + rejected enrollments).
 */
public function history(Request $request): JsonResponse
{
    $user = auth()->user();

    if ($user->role !== 'admin') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $query = RsbsaEnrollment::with([
        'user',
        'beneficiaryDetail',
        'beneficiaryDetail.beneficiaryLivelihoods.livelihoodCategory',
        'farmProfile',
        'farmProfile.livelihoodCategory',
        'farmProfile.farmParcels',
        'farmProfile.farmParcels.parcelCommodities.commodity',
        'reviewer'
    ])->whereIn('application_status', ['approved', 'rejected']); // ✅ history filter

    if ($request->filled('search')) {
        $search = $request->input('search');
        $query->where(function ($q) use ($search) {
            $q->where('application_reference_code', 'like', "%{$search}%")
            ->orWhereHas('user', function ($userQ) use ($search) {
                $userQ->where('fname', 'like', "%{$search}%")
                      ->orWhere('lname', 'like', "%{$search}%");
            })
            ->orWhereHas('beneficiaryDetail', function ($benefQ) use ($search) {
                $benefQ->where('contact_number', 'like', "%{$search}%");
            });
        });
    }

    $perPage = min((int) $request->input('per_page', 10), 100);
    $enrollments = $query->orderBy('updated_at', 'desc')->paginate($perPage);

    return response()->json($enrollments);
}

    /**
     * Complete an interview for an enrollment.
     */
    public function completeInterview(Request $request, $enrollmentId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'coordinator') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Only coordinators can complete interviews.'
                ], 403);
            }

            $enrollment = RsbsaEnrollment::with(['user', 'beneficiaryDetail.user'])->find($enrollmentId);
            
            if (!$enrollment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Enrollment not found.'
                ], 404);
            }

            // Update enrollment with interview completion
            $enrollment->interview_completed_at = now();
            $enrollment->reviewed_by = $user->id;
            $enrollment->save();

            // Log the interview completion
            Log::info('Interview completed', [
                'enrollment_id' => $enrollmentId,
                'coordinator_id' => $user->id,
                'coordinator_name' => $user->fname . ' ' . $user->lname,
                'beneficiary_name' => $enrollment->user->fname . ' ' . $enrollment->user->lname,
                'completed_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Interview completed successfully!',
                'data' => $enrollment->load('reviewer')
            ]);

        } catch (\Exception $e) {
            Log::error('Error completing interview: ' . $e->getMessage(), [
                'enrollment_id' => $enrollmentId,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while completing the interview.'
            ], 500);
        }
    }

}
