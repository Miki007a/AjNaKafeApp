<?php

namespace App\Http\Controllers;

use App\Jobs\FindCafeForMatch;
use App\Models\Chat;
use App\Models\Like;
use App\Models\Matches;
use App\Models\Message;
use App\Models\User;
use App\Notifications\MatchFound;
use Illuminate\Http\Request;


class LikeController extends Controller
{
    public function likeUser(Request $request)
    {
        $fromUserId = auth()->id();
        $toUserId = $request->input('to_user_id');
        $status = $request->input('status');

        // Check for reciprocal like
        if ($status === 'like') {
            Like::create([
                'from_user_id' => $fromUserId,
                'to_user_id' => $toUserId,
                'status' => 'like',
            ]);

            $reciprocalLike = Like::where('from_user_id', $toUserId)
                ->where('to_user_id', $fromUserId)
                ->where('status', 'like')
                ->first();

            if ($reciprocalLike) {
                // Create a match if both users liked each other
                $match = Matches::create([
                    'user1_id' => $fromUserId,
                    'user2_id' => $toUserId,
                    'status' => 'active', // Mutual match
                    'match_date' => now(),
                ]);

                // Create a chat between the two users
                $chat = Chat::create([
                    'user1_id' => $fromUserId,
                    'user2_id' => $toUserId,
                ]);

                // Dispatch async job to find cafe and create center message
                FindCafeForMatch::dispatch($chat->id, $fromUserId, $toUserId);

                // Get both users
                $fromUser = User::find($fromUserId);
                $toUser = User::find($toUserId);

                // Send notifications to both users using Laravel Notifications
                \Log::info('Sending match notification to user: ' . $fromUser->id);
                $fromUser->notify(new MatchFound($match, $toUser));
                
                \Log::info('Sending match notification to user: ' . $toUser->id);
                $toUser->notify(new MatchFound($match, $fromUser));
            }
        } elseif ($status === 'dislike') {
            // If it's a dislike, you can still create a record for it if needed
            Like::create([
                'from_user_id' => $fromUserId,
                'to_user_id' => $toUserId,
                'status' => 'dislike', // Record the dislike
            ]);
            // No response is sent for dislikes
        }

        // No response for likes that do not create a match
        return response()->json(['message' => 'Like recorded successfully.'], 200);
    }



    public function getSwipedUsers(Request $request): \Illuminate\Http\JsonResponse
    {
        $userId =  auth()->id(); // Get the authenticated user's ID
        $currentUser = User::find($userId);
        $distance = $request->input('distance', 50); // Default to 50km if not provided

        // Get all user IDs that the user has swiped
        $swipedUserIds = Like::where('from_user_id', $userId)
            ->where('status', 'like')
            ->pluck('to_user_id') // Get the IDs of liked users
            ->toArray();

        // Optionally get disliked users as well
        $dislikedUserIds = Like::where('from_user_id', $userId)
            ->where('status', 'dislike') // Add the status condition if necessary
            ->pluck('to_user_id')
            ->toArray();


        // Combine liked and disliked users
        $swipedUsers = array_merge($swipedUserIds, $dislikedUserIds);

        $swipedUsers[] = $userId;

        // Start building the query for unswiped users
        $query = User::whereNotIn('id', $swipedUsers);

        // Filter by user's preference (gender preference)
        if ($currentUser->preference && $currentUser->preference !== 'Се') {
            // If preference is not "Се" (all), filter by gender
            $query->where('gender', $currentUser->preference);
        }
        // If preference is "Се" (all), no gender filter is applied

        // Get all potential users first
        $allUsers = $query->get();

        // Filter by distance if current user has a location
        $filteredUsers = collect();
        if ($currentUser->location) {
            // Parse current user's location (format: "lat, lng")
            $currentLocation = explode(', ', $currentUser->location);
            if (count($currentLocation) === 2) {
                $currentLat = floatval($currentLocation[0]);
                $currentLng = floatval($currentLocation[1]);

                foreach ($allUsers as $user) {
                    if ($user->location) {
                        // Parse user's location
                        $userLocation = explode(', ', $user->location);
                        if (count($userLocation) === 2) {
                            $userLat = floatval($userLocation[0]);
                            $userLng = floatval($userLocation[1]);

                            // Calculate distance using Haversine formula
                            $distanceKm = $this->calculateDistance($currentLat, $currentLng, $userLat, $userLng);

                            // Only include users within the specified distance
                            if ($distanceKm <= $distance) {
                                $filteredUsers->push($user);
                            }
                        }
                    }
                }
            } else {
                // If current user's location is invalid, return all users
                $filteredUsers = $allUsers;
            }
        } else {
            // If current user has no location, return all users
            $filteredUsers = $allUsers;
        }

        return response()->json($filteredUsers->values());
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in kilometers
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
