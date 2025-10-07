<?php

namespace App\Http\Controllers\Api\Beneficiary;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use App\Mail\Beneficiary\BeneficiaryPasswordResetMail;
use App\Models\User;

class BeneficiaryAuthController extends Controller
{
    /**
     * Register a new beneficiary and return auth token
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fname'           => 'required|string|max:50',
            'mname'           => 'nullable|string|max:50',
            'lname'           => 'required|string|max:50',
            'extension_name'  => 'nullable|string|max:10',
            'username'        => 'required|string|max:50|unique:users,username',
            'email'           => 'nullable|email|unique:users,email',
            'password'        => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'fname'           => strtoupper($request->fname),
            'mname'           => $request->mname ? strtoupper($request->mname) : null,
            'lname'           => strtoupper($request->lname),
            'extension_name'  => $request->extension_name ? strtoupper($request->extension_name) : null,
            'username'        => $request->username,
            'email'           => $request->email,
            'role'            => 'beneficiary',
            'status'          => 'active',
            'sector_id'       => null,
            'password'        => Hash::make($request->password),
        ]);

        $token = $user->createToken('BeneficiaryToken')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Beneficiary registered successfully',
            'data'    => $user,
            'token'   => $token
        ], 201);
    }

    /**
     * Login beneficiary with email or username
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'emailOrUsername' => 'required|string',
            'password'        => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::where('username', $request->emailOrUsername)
                    ->orWhere('email', $request->emailOrUsername)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid login credentials'
            ], 401);
        }

        $token = $user->createToken('BeneficiaryToken')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data'    => $user,
            'token'   => $token
        ]);
    }

    /**
     * Check if username/email is available
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'nullable|string|max:50',
            'email'    => 'nullable|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $response = [
            'success'          => true,
            'username_checked' => false,
            'email_checked'    => false,
        ];

        if ($request->filled('username')) {
            $exists = User::where('username', $request->username)->exists();
            $response['username_checked']   = true;
            $response['username_available'] = !$exists;
            $response['username_message']   = $exists
                ? 'Username is already taken.'
                : 'Username is available.';
        }

        if ($request->filled('email')) {
            $exists = User::where('email', $request->email)->exists();
            $response['email_checked']   = true;
            $response['email_available'] = !$exists;
            $response['email_message']   = $exists
                ? 'Email is already taken.'
                : 'Email is available.';
        }

        return response()->json($response);
    }

    /**
     * Logout beneficiary (revoke current token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Show beneficiary profile by ID
     */
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);

            $userData = [
                'id'             => $user->id,
                'fname'          => $user->fname,
                'mname'          => $user->mname,
                'lname'          => $user->lname,
                'extension_name' => $user->extension_name,
                'username'       => $user->username,
                'email'          => $user->email,
                'role'           => $user->role,
                'status'         => $user->status,
            ];

            return response()->json([
                'success' => true,
                'message' => 'User details retrieved successfully',
                'data'    => $userData
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'error'   => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update beneficiary profile (names only)
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'fname'          => 'required|string|max:50',
            'mname'          => 'nullable|string|max:50',
            'lname'          => 'required|string|max:50',
            'extension_name' => 'nullable|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $user = User::findOrFail($id);
            $currentUser = auth()->user();

            if ($currentUser->id != $id && $currentUser->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this user'
                ], 403);
            }

            $user->update([
                'fname'          => strtoupper($request->fname),
                'mname'          => $request->mname ? strtoupper($request->mname) : null,
                'lname'          => strtoupper($request->lname),
                'extension_name' => $request->extension_name ? strtoupper($request->extension_name) : null,
                'updated_at'     => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User names updated successfully',
                'data'    => [
                    'id'             => $user->id,
                    'fname'          => $user->fname,
                    'mname'          => $user->mname,
                    'lname'          => $user->lname,
                    'extension_name' => $user->extension_name,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password (requires current password)
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 401);
        }

        $user->password = bcrypt($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Send reset link via email (forgot password)
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->role !== 'beneficiary') {
            return response()->json([
                'success' => false,
                'message' => 'No beneficiary account found with this email'
            ], 404);
        }

        $token = Password::createToken($user);

        Mail::to($user->email)->send(new BeneficiaryPasswordResetMail($user, $token));

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent successfully to your email'
        ], 200);
    }

    /**
     * Reset password using token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                // logout from all devices
                $user->tokens()->delete();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['success' => true, 'message' => 'Password reset successfully'], 200)
            : response()->json(['success' => false, 'message' => __($status)], 500);
    }
}
