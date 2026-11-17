<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\NewsletterSubscriber;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:100',
            'rating' => 'required|integer|min:1|max:5',
            'body' => 'required|string|min:10',
        ]);

        $review = Review::create([
            'product_id' => $validated['product_id'],
            'name' => $validated['name'],
            'rating' => $validated['rating'],
            'body' => $validated['body'],
            'is_approved' => false, // Curated by admin in Filament
        ]);

        return response()->json([
            'message' => 'Your review has been submitted to the atelier for curation.',
            'data' => $review,
        ], 201);
    }
}

