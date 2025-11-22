<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->onDelete('cascade'); // Foreign key to the chats table
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Foreign key to the users table
            $table->text('content'); // Content of the message
            $table->boolean('is_file')->default(false); // Indicates if the message is a file
            $table->timestamp('sent_at')->useCurrent(); // Timestamp for when the message was sent
            $table->timestamps(); // Include created_at and updated_at timestamps
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
};
