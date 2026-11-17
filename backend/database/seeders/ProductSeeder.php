<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * The 4 Signature Extraits de Parfum of L'VENUS Maison de Parfum.
     */
    public function run(): void
    {
        $perfumes = [
            // ========================================================
            // PERFUME 1: Floral Botanical (La Fleur du Nil)
            // ========================================================
            [
                'slug' => 'la-fleur-du-nil',
                'name_en' => 'La Fleur du Nil',
                'name_ar' => 'زهرة النيل',
                'tagline_en' => 'A secret botanical sanctuary along the whispering Nile',
                'tagline_ar' => 'حديقة نباتية سرية على ضفاف النيل الخالد',
                'family' => 'floral',
                'concentration' => 'Extrait de Parfum (32%)',
                'gender_vibe' => 'Feminine',
                'longevity' => 9,
                'sillage' => 7,
                'intensity' => 8,
                'top_notes' => ['Egyptian Poppy', 'Wild Cornflower', 'White Peony', 'Bergamot Mist'],
                'heart_notes' => ['Jasmine Sambac', 'Tunisian Neroli', 'Water Lily', 'Ylang-Ylang'],
                'base_notes' => ['White Musk', 'Antique Sandalwood', 'Ambrette Seed', 'Cedar Shavings'],
                'story_en' => 'Born from the fertile silt and sun-drenched banks of the Nile, La Fleur du Nil captures the fleeting dawn hour when wild poppies and cornflowers unfurl under morning mist. Masterfully balanced with white peony, Egyptian jasmine sambac, and ethereal neroli, it dries down to a whispering bed of white musk and antique sandalwood. An ode to classical botanical alchemy by L’VENUS.',
                'story_ar' => 'مستوحى من طمي النيل الخصيب وضفافه المشرقة. يجسد هذا العطر ساعة الفجر الأولى حين تتفتح أزهار الخشخاش البري وزهور الذرة تحت رداء من ندى الصباح، متناغمة مع ياسمين السامباك المصري وخشب الصندل العتيق في سيمفونية نباتية ساحرة من دار لوفينوس.',
                'variants' => [
                    ['size_ml' => 30, 'price' => 2400.00, 'compare_at_price' => 2800.00, 'sku' => 'LV-FN-30', 'stock' => 18, 'is_default' => false],
                    ['size_ml' => 50, 'price' => 3600.00, 'compare_at_price' => 4200.00, 'sku' => 'LV-FN-50', 'stock' => 25, 'is_default' => true],
                    ['size_ml' => 100, 'price' => 5800.00, 'compare_at_price' => 6600.00, 'sku' => 'LV-FN-100', 'stock' => 12, 'is_default' => false],
                ],
                'images' => [
                    ['path' => '/images/products/la-fleur-du-nil-bottle.jpg', 'type' => 'bottle', 'sort_order' => 1],
                    ['path' => '/images/products/packaging-mockup.jpg', 'type' => 'box', 'sort_order' => 2],
                    ['path' => '/images/products/hero-bottle.jpg', 'type' => 'lifestyle', 'sort_order' => 3],
                    ['path' => '/images/brand/brand-identity.jpg', 'type' => 'texture', 'sort_order' => 4],
                ],
            ],

            // ========================================================
            // PERFUME 2: Warm Resinous Amber (Ambre d'Alexandrie)
            // ========================================================
            [
                'slug' => 'ambre-dalexandrie',
                'name_en' => "Ambre d'Alexandrie",
                'name_ar' => 'عنبر الإسكندرية',
                'tagline_en' => 'Sun-warmed Mediterranean stones, golden resins, and aged vanille',
                'tagline_ar' => 'أحجار البحر الدافئة، وراتنجات العنبر الذهبي، والفانيليا العتيقة',
                'family' => 'amber',
                'concentration' => 'Extrait de Parfum (35%)',
                'gender_vibe' => 'Unisex',
                'longevity' => 10,
                'sillage' => 9,
                'intensity' => 9,
                'top_notes' => ['Alexandrian Sea Salt', 'Italian Bergamot', 'Spiced Cinnamon Bark'],
                'heart_notes' => ['Golden Amber Resin', 'Labdanum Ciste', 'Siam Benzoin'],
                'base_notes' => ['Madagascar Smoked Vanilla', 'Atlas Cedarwood', 'Tonka Bean Infusion', 'Golden Musk'],
                'story_en' => 'Echoes of the great library and the salt-crusted harbor of Alexandria. Golden amber melted under the Mediterranean sun, layered with sweet labdanum tears, benzoin of Siam, and smoked Madagascar vanilla pod. Infused with a breath of sea salt and dry cedarwood, this extrait offers radiant, skin-embracing warmth designed to linger for days.',
                'story_ar' => 'أصداء من مكتبة الإسكندرية العظمى ومينائها التاريخي العتيق. عنبر ذهبي صهرته شمس البحر الأبيض المتوسط، متمازج مع دموع اللادانوم وسيام البنزوين وقرون الفانيليا المدخنة مع لمسة من ملح البحر وخشب الأرز المجفف. عطر دافئ يغمر الحواس بهالة ملكية تدوم أياماً.',
                'variants' => [
                    ['size_ml' => 30, 'price' => 2600.00, 'compare_at_price' => 3000.00, 'sku' => 'LV-AA-30', 'stock' => 14, 'is_default' => false],
                    ['size_ml' => 50, 'price' => 3900.00, 'compare_at_price' => 4500.00, 'sku' => 'LV-AA-50', 'stock' => 20, 'is_default' => true],
                    ['size_ml' => 100, 'price' => 6200.00, 'compare_at_price' => 7000.00, 'sku' => 'LV-AA-100', 'stock' => 9, 'is_default' => false],
                ],
                'images' => [
                    ['path' => '/images/products/ambre-dalexandrie-bottle.jpg', 'type' => 'bottle', 'sort_order' => 1],
                    ['path' => '/images/products/packaging-mockup.jpg', 'type' => 'box', 'sort_order' => 2],
                    ['path' => '/images/products/hero-bottle.jpg', 'type' => 'lifestyle', 'sort_order' => 3],
                    ['path' => '/images/brand/brand-identity.jpg', 'type' => 'texture', 'sort_order' => 4],
                ],
            ],

            // ========================================================
            // PERFUME 3: Sacred Temple Woods (Bois de Louxor)
            // ========================================================
            [
                'slug' => 'bois-de-louxor',
                'name_en' => 'Bois de Louxor',
                'name_ar' => 'خشب الأقصر',
                'tagline_en' => 'Cedar temple columns, golden papyrus, and sacred frankincense',
                'tagline_ar' => 'أعمدة المعابد الخشبية، وورق البردي الذهبي، والبخور المقدس',
                'family' => 'woody',
                'concentration' => 'Extrait de Parfum (34%)',
                'gender_vibe' => 'Masculine',
                'longevity' => 9,
                'sillage' => 8,
                'intensity' => 8,
                'top_notes' => ['Egyptian Cardamom', 'Dried Papyrus', 'Smoked Incense Tears'],
                'heart_notes' => ['Sacred Cedar of Lebanon', 'Aged Patchouli Heart', 'Guaiac Wood'],
                'base_notes' => ['Smoked Vetiver', 'Desert Sand Accord', 'Black Amber', 'Cistus'],
                'story_en' => 'Standing between the towering stone hypostyle halls of Karnak, Bois de Louxor evokes the sacred scent of antique cedar beams preserved for three millennia under desert sand. Dried papyrus reeds, incense resins from the land of Punt, and a heart of blackened patchouli give this fragrance an architectural, meditative authority.',
                'story_ar' => 'بين بهو الأعمدة الحجرية الشاهقة في معبد الكرنك، يستحضر خشب الأقصر الرائحة المقدسة لعارضات خشب الأرز العتيقة المحفوظة لثلاثة آلاف عام. قصب البردي المجفف، وراتنجات البخور القادمة من بلاد بونت، وقلب من الباتشولي الأسود تمنح هذا العطر هيبة أثرية مهيبة.',
                'variants' => [
                    ['size_ml' => 30, 'price' => 2500.00, 'compare_at_price' => 2900.00, 'sku' => 'LV-BL-30', 'stock' => 15, 'is_default' => false],
                    ['size_ml' => 50, 'price' => 3800.00, 'compare_at_price' => 4400.00, 'sku' => 'LV-BL-50', 'stock' => 22, 'is_default' => true],
                    ['size_ml' => 100, 'price' => 6000.00, 'compare_at_price' => 6800.00, 'sku' => 'LV-BL-100', 'stock' => 10, 'is_default' => false],
                ],
                'images' => [
                    ['path' => '/images/products/bois-de-louxor-bottle.jpg', 'type' => 'bottle', 'sort_order' => 1],
                    ['path' => '/images/products/packaging-mockup.jpg', 'type' => 'box', 'sort_order' => 2],
                    ['path' => '/images/products/hero-bottle.jpg', 'type' => 'lifestyle', 'sort_order' => 3],
                    ['path' => '/images/brand/brand-identity.jpg', 'type' => 'texture', 'sort_order' => 4],
                ],
            ],

            // ========================================================
            // PERFUME 4: Sovereign Wild Oud (Al Oud Al Aswad)
            // ========================================================
            [
                'slug' => 'al-oud-al-aswad',
                'name_en' => 'Al Oud Al Aswad',
                'name_ar' => 'العود الأسود',
                'tagline_en' => 'Cambodian wild oud, saffron threads, and antique myrrh',
                'tagline_ar' => 'عود كمبودي بري، خيوط الزعفران، والمر العتيق',
                'family' => 'oud',
                'concentration' => 'Extrait de Parfum (38%)',
                'gender_vibe' => 'Unisex',
                'longevity' => 10,
                'sillage' => 10,
                'intensity' => 10,
                'top_notes' => ['Persian Saffron Threads', 'Black Pepper', 'Damascena Rose Petals'],
                'heart_notes' => ['Cambodian Wild Oud', 'Sacred Myrrh', 'Frankincense Resin'],
                'base_notes' => ['Natural Ambergris', 'Dark Russian Leather', 'Smoked Birch', 'Black Musk'],
                'story_en' => 'The sovereign masterpiece of L’VENUS. Aged wild Cambodian oud distillation infused with fiery Persian saffron threads and black pepper. Enveloped in sacred myrrh tears, antique frankincense, and dark saddle leather, this profound creation is an enigmatic monument of strength, heritage, and quiet sovereign prestige.',
                'story_ar' => 'جوهرة تاج دار لوفينوس. خلاصة العود الكمبودي البري العتيق ممزوجة بخيوط الزعفران الفارسي والفلفل الأسود، ومغلفة بدموع المر المقدس والبخور القديم وجلود السروج الفاخرة. عطر يفيض بالهيبة والسيادة المطلقة.',
                'variants' => [
                    ['size_ml' => 30, 'price' => 3200.00, 'compare_at_price' => 3600.00, 'sku' => 'LV-OA-30', 'stock' => 10, 'is_default' => false],
                    ['size_ml' => 50, 'price' => 4800.00, 'compare_at_price' => 5400.00, 'sku' => 'LV-OA-50', 'stock' => 15, 'is_default' => false],
                    ['size_ml' => 100, 'price' => 7600.00, 'compare_at_price' => 8500.00, 'sku' => 'LV-OA-100', 'stock' => 8, 'is_default' => true],
                ],
                'images' => [
                    ['path' => '/images/products/oud-imperial-du-caire-bottle.jpg', 'type' => 'bottle', 'sort_order' => 1],
                    ['path' => '/images/products/packaging-mockup.jpg', 'type' => 'box', 'sort_order' => 2],
                    ['path' => '/images/products/hero-bottle.jpg', 'type' => 'lifestyle', 'sort_order' => 3],
                    ['path' => '/images/brand/brand-identity.jpg', 'type' => 'texture', 'sort_order' => 4],
                ],
            ],
        ];

        foreach ($perfumes as $pData) {
            $variants = $pData['variants'];
            $images = $pData['images'];
            unset($pData['variants'], $pData['images']);

            $product = Product::updateOrCreate(
                ['slug' => $pData['slug']],
                $pData
            );

            // Re-seed variants
            foreach ($variants as $vData) {
                ProductVariant::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'size_ml' => $vData['size_ml'],
                    ],
                    array_merge($vData, ['product_id' => $product->id])
                );
            }

            // Re-seed images
            foreach ($images as $imgData) {
                ProductImage::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'type' => $imgData['type'],
                    ],
                    array_merge($imgData, ['product_id' => $product->id])
                );
            }
        }
    }
}
