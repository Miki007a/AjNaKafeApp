<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $fillable = ['from_user_id', 'to_user_id', 'status'];

    // Relationship with User (from user who liked/disliked)
    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    // Relationship with User (to user who was liked/disliked)
    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
