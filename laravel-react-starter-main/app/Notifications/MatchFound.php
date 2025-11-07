<?php

namespace App\Notifications;

use App\Models\Matches;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class MatchFound extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $match;
    public $otherUser;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Matches $match, User $otherUser)
    {
        $this->match = $match;
        $this->otherUser = $otherUser;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['broadcast', 'database'];
    }

    /**
     * Get the broadcastable representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return BroadcastMessage
     */
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'message' => 'You have a new match!',
            'match' => $this->match,
            'otherUser' => $this->otherUser,
            'type' => 'match'
        ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'message' => 'You have a new match!',
            'match_id' => $this->match->id,
            'other_user_id' => $this->otherUser->id,
            'other_user_name' => $this->otherUser->name,
            'type' => 'match'
        ];
    }
}
