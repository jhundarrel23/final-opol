<?php

namespace App\Http\Controllers\Api\Coordinator;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Mail\CoordinatorAccountCreatedMail;
use App\Mail\Coordinator\CoordinatorPasswordResetMail;
use Carbon\Carbon;

class CoordinatorController extends Controller
{
    /**
     * Helper method to capitalize names properly
     */
    private function capitalizeName($name)
    {
        if (empty($name)) {
            return $name;
        }
        
        // Handle names with spaces, hyphens, and apostrophes
        return preg_replace_callback('/\b\w+/u', function($matches) {
            return ucfirst(strtolower($matches[0]));
        }, $name);
    }

    /**
     * Coordinator login
     */
    public function login(Request $request)
    {
        $request->validate([
            'emailOrUsername' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginInput = $request->input('emailOrUsername');
        $password = $request->input('password');

        $user = User::with('sector')
            ->where(function ($query) use ($loginInput) {
                $query->where('email', $loginInput)
                    ->orWhere('username', $loginInput);
            })->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email/username or password.'
            ], 401);
        }

        if ($user->role !== 'coordinator') {
            return response()->json([
                'message' => 'Access denied. Only coordinators can log in here.'
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Account is inactive.'
            ], 403);
        }

        $token = $user->createToken('Coordinator Token')->plainTextToken;

        $userData = $user->toArray();
        $userData['force_password_reset'] = $user->role === 'coordinator'
            ? (bool) $user->force_password_reset
            : false;

        return response()->json([
            'message' => 'Login successful.',
            'data' => $userData,
            'token' => $token,
            'token_type' => 'Bearer',
            'force_password_reset' => $user->role === 'coordinator'
                ? (bool) $user->force_password_reset
                : false,
        ], 200);
    }

    /**
     * Send forgot password reset link
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $coordinator = User::where('email', $request->email)
                            ->where('role', 'coordinator')
                            ->where('status', 'active')
                            ->first();

            if (!$coordinator) {
                return response()->json([
                    'message' => 'Email address not found or account is not active.'
                ], 404);
            }

            $recentReset = DB::table('password_reset_tokens')
                        ->where('email', $request->email)
                        ->where('created_at', '>', Carbon::now()->subMinutes(1))
                        ->first();

            if ($recentReset) {
                return response()->json([
                    'message' => 'Password reset link was recently sent. Please wait before requesting again.'
                ], 429);
            }

            $token = Str::random(64);
            
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'email' => $request->email,
                    'token' => Hash::make($token),
                    'created_at' => Carbon::now()
                ]
            );

            Mail::to($coordinator->email)->send(new CoordinatorPasswordResetMail($coordinator, $token));

            return response()->json([
                'message' => 'Password reset link has been sent to your email address.'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to send reset link. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Reset password using token from email
     */
    public function resetPasswordWithToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $passwordReset = DB::table('password_reset_tokens')
                        ->where('email', $request->email)
                        ->first();

            if (!$passwordReset) {
                return response()->json([
                    'message' => 'Invalid reset token or email.'
                ], 400);
            }

            if (!Hash::check($request->token, $passwordReset->token)) {
                return response()->json([
                    'message' => 'Invalid reset token.'
                ], 400);
            }

            if (Carbon::parse($passwordReset->created_at)->addHours(24)->isPast()) {
                DB::table('password_reset_tokens')->where('email', $request->email)->delete();
                
                return response()->json([
                    'message' => 'Reset token has expired. Please request a new one.'
                ], 400);
            }

            $coordinator = User::where('email', $request->email)
                            ->where('role', 'coordinator')
                            ->first();

            if (!$coordinator) {
                return response()->json([
                    'message' => 'Coordinator not found.'
                ], 404);
            }

            $coordinator->password = Hash::make($request->password);
            $coordinator->force_password_reset = false;
            $coordinator->save();

            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            $userData = $coordinator->fresh()->toArray();
            $userData['force_password_reset'] = $coordinator->role === 'coordinator'
                ? false
                : false;

            return response()->json([
                'message' => 'Password has been reset successfully. You can now login with your new password.',
                'data' => $userData
            ], 200);

        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to reset password. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Store new coordinator
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fname' => 'required|string|max:255',
            'mname' => 'nullable|string|max:255',
            'lname' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'sector_id' => 'nullable|exists:sectors,id',
            'force_password_reset' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $rawPassword = $request->password;

            $user = User::create([
                'fname' => $this->capitalizeName($request->fname),
                'mname' => $this->capitalizeName($request->mname),
                'lname' => $this->capitalizeName($request->lname),
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($rawPassword),
                'role' => 'coordinator',
                'sector_id' => $request->sector_id,
                'status' => 'active',
                'force_password_reset' => $request->force_password_reset ?? false
            ]);

            Mail::to($user->email)->send(new CoordinatorAccountCreatedMail($user, $rawPassword));

            $token = $user->createToken('Coordinator Token')->plainTextToken;

            $userData = $user->toArray();
            $userData['force_password_reset'] = $user->role === 'coordinator'
                ? (bool) $user->force_password_reset
                : false;

            return response()->json([
                'message' => 'Coordinator created successfully.',
                'data' => $userData,
                'token' => $token,
                'token_type' => 'Bearer'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating coordinator',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update coordinator
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'fname' => 'required|string|max:255',
            'mname' => 'nullable|string|max:255', 
            'lname' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'sector_id' => 'nullable|exists:sectors,id',
            'force_password_reset' => 'boolean',
            'password' => 'nullable|string|min:8'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $coordinator = User::where('role', 'coordinator')->findOrFail($id);

            $coordinator->fname = $this->capitalizeName($request->fname);
            $coordinator->mname = $this->capitalizeName($request->mname);
            $coordinator->lname = $this->capitalizeName($request->lname);
            $coordinator->email = $request->email;
            $coordinator->username = $request->username;
            $coordinator->sector_id = $request->sector_id;

            if ($request->has('force_password_reset') && $request->force_password_reset) {
                if ($request->has('password') && $request->password) {
                    $coordinator->password = Hash::make($request->password);
                    $coordinator->force_password_reset = true;
                    
                    try {
                        Mail::to($coordinator->email)->send(new CoordinatorAccountCreatedMail($coordinator, $request->password));
                    } catch (\Exception $e) {
                        Log::warning('Failed to send password reset email: ' . $e->getMessage());
                    }
                }
            }

            $coordinator->save();

            $coordinator = $coordinator->fresh(['sector']);

            $coordinatorData = [
                'id' => $coordinator->id,
                'fname' => $coordinator->fname,
                'mname' => $coordinator->mname,
                'lname' => $coordinator->lname,
                'username' => $coordinator->username,
                'email' => $coordinator->email,
                'role' => $coordinator->role,
                'status' => $coordinator->status,
                'sector_id' => $coordinator->sector_id,
                'force_password_reset' => $coordinator->role === 'coordinator'
                    ? (bool) $coordinator->force_password_reset
                    : false,
                'full_name' => trim(
                    $coordinator->fname . ' ' .
                    ($coordinator->mname ? $coordinator->mname . ' ' : '') .
                    $coordinator->lname
                ),
                'sector' => $coordinator->sector ? [
                    'id' => $coordinator->sector->id,
                    'sector_name' => $coordinator->sector->sector_name
                ] : null,
            ];

            return response()->json([
                'message' => 'Coordinator updated successfully.',
                'data' => $coordinatorData
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Coordinator not found.'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Coordinator update error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Error updating coordinator',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * List all coordinators
     */
    public function index(Request $request)
    {
        try {
            $coordinators = User::whereRaw('LOWER(role) = ?', ['coordinator'])
                ->with('sector')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'fname' => $user->fname,
                        'mname' => $user->mname,
                        'lname' => $user->lname,
                        'extension_name' => $user->extension_name,
                        'username' => $user->username,
                        'full_name' => trim(
                            $user->fname . ' ' .
                            ($user->mname ? $user->mname . ' ' : '') .
                            $user->lname .
                            ($user->extension_name ? ' ' . $user->extension_name : '')
                        ),
                        'email' => $user->email,
                        'role' => $user->role,
                        'status' => $user->status,
                        'sector_id' => $user->sector_id,
                        'force_password_reset' => $user->role === 'coordinator'
                            ? (bool) $user->force_password_reset
                            : false,
                        'sector' => $user->sector ? [
                            'id' => $user->sector->id,
                            'sector_name' => $user->sector->sector_name
                        ] : null,
                    ];
                });

            return response()->json([
                'message' => 'List of coordinators retrieved successfully.',
                'data' => $coordinators,
                'token' => $request->bearerToken(),
                'token_type' => 'Bearer'
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Coordinator fetch error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to retrieve coordinators.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show single coordinator
     */
    public function show(Request $request, $id)
    {
        $coordinator = User::where('role', 'coordinator')->with('sector')->find($id);

        if (!$coordinator) {
            return response()->json([
                'message' => 'Coordinator not found.'
            ], 404);
        }

        $coordinatorData = $coordinator->toArray();
        $coordinatorData['force_password_reset'] = $coordinator->role === 'coordinator'
            ? (bool) $coordinator->force_password_reset
            : false;

        return response()->json([
            'message' => 'Coordinator retrieved successfully.',
            'data' => $coordinatorData,
            'token' => $request->bearerToken(),
            'token_type' => 'Bearer'
        ], 200);
    }

    /**
     * Deactivate/Delete coordinator (soft delete)
     */
    public function destroy($id)
    {
        try {
            $coordinator = User::where('role', 'coordinator')->findOrFail($id);

            $coordinator->status = 'inactive';
            $coordinator->save();

            return response()->json([
                'message' => 'Coordinator deactivated successfully.',
                'data' => [
                    'id' => $coordinator->id,
                    'full_name' => trim($coordinator->fname . ' ' . ($coordinator->mname ? $coordinator->mname . ' ' : '') . $coordinator->lname),
                    'status' => $coordinator->status
                ]
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Coordinator not found.'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Coordinator delete error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Error deactivating coordinator',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Reset coordinator password (normal flow)
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.'
            ], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->force_password_reset = false;
        $user->save();

        $userData = $user->fresh()->toArray();
        $userData['force_password_reset'] = $user->role === 'coordinator'
            ? false
            : false;

        return response()->json([
            'message' => 'Password updated successfully.',
            'data' => $userData
        ], 200);
    }

    /**
     * Force reset password (first login)
     */
    public function forceResetPassword(Request $request)
    {
        $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if ($user->role !== 'coordinator') {
            return response()->json([
                'message' => 'Only coordinators can use this endpoint.'
            ], 403);
        }

        if (!$user->force_password_reset) {
            return response()->json([
                'message' => 'Password reset is not required for this account.'
            ], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->force_password_reset = false;
        $user->save();

        $userData = $user->fresh()->toArray();
        $userData['force_password_reset'] = false;

        return response()->json([
            'message' => 'Password has been reset successfully.',
            'data' => $userData
        ], 200);
    }
}