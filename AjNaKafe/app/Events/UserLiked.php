<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserLiked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $fromUserId;
    public $toUserId;
    public $message;
    public $match;

    public function __construct($fromUserId, $toUserId, $message, $match = null)
    {
        $this->fromUserId = $fromUserId;
        $this->toUserId = $toUserId;
        $this->message = $message;
        $this->match = $match;
    }

    public function broadcastOn()
    {
        return new PrivateChannel("private-user.$this->fromUserId");
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'match' => $this->match,
        ];
    }
}
