<?php

use App\Events\TestBroadcast;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\MatchesController;
use App\Http\Controllers\MessageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use BeyondCode\LaravelWebSockets\Facades\WebSocketRouter;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();

    });
    Route::get('/user/{id}', function ($id) {
        \Log::info('User ID is: ' . $id);
        $user = User::where('id', $id)->first();

        if ($user) {
            return response()->json($user);
        } else {
            return response()->json(['message' => 'User not found'], 404);
        }
    });


    Route::apiResource('/users', UserController::class);
    Route::post('/messages/send', [MessageController::class, 'send']);
    Route::get('/messages/{recipient_id}', [MessageController::class, 'getMessages']);
    Route::get('/chats', [MessageController::class, 'getChats']);
    Route::get('/chats/{chatId}', [MessageController::class, 'getChatInfo']);
    Route::get('/chats/{chatId}/messages', [MessageController::class, 'getMessages']);
    Route::post('/chats/{chatId}/messages', [MessageController::class, 'send']);
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/like', [LikeController::class, 'likeUser'])->name('likeUser')->middleware('auth:sanctum');;
Route::get('/matches', [MatchesController::class, 'getMatches'])->middleware('auth:sanctum');
Route::get('/swiped-users', [LikeController::class, 'getSwipedUsers'])->middleware('auth:sanctum');
Route::post('/users/{user}', [UserController::class, 'update'])
    ->middleware('auth:sanctum');


Route::get('/broadcast-test', function () {
    event(new TestBroadcast(10));
    \Log::info("Broadcasting TestBroadcast event.");
    return response()->json(['status' => 'Event broadcasted!']);
});


Route::get('/redis-test', function () {
    // Prepare the data to be published
    $data = json_encode(['power' => 10]);

    // Log the data to see what is being sent
    \Log::info('Publishing data: ' . $data);

    // Publish the message to Redis
    $result = \Illuminate\Support\Facades\Redis::publish('test-channel', $data);

    // Log the result of the publish operation
    \Log::info('Manually published to Redis. Result: ' . $result);

    return 'Message manually published to Redis!';
});
Route::get('/redis-connect', function () {
    try {
        \Illuminate\Support\Facades\Redis::ping();
        return 'Connected to Redis!';
    } catch (\Exception $e) {
        return 'Could not connect to Redis: ' . $e->getMessage();
    }
});
