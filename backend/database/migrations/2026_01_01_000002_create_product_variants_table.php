<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('variant_name_en')->nullable(); // e.g. "100 ml", "50 ml Jar", "Large", "Shade 01"
            $table->string('variant_name_ar')->nullable(); // e.g. "١٠٠ مل", "٥٠ مل عبوة فاخرة", "كبير"
            $table->unsignedInteger('size_ml')->nullable(); // Kept for perfumes (30, 50, 100)
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->string('sku')->unique();
            $table->unsignedInteger('stock')->default(20);
            $table->boolean('is_default')->default(false);
            $table->json('attributes')->nullable(); // flexible { volume: "50ml", shade: "#F2E8DC", etc. }
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
