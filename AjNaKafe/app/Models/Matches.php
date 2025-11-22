<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matches extends Model
{
    use HasFactory;

    protected $fillable = ['user1_id', 'user2_id', 'status', 'match_date'];

    // Relationship with the first user
    public function user1()
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    // Relationship with the second user
    public function user2()
    {
        return $this->belongsTo(User::class, 'user2_id');
    }
}
