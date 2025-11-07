<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = ['user1_id', 'user2_id'];


    public function messages()
    {
        return $this->hasMany(Message::class); // One chat has many messages
    }

    public function user1()
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    public function user2()
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    public function scopeWithLastMessage($query)
    {
        return $query->addSelect(['last_message_id' => Message::select('id')
            ->whereColumn('chat_id', 'chats.id')
            ->latest()
            ->take(1)
        ])->with('lastMessage');
    }

    public function lastMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }
}


