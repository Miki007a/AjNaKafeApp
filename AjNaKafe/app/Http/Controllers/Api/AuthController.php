<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\User;
use http\Env\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function signup(SignupRequest $request)
    {
        try {
            $data = $request->validated();
            Log::info('Validated data:', ['data' => $data]);

            if ($request->hasFile('profile_picture')) {
                $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
                Log::info('Profile picture stored at:', ['path' => $profilePicturePath]);
                $data['profile_picture'] = $profilePicturePath;
            }

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'telephone' => $data['telephone'],
                'gender' => $data['gender'],
                'location' => $data['location'],
                'date' => $data['date'],
                'preference' => $data['preference'],
                'profile_picture' => $data['profile_picture'] ?? null,
            ]);

            Log::info('User created:', $user->toArray());

            $token = $user->createToken('main')->plainTextToken;
            return response(compact('user', 'token'));
        } catch (\Exception $e) {
            Log::error('Signup error:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }


    public function login(LoginRequest $request)
    {

        $credentials = $request->validated();
        if (!Auth::attempt($credentials)) {
            return response([
                'message' => 'Внесената е-пошта или лозинка е неточна.'
            ], 422);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $token = $user->createToken('main')->plainTextToken;
        return response(compact('user', 'token'));
    }

    public function logout(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);
    }
}
