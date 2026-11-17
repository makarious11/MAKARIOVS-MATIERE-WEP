<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|min:2',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'subject' => 'nullable|string',
            'message' => 'required|string|min:10',
        ]);

        $msg = ContactMessage::create($validated);

        return response()->json([
            'message' => 'Your correspondence has been received by the Master Alchemist.',
            'data' => $msg,
        ], 201);
    }
}

