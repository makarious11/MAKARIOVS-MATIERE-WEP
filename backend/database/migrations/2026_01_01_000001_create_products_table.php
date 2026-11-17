<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('product_type')->default('perfume'); // perfume, skincare, makeup, couture, accessory
            $table->string('slug')->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('tagline_en')->nullable();
            $table->string('tagline_ar')->nullable();
            $table->text('story_en');
            $table->text('story_ar');
            $table->text('details_en')->nullable();
            $table->text('details_ar')->nullable();
            $table->text('ingredients_en')->nullable();
            $table->text('ingredients_ar')->nullable();
            $table->text('usage_en')->nullable();
            $table->text('usage_ar')->nullable();
            
            // Fragrance-specific fields (nullable for skincare / couture / cosmetics)
            $table->string('family')->nullable(); // floral, woody, amber, oud, citrus, etc.
            $table->json('top_notes')->nullable();
            $table->json('heart_notes')->nullable();
            $table->json('base_notes')->nullable();
            $table->string('concentration')->nullable()->default('Extrait de Parfum (32%)');
            $table->unsignedTinyInteger('longevity')->nullable()->default(9);
            $table->unsignedTinyInteger('sillage')->nullable()->default(8);
            $table->unsignedTinyInteger('intensity')->nullable()->default(9);
            $table->string('gender_vibe')->nullable()->default('Unisex');
            
            // Flexible attributes for future lines (skin_type, volume, shade, fabric, etc.)
            $table->json('attributes')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
