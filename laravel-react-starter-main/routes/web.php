<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/broadcast-test', function () {
    broadcast(new \App\Events\TestBroadcast('Hello from the backend!'));

    return response()->json(['message' => 'Event broadcasted!']);
});

Route::get('/haha', function () {
    broadcast(new \App\Events\haha());

    return response()->json(['message' => 'Event broadcasted!']);
});