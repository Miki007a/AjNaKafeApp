<?php

namespace App\Jobs;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FindCafeForMatch implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $chatId;
    public $user1Id;
    public $user2Id;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($chatId, $user1Id, $user2Id)
    {
        $this->chatId = $chatId;
        $this->user1Id = $user1Id;
        $this->user2Id = $user2Id;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try {
            // Get both users
            $user1 = User::find($this->user1Id);
            $user2 = User::find($this->user2Id);

            // Check if both users have locations
            if (!$user1->location || !$user2->location) {
                Log::info('FindCafeForMatch: One or both users missing location');
                return;
            }

            // Parse locations (format: "lat, lng")
            $user1Location = explode(', ', $user1->location);
            $user2Location = explode(', ', $user2->location);

            if (count($user1Location) !== 2 || count($user2Location) !== 2) {
                Log::info('FindCafeForMatch: Invalid location format');
                return;
            }

            $user1Lat = floatval($user1Location[0]);
            $user1Lon = floatval($user1Location[1]);
            $user2Lat = floatval($user2Location[0]);
            $user2Lon = floatval($user2Location[1]);

            // Calculate midpoint (straight line between them)
            $midLat = ($user1Lat + $user2Lat) / 2;
            $midLon = ($user1Lon + $user2Lon) / 2;

            Log::info("FindCafeForMatch: Midpoint calculated at {$midLat}, {$midLon}");

            // Query Overpass API with retry logic
            $cafe = $this->findClosestCafe($midLat, $midLon);

            if ($cafe) {
                // Create center message with Google Maps link
                $googleMapsLink = "https://www.google.com/maps?q={$cafe['lat']},{$cafe['lon']}";
                $cafeName = $cafe['name'] ?? 'Кафич';
                $messageContent = "Овој кафич е идеален — најблиску е за двајцата!\n{$cafeName}\n{$googleMapsLink}";

                Message::create([
                    'chat_id' => $this->chatId,
                    'user_id' => $this->user1Id, // System message, but needs a user_id
                    'content' => $messageContent,
                    'is_file' => false,
                    'is_system' => true,
                    'sent_at' => now(),
                ]);

                Log::info("FindCafeForMatch: Center message created for cafe: {$cafe['name']}");
            } else {
                Log::info('FindCafeForMatch: No cafe found, no message created');
            }
        } catch (\Exception $e) {
            Log::error("FindCafeForMatch error: " . $e->getMessage());
        }
    }

    /**
     * Find the closest cafe near the midpoint with retry logic
     */
    private function findClosestCafe($lat, $lon)
    {
        $maxRetries = 3;
        $attempt = 0;

        while ($attempt < $maxRetries) {
            try {
                $query = "[out:json];node[\"amenity\"=\"cafe\"](around:600,{$lat},{$lon});out;";
                
                $response = Http::timeout(30)
                    ->withoutVerifying() // Disable SSL verification for local development
                    ->withBody($query, 'application/x-www-form-urlencoded')
                    ->post('https://overpass-api.de/api/interpreter');

                // Check if response is HTML (error response)
                $content = $response->body();
                if (strpos($content, '<html>') !== false || strpos($content, '<body>') !== false) {
                    Log::warning("FindCafeForMatch: Overpass API returned HTML error (attempt " . ($attempt + 1) . ")");
                    $attempt++;
                    if ($attempt < $maxRetries) {
                        sleep(2); // Wait 2 seconds before retry
                    }
                    continue;
                }

                $data = $response->json();

                // Save JSON response to file for inspection
                $filename = 'overpass_responses/' . date('Y-m-d_H-i-s') . '_chat_' . $this->chatId . '.json';
                Storage::put($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                Log::info("FindCafeForMatch: JSON response saved to storage/app/{$filename}");

                if (!isset($data['elements']) || empty($data['elements'])) {
                    Log::info('FindCafeForMatch: No cafes found in response');
                    return null;
                }

                // Find the closest cafe to the midpoint
                $closestCafe = null;
                $minDistance = PHP_FLOAT_MAX;

                foreach ($data['elements'] as $element) {
                    if (!isset($element['lat']) || !isset($element['lon'])) {
                        continue;
                    }

                    $cafeLat = floatval($element['lat']);
                    $cafeLon = floatval($element['lon']);
                    
                    $distance = $this->calculateDistance($lat, $lon, $cafeLat, $cafeLon);

                    if ($distance < $minDistance) {
                        $minDistance = $distance;
                        $closestCafe = [
                            'lat' => $cafeLat,
                            'lon' => $cafeLon,
                            'name' => $element['tags']['name'] ?? 'Кафич',
                            'id' => $element['id'] ?? null,
                        ];
                    }
                }

                return $closestCafe;

            } catch (\Exception $e) {
                Log::error("FindCafeForMatch: API request failed (attempt " . ($attempt + 1) . "): " . $e->getMessage());
                $attempt++;
                if ($attempt < $maxRetries) {
                    sleep(2); // Wait 2 seconds before retry
                }
            }
        }

        Log::warning("FindCafeForMatch: All {$maxRetries} attempts failed");
        return null;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in kilometers
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
