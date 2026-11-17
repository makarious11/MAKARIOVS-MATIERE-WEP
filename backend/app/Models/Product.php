<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'product_type',
        'slug',
        'name_en',
        'name_ar',
        'tagline_en',
        'tagline_ar',
        'story_en',
        'story_ar',
        'details_en',
        'details_ar',
        'ingredients_en',
        'ingredients_ar',
        'usage_en',
        'usage_ar',
        'family',
        'top_notes',
        'heart_notes',
        'base_notes',
        'concentration',
        'longevity',
        'sillage',
        'intensity',
        'gender_vibe',
        'attributes',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'top_notes' => 'array',
        'heart_notes' => 'array',
        'base_notes' => 'array',
        'attributes' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'longevity' => 'integer',
        'sillage' => 'integer',
        'intensity' => 'integer',
        'sort_order' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function defaultVariant()
    {
        return $this->hasOne(ProductVariant::class)->where('is_default', true)->withDefault(function () {
            return $this->variants()->first();
        });
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }
}
