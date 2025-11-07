<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

class NewChatMessage extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $message;
    public $sender;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Message $message, User $sender)
    {
        $this->message = $message;
        $this->sender = $sender;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['broadcast'];
    }

    /**
     * Get the broadcastable representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return BroadcastMessage
     */
    public function toBroadcast($notifiable)
    {
        $messageData = [
            'id' => $this->message->id,
            'content' => $this->message->content,
            'user_id' => $this->message->user_id,
            'chat_id' => $this->message->chat_id,
            'is_file' => $this->message->is_file,
            'sent_at' => $this->message->sent_at,
            'created_at' => $this->message->created_at,
        ];
        
        // Add file_url if message is a file
        if ($this->message->is_file) {
            if (isset($this->message->file_path)) {
                $messageData['file_url'] = Storage::url($this->message->file_path);
            } else {
                // Try to construct file path from content
                $filePath = 'messages/' . basename($this->message->content);
                if (Storage::disk('public')->exists($filePath)) {
                    $messageData['file_url'] = Storage::url($filePath);
                }
            }
        }
        
        return new BroadcastMessage([
            'message' => $messageData,
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'profile_picture' => $this->sender->profile_picture,
            ],
            'type' => 'App\\Notifications\\NewChatMessage'
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
            'message_id' => $this->message->id,
            'content' => $this->message->content,
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'chat_id' => $this->message->chat_id,
            'type' => 'chat_message'
        ];
    }
}
