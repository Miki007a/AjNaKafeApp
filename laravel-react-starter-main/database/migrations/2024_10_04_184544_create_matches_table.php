<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user1_id')->constrained('users')->onDelete('cascade'); // First user in the match
            $table->foreignId('user2_id')->constrained('users')->onDelete('cascade'); // Second user in the match
            $table->enum('status', ['active', 'rejected', 'unmatched']); // Match status
            $table->timestamp('match_date')->nullable(); // Date when match was created
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('matches');
    }
};
