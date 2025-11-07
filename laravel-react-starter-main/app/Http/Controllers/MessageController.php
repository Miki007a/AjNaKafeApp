<?php

namespace App\Http\Controllers;

use App\Notifications\NewChatMessage;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function send(Request $request, $chatId)
    {
        // Validate: either message or file must be present
        $request->validate([
            'message' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // Max 10MB
        ]);

        // Ensure at least one of message or file is present
        if (!$request->has('message') && !$request->hasFile('file')) {
            return response()->json(['error' => 'Either message or file is required'], 422);
        }

        $chat = Chat::findOrFail($chatId);
        $senderId = auth()->id();
        
        // Verify user belongs to this chat
        if ($chat->user1_id !== $senderId && $chat->user2_id !== $senderId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $content = $request->message ?? '';
        $isFile = false;
        $filePath = null;
        $storedFileName = null;

        // Handle file upload if present
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $storedFileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('messages', $storedFileName, 'public');
            $isFile = true;
            
            // If no message text, use original file name as content
            if (empty($content)) {
                $content = $file->getClientOriginalName();
            }
        }

        // Save message to database
        // For file messages, store the original filename in content for display
        // We'll use the stored filename (timestamp_original) to construct the URL
        $message = Message::create([
            'chat_id' => $chatId,
            'user_id' => $senderId,
            'content' => $content,
            'is_file' => $isFile,
            'sent_at' => now(),
        ]);

        // Add file path and URL to response if file was uploaded
        if ($isFile && $filePath && $storedFileName) {
            $message->file_path = $filePath;
            $message->file_url = Storage::url($filePath);
            // Also store the stored filename for easy retrieval
            $message->stored_filename = $storedFileName;
        }

        // Get sender and recipient
        $sender = User::find($senderId);
        $recipientId = $chat->user1_id === $senderId ? $chat->user2_id : $chat->user1_id;
        $recipient = User::find($recipientId);

        // Send notification to recipient using Laravel Notifications
        $recipient->notify(new NewChatMessage($message, $sender));

        return response()->json($message);
    }

    public function getMessages($chatId)
    {
        $chat = Chat::findOrFail($chatId);
        $userId = auth()->id();
        
        // Verify user belongs to this chat
        if ($chat->user1_id !== $userId && $chat->user2_id !== $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Message::where('chat_id', $chatId)
            ->orderBy('sent_at', 'asc')
            ->get()
            ->map(function ($message) {
                // Add file URL if message is a file
                if ($message->is_file) {
                    // Try to find file in storage using the original filename from content
                    // Files are stored as messages/{timestamp}_{original_filename}
                    $originalFileName = $message->content;
                    $files = Storage::disk('public')->files('messages');
                    
                    // Find file that contains the original filename
                    // This handles cases where the stored filename is timestamp_originalfilename
                    foreach ($files as $file) {
                        // Extract just the filename from the path
                        $fileBasename = basename($file);
                        // Check if the stored filename contains the original filename
                        if (str_contains($fileBasename, '_' . $originalFileName) || 
                            str_ends_with($fileBasename, $originalFileName)) {
                            $message->file_url = Storage::url($file);
                            break;
                        }
                    }
                    
                    // Fallback: try direct path if content is the stored filename
                    if (!isset($message->file_url)) {
                        $filePath = 'messages/' . $originalFileName;
                        if (Storage::disk('public')->exists($filePath)) {
                            $message->file_url = Storage::url($filePath);
                        }
                    }
                }
                return $message;
            });

        return response()->json($messages);
    }

    public function getChatInfo($chatId)
    {
        $chat = Chat::with(['user1', 'user2'])
            ->findOrFail($chatId);
        
        $userId = auth()->id();
        if ($chat->user1_id !== $userId && $chat->user2_id !== $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($chat);
    }

    public function getChats()
    {
        $userId = auth()->id();
        
        // Get all chats where the user is either user1 or user2
        $chats = Chat::where('user1_id', $userId)
            ->orWhere('user2_id', $userId)
            ->with(['user1', 'user2'])
            ->withLastMessage()
            ->get();

        return response()->json($chats);
    }
}
