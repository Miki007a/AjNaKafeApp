<?php

namespace App\Console\Commands;

use App\Events\TestBroadcast as TestBroadcastEvent;
use Illuminate\Console\Command;

class TestBroadcast extends Command
{
    protected $signature = 'broadcast:test {power=100}';
    protected $description = 'Test broadcasting by sending a test event';

    public function handle()
    {
        $power = $this->argument('power');
        
        $this->info("Broadcasting test event with power: {$power}");
        
        event(new TestBroadcastEvent($power));
        
        $this->info("✅ Event broadcasted successfully!");
        $this->info("Check the websocket server console for confirmation.");
        
        return 0;
    }
}

