<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $senderId;
    public $receiverId;

    public function __construct($message, $senderId, $receiverId)
    {
        $this->message = $message;
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
    }

    public function broadcastOn()
    {
        // Create a unique channel name by sorting and combining user IDs
        $users = [$this->senderId, $this->receiverId];
        sort($users); // Sort to ensure consistent channel names
        $channelName = 'chat.' . implode('.', $users);
        
        return new PrivateChannel($channelName);
    }
} 