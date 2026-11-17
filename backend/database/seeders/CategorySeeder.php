<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'slug' => 'parfums',
                'name_en' => 'Haute Parfumerie',
                'name_ar' => 'العطور الاستثنائية',
                'tagline_en' => 'Chapitre I — Extraits de Parfum at 32% concentration',
                'tagline_ar' => 'الفصل الأول — مستخلصات عطرية نقية بتركيز ٣٢٪',
                'description_en' => 'Four timeless Extraits de Parfum, distilled from rare Egyptian flora and noble Grasse essences, sealed with the signature burgundy wax.',
                'description_ar' => 'أربعة مستخلصات عطرية خالدة، مقطرة من أندر نباتات مصر وخلاصات غراس النبيلة، ومختومة بشمع الختم العنابي الفاخر.',
                'image_url' => '/images/products/la-fleur-du-nil-bottle.jpg',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'slug' => 'soin',
                'name_en' => 'Soin Botanique',
                'name_ar' => 'العناية الفائقة بالبشرة',
                'tagline_en' => 'Chapitre II — Rare Botanical Skincare & Elixirs',
                'tagline_ar' => 'الفصل الثاني — إكسيرات وعناية نباتية فائقة النقاء',
                'description_en' => 'Sublime botanical skincare infused with Alexandrian rose water, cold-pressed desert seed oils, and restorative minerals.',
                'description_ar' => 'مستحضرات عناية فائقة مدعومة بماء الورد السكندري النقي وزيوت بذور الصحراء المعصورة على البارد.',
                'image_url' => '/images/brand/NEW_brand-identity.png',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'slug' => 'couture',
                'name_en' => 'Maison Couture',
                'name_ar' => 'الأزياء الراقية',
                'tagline_en' => 'Chapitre III — Architectural Tailoring & Silks',
                'tagline_ar' => 'الفصل الثالث — خياطة معمارية وحرير نقي',
                'description_en' => 'Exclusive ready-to-wear and tailored ceremonial capes, crafted in Egyptian long-staple cotton and Parisian silk faille.',
                'description_ar' => 'أزياء فاخرة وقطع حصرية منسوجة من أرقى أقطان مصر طويلة التيلة والحرير الباريسي الفاخر.',
                'image_url' => '/images/brand/NEW_brand-identity.png',
                'is_active' => false, // Upcoming collection
                'sort_order' => 3,
            ],
            [
                'slug' => 'accessoires',
                'name_en' => 'Objets & Maroquinerie',
                'name_ar' => 'الجلود والمقتنيات الفاخرة',
                'tagline_en' => 'Chapitre IV — Fine Leather & Atelier Pieces',
                'tagline_ar' => 'الفصل الرابع — مشغولات جلدية ومقتنيات فنية',
                'description_en' => 'Hand-stitched Italian leather travel cases, solid brass atomizers, and engraved pocket talismans.',
                'description_ar' => 'حقائب سفر جلدية محاكة يدوياً، مرشات عطرية نحاسية، وتمائم كلاسيكية محفورة.',
                'image_url' => '/images/brand/NEW_brand-identity.png',
                'is_active' => false, // Upcoming collection
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}

