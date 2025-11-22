<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',    // The ID of the chat this message belongs to
        'user_id',    // The ID of the user who sent the message
        'content',    // The content of the message (text or file path)
        'is_file',    // Boolean to indicate if the message is a file
        'is_system',  // Boolean to indicate if the message is a system message
        'sent_at',    // Timestamp when the message was sent
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}
