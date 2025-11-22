<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SignupRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        return UserResource::collection(User::query()->orderBy('id', 'desc')->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \App\Http\Requests\StoreUserRequest $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $user = User::create($data);

        return response(new UserResource($user) , 201);
    }

    /**
     * Display the specified resource.
     *
     * @param \App\Models\User $user
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param \App\Http\Requests\UpdateUserRequest $request
     * @param \App\Models\User                     $user
     * @return User
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        \Log::info('Request Data:', $request->all()); // Log all request data
        \Log::info('I AM UPDATE:', $request->all()); // Log all request data

        // Check for uploaded files
        if ($request->hasFile('user_pictures')) {
            \Log::info('Uploaded User Pictures:', $request->file('user_pictures'));
        }


        $authUserId = auth()->id();

        // Check if the authenticated user is the same as the user being updated
        if ($authUserId !== $user->id) {
            // Return a 403 Forbidden response if the IDs do not match
            return response()->json(['error' => 'You are not authorized to update this profile'], 403);
        }

        $data = $request->validated();

        // Handle password update
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        // Handle profile picture update
        if ($request->hasFile('profile_picture')) {
            $profilePicturePath = $request->file('profile_picture')->store('profile_pictures', 'public');
            $data['profile_picture'] = $profilePicturePath;
        }

        // Handle multiple user pictures update
        $userPictures = [];
        if ($request->hasFile('user_pictures')) {
            foreach ($request->file('user_pictures') as $picture) {
                $picturePath = $picture->store('user_pictures', 'public');
                $userPictures[] = $picturePath;
            }
            // If there are existing user pictures, append the new ones
            if ($user->user_pictures) {
                $existingPictures = explode(':', $user->user_pictures);
                $userPictures = array_merge($existingPictures, $userPictures);
            }
            $data['user_pictures'] = implode(':', $userPictures); // Save all pictures paths, separated by colon
        }

        // Update the user
        $user->update($data);

        return $user;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param \App\Models\User $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response("", 204);
    }
}
