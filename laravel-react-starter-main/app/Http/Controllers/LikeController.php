<?php

namespace App\Http\Controllers;

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

                // Optionally, you can send a welcome message in the chat after creating it
                Message::create([
                    'chat_id' => $chat->id,
                    'user_id' => $fromUserId, // You can choose who sends the first message
                    'content' => 'Hi there! Let\'s start chatting!',
                    'is_file' => false, // This is a text message
                    'sent_at' => now(),
                ]);

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



    public function getSwipedUsers(): \Illuminate\Http\JsonResponse
    {
        $userId =  auth()->id(); // Get the authenticated user's ID

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

        // Fetch user details for all swiped users
        $users = User::whereNotIn('id', $swipedUsers)->get();

        return response()->json($users);
    }
}
