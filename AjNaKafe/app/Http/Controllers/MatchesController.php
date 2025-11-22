<?php

namespace App\Http\Controllers;

use App\Models\Matches;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MatchesController extends Controller
{
    public function getMatches()
    {
        $userId = auth::id(); // Get the authenticated user's ID

        // Retrieve all active matches for the user
        $matches = Matches::where(function($query) use ($userId) {
            $query->where('user1_id', $userId)
                ->orWhere('user2_id', $userId);
        })
            ->where('status', 'active') // Filter by active status
            ->with(['user1', 'user2']) // Eager load user relationships
            ->get();

        return response()->json($matches);
    }
}
