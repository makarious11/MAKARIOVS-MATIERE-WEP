<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants', 'images', 'reviews'])
            ->where('is_active', true);

        // Filter by category slug
        if ($request->has('category') && $request->category !== 'all') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Filter by product type (perfume, skincare, makeup, etc.)
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('product_type', $request->type);
        }

        // Filter by perfume family
        if ($request->has('family') && $request->family !== 'all') {
            $query->where('family', $request->family);
        }

        // Search (escape LIKE wildcards to prevent wildcard DoS)
        if ($request->filled('search')) {
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], (string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_ar', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->sort === 'price_asc') {
            $query->orderBy('sort_order');
        } elseif ($request->sort === 'price_desc') {
            $query->orderByDesc('sort_order');
        } else {
            $query->orderBy('sort_order');
        }

        $products = $query->get();

        return response()->json([
            'data' => $products,
            'meta' => ['total' => $products->count()],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'variants', 'images', 'reviews'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $product,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:products,slug',
            'category_id' => 'nullable|exists:categories,id',
            'product_type' => 'nullable|string',
            'tagline_en' => 'nullable|string',
            'tagline_ar' => 'nullable|string',
            'story_en' => 'required|string',
            'story_ar' => 'required|string',
            'details_en' => 'nullable|string',
            'details_ar' => 'nullable|string',
            'ingredients_en' => 'nullable|string',
            'ingredients_ar' => 'nullable|string',
            'family' => 'nullable|string',
            'variants' => 'required|array|min:1',
            'variants.*.variant_name_en' => 'required|string',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.sku' => 'required|string',
            'variants.*.stock' => 'nullable|integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name_en']);
        }

        $variantsData = $validated['variants'];
        unset($validated['variants']);

        $product = Product::create($validated);

        foreach ($variantsData as $index => $var) {
            $product->variants()->create([
                'variant_name_en' => $var['variant_name_en'],
                'variant_name_ar' => $var['variant_name_ar'] ?? $var['variant_name_en'],
                'price' => $var['price'],
                'compare_at_price' => $var['compare_at_price'] ?? null,
                'sku' => $var['sku'],
                'stock' => $var['stock'] ?? 20,
                'is_default' => $index === 0,
            ]);
        }

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product->load('variants'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name_en' => 'sometimes|string|max:255',
            'name_ar' => 'sometimes|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'story_en' => 'sometimes|string',
            'story_ar' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'variants' => 'sometimes|array',
        ]);

        if (isset($validated['variants'])) {
            $variants = $validated['variants'];
            unset($validated['variants']);
            
            foreach ($variants as $v) {
                if (!empty($v['id'])) {
                    ProductVariant::where('id', $v['id'])
                        ->where('product_id', $product->id)
                        ->update(array_filter([
                            'price' => $v['price'] ?? null,
                            'compare_at_price' => $v['compare_at_price'] ?? null,
                            'stock' => $v['stock'] ?? null,
                        ]));
                }
            }
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product->fresh(['variants', 'category']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
