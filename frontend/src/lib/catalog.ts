// ============================================================
// L'VENUS — Maison de Haute Parfumerie & Luxe
// "MAISON DE PARFUM — LE CAIRE · PARIS"
// Founded by Makarious
// ============================================================

export interface MaisonCategory {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  tagline_en: string;
  tagline_ar: string;
  description_en: string;
  description_ar: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export const MAISON_CATEGORIES: MaisonCategory[] = [
  {
    id: 'cat-parfums',
    slug: 'parfums',
    name_en: 'Haute Parfumerie',
    name_ar: 'العطور الاستثنائية',
    tagline_en: 'Chapitre I — Rare Extraits de Parfum',
    tagline_ar: 'الفصل الأول — مستخلصات عطرية نادرة بتركيز فائق',
    description_en:
      'The foundational pillar of L’VENUS. Masterfully blended in Cairo with Parisian haute perfumery savoir-faire, concentrated at 32% to 38% pure oil.',
    description_ar:
      'حجر الأساس لدار لوفينوس. توليفات عطرية نادرة صيغت في القاهرة بحرفية باريسية رفيعة، بتركيز خالص يتراوح بين ٣٢٪ و٣٨٪.',
    image_url: '/images/products/la-fleur-du-nil-bottle.jpg',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'cat-soin',
    slug: 'soin',
    name_en: 'Soin Botanique & Lip Care',
    name_ar: 'العناية بالبشرة والشفاه',
    tagline_en: 'Chapitre II — Rare Botanical Skincare & Lip Radiance',
    tagline_ar: 'الفصل الثاني — إكسيرات وعناية نباتية فائقة النقاء وغلوس الشفاه',
    description_en:
      'Cellular botanical treatments and hydrating lip elixirs formulated with cold-distilled Alexandrian Damask rose, desert date seed oil, and botanical squalane.',
    description_ar:
      'علاجات نباتية حيوية للبشرة وإكسيرات مغذية للشفاه مدعومة بماء الورد السكندري المقطر على البارد وزيت بذور بلح الصحراء والمعادن الطبيعية النقية.',
    image_url: '/images/lipgloss/lipgloss-trio-portrait.jpg',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'cat-brume',
    slug: 'brume',
    name_en: 'Brume & Body Splash',
    name_ar: 'رذاذ الجسم والشعر الفاخر',
    tagline_en: 'Chapitre III — Refreshing Fine Mists & Hair Veils',
    tagline_ar: 'الفصل الثالث — رذاذ عطري فاخر ومنعش للجسم والشعر',
    description_en:
      'Delicate, long-wearing body splashes and hair mists blended with neroli, Mediterranean sea breeze, and sheer white musks.',
    description_ar:
      'رذاذ خفيف فاخر للجسم والشعر بنفحات النيرولي وزهر البرتقال والمسك الحريري لانتعاش ملكي يدوم طوال اليوم.',
    image_url: '/images/products/brume-botanique-bottle.jpg',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'cat-coffrets',
    slug: 'coffrets',
    name_en: 'Discovery Sets & Coffrets',
    name_ar: 'صناديق الاستكشاف والهدايا',
    tagline_en: 'Chapitre IV — Curated Discovery Sets & Travel Chests',
    tagline_ar: 'الفصل الرابع — مجموعات الهدايا والاستكشاف الملكية',
    description_en:
      'Lacquered presentation chests featuring miniature vials of our canonical extraits and artisanal botanicals.',
    description_ar:
      'صناديق ورنيشية أنيقة تضم قوارير مصغرة من خلاصة إبداعات الدار لتجربة عطرية لا تُنسى.',
    image_url: '/images/products/coffret-decouverte-box.jpg',
    is_active: true,
    sort_order: 4,
  },
  {
    id: 'cat-couture',
    slug: 'couture',
    name_en: 'Haute Couture',
    name_ar: 'الأزياء الراقية',
    tagline_en: 'Chapitre V — Atelier Tailoring & Egyptian Cottons',
    tagline_ar: 'الفصل الخامس — خياطة معمارية وأقطان مصرية فاخرة',
    description_en:
      'Architectural silhouettes crafted from rare Giza 45 extra-long staple Egyptian cotton and Parisian silk jacquard.',
    description_ar:
      'تصاميم معمارية راقية منسوجة من أندر أقطان جيزة ٤٥ المصرية فائقة الطول والحرير الباريسي الفاخر.',
    image_url: '/images/brand/NEW_brand-identity.png',
    is_active: false, // Atelier Preview
    sort_order: 5,
  },
  {
    id: 'cat-accessoires',
    slug: 'accessoires',
    name_en: 'Objets & Maroquinerie',
    name_ar: 'الجلود والمقتنيات الفاخرة',
    tagline_en: 'Chapitre VI — Fine Leather & Atelier Accents',
    tagline_ar: 'الفصل السادس — مشغولات جلدية ومقتنيات فنية',
    description_en:
      'Hand-stitched leather travel atomizers, solid brass perfume chests, and classical engraved desk talismans.',
    description_ar:
      'حافظات سفر جلدية محاكة يدوياً، وصناديق عطور نحاسية، ومقتنيات مكتبية كلاسيكية محفورة.',
    image_url: '/images/brand/NEW_brand-identity.png',
    is_active: false, // Atelier Preview
    sort_order: 6,
  },
];

export interface ProductVariant {
  id: number;
  name_en?: string;
  name_ar?: string;
  size_ml: number;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock: number;
  is_default: boolean;
}

export interface PerfumeData {
  id: number;
  slug: string;
  category_slug?: string;
  product_type?: 'perfume' | 'skincare' | 'makeup' | 'couture' | 'accessory' | 'coffret' | 'mist' | 'lipgloss';
  shade_hex?: string;
  shade_name_en?: string;
  shade_name_ar?: string;
  featured_on_home?: boolean;
  is_hidden?: boolean;
  home_order?: number;
  name_en: string;
  name_ar: string;
  tagline_en: string;
  tagline_ar: string;
  story_en: string;
  story_ar: string;
  details_en?: string;
  details_ar?: string;
  ingredients_text_en?: string;
  ingredients_text_ar?: string;
  family: 'floral' | 'woody' | 'amber' | 'oud' | 'botanical' | 'coffret';
  family_en: string;
  family_ar: string;
  concentration: string;
  gender_vibe: 'Feminine' | 'Masculine' | 'Unisex';
  longevity: number; // 1-10
  sillage: number;   // 1-10
  intensity: number; // 1-10
  top_notes_en: string[];
  top_notes_ar: string[];
  heart_notes_en: string[];
  heart_notes_ar: string[];
  base_notes_en: string[];
  base_notes_ar: string[];
  callout_top: { en: string; ar: string };
  callout_cap: { en: string; ar: string };
  callout_seal: { en: string; ar: string };
  variants: ProductVariant[];
  images: {
    hero: string;
    bottle: string;
    box: string;
    lifestyle: string;
    texture: string;
  };
  reviews: {
    id: number;
    name: string;
    rating: number;
    date: string;
    body_en: string;
    body_ar: string;
  }[];
  accent_gradient: string;
}

export const CANONICAL_PERFUMES: PerfumeData[] = [
  {
    id: 1,
    slug: 'la-fleur-du-nil',
    category_slug: 'parfums',
    product_type: 'perfume',
    name_en: 'La Fleur du Nil',
    name_ar: 'زهرة النيل',
    tagline_en: 'A crystalline floral dawn over the tranquil banks of the Nile',
    tagline_ar: 'إشراقة زهرية نقية على ضفاف النيل الهادئة عند الفجر',
    story_en:
      'Inspired by the serene quietude of early morning along the Nile. Wild poppies and Egyptian Sambac jasmine unfurl under the first rays of light, mingling with fresh neroli and luminous white peony. The dry-down settles into soft botanical musk and aged sandalwood. Refined, bright, and quietly unforgettable.',
    story_ar:
      'مستوحى من سكينة الفجر الأولى على ضفاف النيل. تتفتح أزهار الخشخاش البري وياسمين السامباك المصري تحت خيوط النور الأولى، لتمتزج بزهر البرتقال والفاوانيا البيضاء، وتستقر بنعومة على قاعدة نقية من خشب الصندل العتيق والمسك النباتي.',
    family: 'floral',
    family_en: 'Floral Botanical',
    family_ar: 'زهري نباتي نقي',
    concentration: 'Extrait de Parfum (32%)',
    gender_vibe: 'Feminine',
    longevity: 9,
    sillage: 8,
    intensity: 8,
    top_notes_en: ['Nile Wild Poppy', 'Sicilian Bergamot', 'Mandarin Blossom'],
    top_notes_ar: ['خشخاش النيل البري', 'برغموت صقلي', 'زهر اليوسفي'],
    heart_notes_en: ['Egyptian Sambac Jasmine', 'White Peony', 'Tunisian Neroli'],
    heart_notes_ar: ['ياسمين سامباك مصري', 'فاوانيا بيضاء', 'نيرولي تونسي'],
    base_notes_en: ['Mysore Sandalwood', 'White Botanical Musk', 'Golden Ambergris'],
    base_notes_ar: ['صندل ميسور نقي', 'مسك نباتي ناعم', 'عنبر ذهبي'],
    callout_top: { en: 'Top Notes — Nile Wild Poppy & Bergamot', ar: 'القمة العطرية — خشخاش النيل والبرغموت' },
    callout_cap: { en: 'Hand-Carved Walnut Cap', ar: 'غطاء من خشب الجوز المحفور يدوياً' },
    callout_seal: { en: 'Burgundy Venus Wax Seal', ar: 'ختم الشمع البرغندي الملكي' },
    variants: [
      { id: 101, name_en: '30 ml', name_ar: '٣٠ مل', size_ml: 30, price: 2350, compare_at_price: 2750, sku: 'LV-FN-30', stock: 18, is_default: false },
      { id: 102, name_en: '50 ml', name_ar: '٥٠ مل', size_ml: 50, price: 3600, compare_at_price: 4200, sku: 'LV-FN-50', stock: 25, is_default: true },
      { id: 103, name_en: '100 ml', name_ar: '١٠٠ مل', size_ml: 100, price: 5850, compare_at_price: 6600, sku: 'LV-FN-100', stock: 12, is_default: false },
    ],
    images: {
      hero: '/images/products/la-fleur-du-nil-bottle.jpg',
      bottle: '/images/products/la-fleur-du-nil-bottle.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/products/la-fleur-du-nil-bottle.jpg',
      texture: '/images/brand/NEW_brand-identity.png',
    },
    reviews: [
      {
        id: 1,
        name: 'فاطمة الزهراء',
        rating: 5,
        date: '2026-11-04',
        body_en: 'An extraordinary floral creation. The jasmine and poppy accord is pure poetry. Very long-lasting on skin.',
        body_ar: 'عطر زهري استثنائي بكل معنى الكلمة. رائحة الياسمين طبيعية وراقية جداً وثباته مذهل.',
      },
    ],
    accent_gradient: 'from-[#FBF5ED] via-[#F4E8D5] to-[#E5CFB0]',
    featured_on_home: true,
    home_order: 1,
  },
  {
    id: 2,
    slug: 'ambre-dalexandrie',
    category_slug: 'parfums',
    product_type: 'perfume',
    name_en: 'Ambre d’Alexandrie',
    name_ar: 'عنبر الإسكندرية',
    tagline_en: 'Sun-warmed fossil amber, Bourbon vanilla, and Mediterranean sea salt',
    tagline_ar: 'عنبر دافئ، فانيليا مدغشقر، ولمسة من نسيم البحر المتوسط',
    story_en:
      'Capturing the golden Mediterranean dusk over the ancient port of Alexandria. Warm fossil amber crystals blended with Madagascar vanilla bean, caramelized labdanum, and a whisper of mineral sea salt. Deep, comforting, and irresistibly seductive.',
    story_ar:
      'يستحضر لحظات الغروب الذهبية على شواطئ الإسكندرية العريقة. بلورات العنبر النقي الممزوجة بحبوب فانيليا مدغشقر واللابدانوم الدافئ، مع لمسة خفيفة من نسيم البحر المتوسط ليمنح دفئاً راقياً وجاذبية لا تُقاوم.',
    family: 'amber',
    family_en: 'Amber Warm Gourmand',
    family_ar: 'عنبر دافئ شرقي',
    concentration: 'Extrait de Parfum (35%)',
    gender_vibe: 'Unisex',
    longevity: 10,
    sillage: 9,
    intensity: 9,
    top_notes_en: ['Alexandrian Sea Salt', 'Bitter Orange Peel', 'Cardamom Pods'],
    top_notes_ar: ['نسيم الملح السكندري', 'قشر البرتقال المر', 'حبوب الهيل'],
    heart_notes_en: ['Sun-Warmed Fossil Amber', 'Labdanum Resin', 'Tonka Bean'],
    heart_notes_ar: ['بلورات العنبر الدافئ', 'صمغ اللابدانوم', 'حبوب التونكا'],
    base_notes_en: ['Bourbon Vanilla Extract', 'Atlas Cedarwood', 'Smoked Benzoin'],
    base_notes_ar: ['خلاصة فانيليا البوربون', 'أرز أطلس', 'جاوي مدخن'],
    callout_top: { en: 'Top Notes — Sea Salt & Bitter Orange', ar: 'القمة العطرية — نسيم الملح والبرتقال المر' },
    callout_cap: { en: 'Hand-Carved Walnut Cap', ar: 'غطاء من خشب الجوز المحفور يدوياً' },
    callout_seal: { en: 'Burgundy Venus Wax Seal', ar: 'ختم الشمع البرغندي الملكي' },
    variants: [
      { id: 201, name_en: '30 ml', name_ar: '٣٠ مل', size_ml: 30, price: 2450, compare_at_price: 2850, sku: 'LV-AA-30', stock: 14, is_default: false },
      { id: 202, name_en: '50 ml', name_ar: '٥٠ مل', size_ml: 50, price: 3750, compare_at_price: 4300, sku: 'LV-AA-50', stock: 20, is_default: true },
      { id: 203, name_en: '100 ml', name_ar: '١٠٠ مل', size_ml: 100, price: 5950, compare_at_price: 6800, sku: 'LV-AA-100', stock: 15, is_default: false },
    ],
    images: {
      hero: '/images/products/ambre-dalexandrie-bottle.jpg',
      bottle: '/images/products/ambre-dalexandrie-bottle.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/products/ambre-dalexandrie-bottle.jpg',
      texture: '/images/brand/NEW_brand-identity.png',
    },
    reviews: [
      {
        id: 2,
        name: 'كريم م.',
        rating: 5,
        date: '2026-10-28',
        body_en: 'The amber and sea salt balance is sheer genius. Luxurious and sophisticated without being overpowering.',
        body_ar: 'توازن العنبر مع ملح البحر عبقري. عطر فخم ومميز ومريح جداً للأعصاب.',
      },
    ],
    accent_gradient: 'from-[#FDF3E7] via-[#F6DEBE] to-[#E0B888]',
    featured_on_home: true,
    home_order: 2,
  },
  {
    id: 3,
    slug: 'bois-de-louxor',
    category_slug: 'parfums',
    product_type: 'perfume',
    name_en: 'Bois de Louxor',
    name_ar: 'خشب الأقصر',
    tagline_en: 'Aged cedarwood, green papyrus reed, and smoky temple resins',
    tagline_ar: 'أخشاب الأرز العتيقة، ورق البردي الأخضر، وراتنجات البخور الهادئ',
    story_en:
      'Inspired by the monumental columns of Luxor standing against the evening desert breeze. Ancient cedarwood and crisp green papyrus wrapped in subtle incense smoke, dry vetiver roots, and polished leather. Serene, majestic, and deeply rooted.',
    story_ar:
      'مستوحى من مهابة أعمدة الأقصر العظيمة مع نسيم المساء الصحراوي. أخشاب الأرز المعتقة ونبات البردي الأخضر محاطة بدخان البخور الهادئ وجذور الفيتيفر والجلود الفاخرة. عطر يفيض بالوقار والسكينة والعمق.',
    family: 'woody',
    family_en: 'Smoky Woody',
    family_ar: 'خشبي أروماتك مهيب',
    concentration: 'Extrait de Parfum (34%)',
    gender_vibe: 'Unisex',
    longevity: 9,
    sillage: 8,
    intensity: 9,
    top_notes_en: ['Green Nile Papyrus', 'Smoked Cardamom', 'Pink Pepper'],
    top_notes_ar: ['ورق البردي الأخضر', 'هيل مدخن', 'فلفل وردي'],
    heart_notes_en: ['Ancient Atlas Cedar', 'Olibanum Tears', 'Iris Root'],
    heart_notes_ar: ['أرز أطلس العتيق', 'دموع اللبان', 'جذور السوسن'],
    base_notes_en: ['Haitian Vetiver', 'Smoked Birch', 'Dark Saddle Leather', 'Cashmere Musk'],
    base_notes_ar: ['فيتيفر هايتي', 'أخشاب البتولا', 'جلد فاخر ناعم', 'مسك كشميري'],
    callout_top: { en: 'Top Notes — Green Papyrus & Pink Pepper', ar: 'القمة العطرية — نبات البردي والفلفل الوردي' },
    callout_cap: { en: 'Hand-Carved Walnut Cap', ar: 'غطاء من خشب الجوز المحفور يدوياً' },
    callout_seal: { en: 'Burgundy Venus Wax Seal', ar: 'ختم الشمع البرغندي الملكي' },
    variants: [
      { id: 301, name_en: '30 ml', name_ar: '٣٠ مل', size_ml: 30, price: 2500, compare_at_price: 2900, sku: 'LV-BL-30', stock: 15, is_default: false },
      { id: 302, name_en: '50 ml', name_ar: '٥٠ مل', size_ml: 50, price: 3800, compare_at_price: 4400, sku: 'LV-BL-50', stock: 22, is_default: true },
      { id: 303, name_en: '100 ml', name_ar: '١٠٠ مل', size_ml: 100, price: 6000, compare_at_price: 6800, sku: 'LV-BL-100', stock: 10, is_default: false },
    ],
    images: {
      hero: '/images/products/bois-de-louxor-bottle.jpg',
      bottle: '/images/products/bois-de-louxor-bottle.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/products/bois-de-louxor-bottle.jpg',
      texture: '/images/brand/NEW_brand-identity.png',
    },
    reviews: [
      {
        id: 3,
        name: 'طارق س.',
        rating: 5,
        date: '2026-10-15',
        body_en: 'Sublime woody fragrance. Clean, intellectual, and deeply comforting. The papyrus note is truly unique.',
        body_ar: 'عطر خشبي فخم ومميز جداً. نوتة البردي مع الأرز تضيف طابعاً فريداً وأنيقاً لا يشبه أي عطر آخر.',
      },
    ],
    accent_gradient: 'from-[#F7EFE1] via-[#EEDABF] to-[#DFC19A]',
    featured_on_home: true,
    home_order: 3,
  },
  {
    id: 4,
    slug: 'al-oud-al-aswad',
    category_slug: 'parfums',
    product_type: 'perfume',
    name_en: 'Al Oud Al Aswad',
    name_ar: 'العود الأسود',
    tagline_en: 'Aged Cambodian wild oud, saffron threads, and noble resins',
    tagline_ar: 'خلاصة العود الكمبودي البري العتيق، خيوط الزعفران، والراتنجات النبيلة',
    story_en:
      'The sovereign pinnacle of L’VENUS Haute Parfumerie. Wild Cambodian oud aged to velvet maturity, laced with Persian saffron threads, dark Damascena rose petals, and noble myrrh. Deep, commanding, and wrapped in warm leather. A statement of timeless authority.',
    story_ar:
      'درة تاج عطور دار لوفينوس. خلاصة العود الكمبودي البري المعتق ببراعة حتى وصل لنعومة المخمل، ممزوجاً بخيوط الزعفران الفارسي وبتلات الورد الجوري والمر الملكي. عطر وقور ذو هيبة أصيلة وحضور لا يغيب.',
    family: 'oud',
    family_en: 'Oud & Noble Spice',
    family_ar: 'عود نقي وتوابل نبيلة',
    concentration: 'Extrait de Parfum (38%)',
    gender_vibe: 'Unisex',
    longevity: 10,
    sillage: 10,
    intensity: 10,
    top_notes_en: ['Persian Saffron Threads', 'Black Pepper', 'Damascena Rose Petals'],
    top_notes_ar: ['خيوط زعفران فارسي', 'فلفل أسود', 'بتلات ورد جوري'],
    heart_notes_en: ['Cambodian Wild Oud', 'Sacred Myrrh', 'Frankincense Resin'],
    heart_notes_ar: ['عود كمبودي بري معتق', 'مر ملكي نقي', 'لبان حوجري'],
    base_notes_en: ['Natural Ambergris', 'Dark Saddle Leather', 'Smoked Birch', 'Black Musk'],
    base_notes_ar: ['عنبر طبيعي نقي', 'جلد داكن ناعم', 'أخشاب البتولا', 'مسك أسود'],
    callout_top: { en: 'Top Notes — Saffron Threads & Black Pepper', ar: 'القمة العطرية — خيوط الزعفران والفلفل الأسود' },
    callout_cap: { en: 'Hand-Carved Walnut Cap', ar: 'غطاء من خشب الجوز المحفور يدوياً' },
    callout_seal: { en: 'Burgundy Venus Wax Seal', ar: 'ختم الشمع البرغندي الملكي' },
    variants: [
      { id: 401, name_en: '30 ml', name_ar: '٣٠ مل', size_ml: 30, price: 3200, compare_at_price: 3600, sku: 'LV-OA-30', stock: 10, is_default: false },
      { id: 402, name_en: '50 ml', name_ar: '٥٠ مل', size_ml: 50, price: 4800, compare_at_price: 5400, sku: 'LV-OA-50', stock: 15, is_default: false },
      { id: 403, name_en: '100 ml', name_ar: '١٠٠ مل', size_ml: 100, price: 7600, compare_at_price: 8500, sku: 'LV-OA-100', stock: 8, is_default: true },
    ],
    images: {
      hero: '/images/products/oud-imperial-du-caire-bottle.jpg',
      bottle: '/images/products/oud-imperial-du-caire-bottle.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/products/oud-imperial-du-caire-bottle.jpg',
      texture: '/images/brand/NEW_brand-identity.png',
    },
    reviews: [
      {
        id: 4,
        name: 'عبد الرحمن م.',
        rating: 5,
        date: '2026-11-01',
        body_en: 'A true royal oud. Completely smooth and free from any harsh animalic edge. Worth every single pound.',
        body_ar: 'عود ملكي بمعنى الكلمة. سلس ومريح بلا أي حدة مزعجة. يستحق كل تقدير.',
      },
    ],
    accent_gradient: 'from-[#EAE2D7] via-[#D8C7B4] to-[#BFA992]',
    featured_on_home: true,
    home_order: 4,
  },
  // Flagship Skincare Product (Demonstrating Multi-Category Maison Structure)
  {
    id: 5,
    slug: 'creme-sublime-alexandrie',
    category_slug: 'soin',
    product_type: 'skincare',
    name_en: 'Crème Sublime aux Roses d’Alexandrie',
    name_ar: 'كريم الورد السكندري الفائق',
    tagline_en: 'Restorative cellular cream infused with cold-distilled Damask roses',
    tagline_ar: 'كريم نباتي فائق الترميم بماء الورد الدمشقي السكندري المعصور على البارد',
    story_en:
      'The inaugural skincare creation from L’VENUS. Hand-crafted in small porcelain batches, combining pure Alexandrian Damask rose hydrosol with cold-pressed desert jojoba, squalane, and revitalizing mineral peptides. Restores radiance, firm elasticity, and velvet softness to fatigued skin.',
    story_ar:
      'أولى إبداعات العناية الفائقة من دار لوفينوس. مصاغ في دفعات خزفية محدودة من ماء الورد السكندري النقي وزيت بذور الجوجوبا الصحراوية والببتيدات الحيوية، ليعيد النضارة والمرونة الفائقة والملمس الحريري للبشرة.',
    details_en:
      'Formulated with 98.4% natural botanical actives. Enriched with natural hyaluronic acid, cold-pressed seed oils, and royal Egyptian rose water. Dermatologically tested for all skin types including sensitive.',
    details_ar:
      'تركيبة نباتية نقية بنسبة ٩٨.٤٪. غنية بحمض الهيالورونيك الطبيعي والزيوت النباتية المعصورة على البارد وماء الورد الملكي. ملائم لجميع أنواع البشرة حتى الحساسة.',
    ingredients_text_en:
      'Rosa Damascena Distillate, Desert Jojoba Seed Oil, Olive Squalane, Marine Collagen Peptides, Niacinamide, Shea Butter Extract, Vitamin E.',
    ingredients_text_ar:
      'خلاصة ماء الورد الدمشقي، زيت بذور الجوجوبا الصحراوي، سكوالين الزيتون، ببتيدات الكولاجين البحري، نياسيناميد، فيتامين هـ.',
    family: 'botanical',
    family_en: 'Botanical Skincare',
    family_ar: 'عناية نباتية نشطة',
    concentration: 'Cellular Botanical Formula',
    gender_vibe: 'Unisex',
    longevity: 8,
    sillage: 5,
    intensity: 7,
    top_notes_en: ['Fresh Alexandrian Rose', 'Sweet Almond', 'Bitter Orange Flower'],
    top_notes_ar: ['ورد سكندري طازج', 'لوز حلو', 'زهر البرتقال المر'],
    heart_notes_en: ['Hyaluronic Acid Peptides', 'Camelina Oil', 'Centella Asiatica'],
    heart_notes_ar: ['ببتيدات الهيالورونيك', 'زيت الكاميلينا', 'نبات السنتيللا'],
    base_notes_en: ['Desert Jojoba', 'Plant Squalane', 'Pure Shea'],
    base_notes_ar: ['جوجوبا صحراوية', 'سكوالين نباتي', 'شيا نقية'],
    callout_top: { en: 'Active Formula — Cold-Distilled Alexandrian Rose', ar: 'التركيبة الفعالة — ماء الورد السكندري' },
    callout_cap: { en: 'Lacquered Porcelain Jar with Gold Seal', ar: 'عبوة خزفية مطلية بختم الذهب' },
    callout_seal: { en: 'Burgundy Wax Stamp of Quality', ar: 'ختم الجودة العنابي الفاخر' },
    variants: [
      { id: 501, name_en: '50 ml Jar', name_ar: 'عبوة ٥٠ مل', size_ml: 50, price: 3400, compare_at_price: 3900, sku: 'LV-SK-50', stock: 20, is_default: true },
      { id: 502, name_en: '100 ml Luxury Jar', name_ar: 'عبوة ١٠٠ مل فاخرة', size_ml: 100, price: 5800, compare_at_price: 6500, sku: 'LV-SK-100', stock: 12, is_default: false },
    ],
    images: {
      hero: '/images/products/coffret-decouverte-box.jpg',
      bottle: '/images/products/coffret-decouverte-box.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/brand/NEW_brand-identity.png',
      texture: '/images/brand/brand-identity.jpg',
    },
    reviews: [
      {
        id: 5,
        name: 'مها ع.',
        rating: 5,
        date: '2026-11-09',
        body_en: 'The texture is pure silk. Leaves the skin hydrated and glowing without any greasy feeling. Smells like a royal garden.',
        body_ar: 'الملمس حريري رائع ويترك البشرة نضرة ومشدودة برائحة ورد طبيعية تأسر القلب.',
      },
    ],
    accent_gradient: 'from-[#FDF3E7] via-[#F6DEBE] to-[#E0B888]',
    featured_on_home: true,
    home_order: 5,
  },
  {
    id: 6,
    slug: 'coffret-decouverte',
    category_slug: 'parfums',
    product_type: 'coffret',
    name_en: 'Le Coffret Découverte',
    name_ar: 'مجموعة استكشاف لوفينوس',
    tagline_en: 'The Discovery Set — 4 rare Extraits de Parfum (4 × 5ml) with full price redeemable voucher',
    tagline_ar: 'مجموعة الاكتشاف الملكية — ٤ خلاصات عطرية نادرة (٤ × ٥ مل) مع قسيمة استرداد كامل القيمة',
    story_en:
      'The quintessential introduction to L’VENUS. Presented in a black lacquered embossed box with gold foil stamping and the burgundy Venus wax medallion. Contains four 5ml spray flacons representing our signature Extraits de Parfum: La Fleur du Nil, Ambre d’Alexandrie, Bois de Louxor, and Al Oud Al Aswad. Your entire investment of 950 EGP is redeemable as a voucher on your subsequent 50ml or 100ml flacon.',
    story_ar:
      'المدخل المثالي لاكتشاف عالم لوفينوس العطري. صندوق أسود ورنيشي فاخر محفور بلمسات ذهبية وممهور بختم الشمع العنابي الملكي. يضم ٤ عينات رذاذ بحجم ٥ مل من خلاصات عطور الدار الأيقونية: زهرة النيل، عنبر الإسكندرية، خشب الأقصر، والعود الأسود. تسترد كامل قيمة المجموعة (٩٥٠ ج.م) كقسيمة خصم فورية عند اقتنائك أي زجاجة بحجم كامل.',
    details_en:
      'Includes 4 × 5ml luxury glass atomizers with 32%-38% Extrait de Parfum concentration, tasting cards, and personal voucher code redeemable on any 50ml or 100ml fragrance.',
    details_ar:
      'تشمل ٤ عينات زجاجية فاخرة بحجم ٥ مل بتركيز مستخلص عطري نقي (٣٢٪ - ٣٨٪)، مع بطاقات السرد العطري وقسيمة خصم تعادل كامل سعر المجموعة.',
    family: 'coffret',
    family_en: 'Discovery Coffret',
    family_ar: 'مجموعة استكشافية فاخرة',
    concentration: '4 × Extrait de Parfum (32% - 38%)',
    gender_vibe: 'Unisex',
    longevity: 9,
    sillage: 9,
    intensity: 9,
    top_notes_en: ['Nile Wild Poppy', 'Alexandrian Bergamot', 'Green Papyrus', 'Persian Saffron'],
    top_notes_ar: ['خشخاش النيل', 'برغموت سكندري', 'بردي أخضر', 'زعفران فارسي'],
    heart_notes_en: ['Egyptian Jasmine', 'Solar Ambergris', 'Atlas Cedar', 'Aged Cambodian Oud'],
    heart_notes_ar: ['ياسمين مصري', 'عنبر ملكي', 'أرز أطلس', 'عود كمبودي'],
    base_notes_en: ['Botanical Musk', 'Bourbon Vanilla', 'Saddle Leather', 'Royal Myrrh'],
    base_notes_ar: ['مسك نباتي', 'فانيليا بوربون', 'جلد فاخر', 'مر نبيل'],
    callout_top: { en: '4 Signature Extraits de Parfum Flacons', ar: '٤ زجاجات رذاذ مصغرة من خلاصة العطور' },
    callout_cap: { en: 'Lacquered Gift Coffret with Gold Foil', ar: 'علبة هدايا ورنيشية محفورة بالذهب' },
    callout_seal: { en: 'Burgundy Wax Stamp & Redeemable Card', ar: 'ختم الشمع وبطاقة استرداد القيمة' },
    variants: [
      { id: 601, name_en: 'Discovery Set (4 × 5 ml)', name_ar: 'صندوق الاستكشاف (٤ × ٥ مل)', size_ml: 20, price: 950, compare_at_price: 1300, sku: 'LV-BOX-4X5', stock: 50, is_default: true },
    ],
    images: {
      hero: '/images/products/coffret-decouverte-box.jpg',
      bottle: '/images/products/coffret-decouverte-box.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/brand/NEW_brand-identity.png',
      texture: '/images/brand/brand-identity.jpg',
    },
    reviews: [
      {
        id: 6,
        name: 'كريم م.',
        rating: 5,
        date: '2026-11-12',
        body_en: 'The absolute best way to experience L’VENUS before committing. Every single scent is a masterpiece, and getting the price deducted from my 100ml order made it a no-brainer.',
        body_ar: 'أفضل تجربة لاكتشاف العطور بتأني. كل عطر تحفة فنية واسترداد السعر عند شراء الزجاجة الكبيرة ميزة استثنائية.',
      },
    ],
    accent_gradient: 'from-[#F5EADB] via-[#E8D1B2] to-[#B89059]',
    featured_on_home: true,
    home_order: 6,
  },
  {
    id: 71,
    slug: 'lip-gloss-nude-peach',
    category_slug: 'soin',
    product_type: 'lipgloss',
    shade_hex: '#D49678',
    shade_name_en: '01 Nude Peach',
    shade_name_ar: '٠١ نود خوخي دافئ',
    name_en: 'Élixir Lèvres Satiné — 01 Nude Peach',
    name_ar: 'إكسير الشفاه الساتاني — ٠١ نود خوخي دافئ',
    tagline_en: 'Couture plumping lip gloss in warm sunlit nude peach with mirror-glass reflection',
    tagline_ar: 'غلوس الشفاه الفاخر بلون نود خوخي دافئ ولمعان زجاجي عاكس بقطرات الورد وبلح الصحراء',
    story_en:
      'A warm, sun-drenched nude peach inspired by Alexandrian coastal dawns. Formulated with cold-pressed Damask rose petals, desert date seed oil, and botanical squalane. Delivers deep cushiony hydration with an ethereal mirror-glass shine that never feels sticky.',
    story_ar:
      'درجة نود خوخي دافئة مستوحاة من إشراقة فجر الإسكندرية. صيغت بقطرات الورد الدمشقي وزيت بذور بلح الصحراء والسكوالين النباتي لتمنح الشفاه امتلاءً طبيعياً ولمعاناً زجاجياً فائق النعومة وخالٍ تماماً من اللزوجة.',
    family: 'botanical',
    family_en: 'Warm Nude & Botanical Glow',
    family_ar: 'نود دافئ وتألق نباتي',
    concentration: 'Cellular Lip Gloss & Elixir',
    gender_vibe: 'Feminine',
    longevity: 8,
    sillage: 6,
    intensity: 6,
    top_notes_en: ['Alexandrian Damask Rose', 'Sweet Orange Blossom', 'Raw Honey Accord'],
    top_notes_ar: ['ورد دمشقي سكندري', 'زهر البرتقال الحلو', 'شهد العسل النقي'],
    heart_notes_en: ['Botanical Hyaluronic Acid', 'Desert Date Seed Oil', 'Vitamin E Serum'],
    heart_notes_ar: ['حمض الهيالورونيك النباتي', 'زيت بذور بلح الصحراء', 'سيروم فيتامين E'],
    base_notes_en: ['Madagascar Vanilla Orchid', 'Golden Shea Nectar', 'Silk Squalane'],
    base_notes_ar: ['أوركيد فانيليا مدغشقر', 'رحيق الشيا الذهبي', 'سكوالين الحرير'],
    callout_top: { en: 'Crystal-clear acrylic flacon with bevelled edges', ar: 'قارورة كريستالية مصقولة بحواف هندسية' },
    callout_cap: { en: 'Sculpted Venus profile emblem transparent cap', ar: 'غطاء زجاجي شفاف محفور بشعار لوفينوس' },
    callout_seal: { en: 'Plush velvet cloud applicator wand', ar: 'موزع مخملي فائق النعومة والدقة' },
    variants: [
      {
        id: 711,
        name_en: '5 ml Couture Lip Flacon',
        name_ar: '٥ مل قارورة كوتور محفورة',
        size_ml: 5,
        price: 750,
        compare_at_price: 950,
        sku: 'LV-LIP-NP-01',
        stock: 50,
        is_default: true,
      },
    ],
    images: {
      hero: '/images/lipgloss/shade-nude-peach.jpg',
      bottle: '/images/lipgloss/shade-nude-peach.jpg',
      box: '/images/lipgloss/shade-nude-peach-open.jpg',
      lifestyle: '/images/lipgloss/shade-collection-trio.jpg',
      texture: '/images/lipgloss/shade-collection-swatches.jpg',
    },
    reviews: [
      {
        id: 711,
        name: 'سارة المنشاوي',
        rating: 5,
        date: '2026-11-18',
        body_en: 'The Nude Peach is my everyday essential. Plumping, deeply nourishing and looks gorgeous alone or over lip liner.',
        body_ar: 'درجة النود الخوخي خيالية للاستخدام اليومي! بتدي امتلاء طبيعي وترطيب عميق بدون أي تلزيق.',
      },
    ],
    accent_gradient: 'from-[#FAF1ED] via-[#F4D9C8] to-[#D49678]',
    featured_on_home: true,
    home_order: 7,
  },
  {
    id: 72,
    slug: 'lip-gloss-dusty-rose',
    category_slug: 'soin',
    product_type: 'lipgloss',
    shade_hex: '#B67583',
    shade_name_en: '02 Dusty Rose',
    shade_name_ar: '٠٢ وردي كوتور',
    name_en: 'Élixir Lèvres Satiné — 02 Dusty Rose',
    name_ar: 'إكسير الشفاه الساتاني — ٠٢ وردي كوتور',
    tagline_en: 'The signature couture mauve-rose gloss infused with Damask rose and plumping botanical squalane',
    tagline_ar: 'درجة الدار الأيقونية بلون الورد المشمشي الكوتور ولمعان الكريستال الفاتن',
    story_en:
      'The iconic L’VENUS signature shade. An elegant dusty rose with cool undertones that complements every complexion. Infused with pure Damask rose absolute and desert date nectar for timeless Parisian elegance.',
    story_ar:
      'درجة لوفينوس الأيقونية الخالدة. وردي كوتور ساتاني بنغمات هادئة تناسب كافة درجات البشرة وتمنح الشفاه بريقاً زجاجياً عاكساً مع نفحات الورد الطبيعي.',
    family: 'botanical',
    family_en: 'Dusty Rose & Botanical Radiance',
    family_ar: 'وردي كوتور وإشراقة نباتية',
    concentration: 'Cellular Lip Gloss & Elixir',
    gender_vibe: 'Feminine',
    longevity: 8,
    sillage: 6,
    intensity: 6,
    top_notes_en: ['Alexandrian Damask Rose', 'Sweet Orange Blossom', 'Raw Honey Accord'],
    top_notes_ar: ['ورد دمشقي سكندري', 'زهر البرتقال الحلو', 'شهد العسل النقي'],
    heart_notes_en: ['Botanical Hyaluronic Acid', 'Desert Date Seed Oil', 'Vitamin E Serum'],
    heart_notes_ar: ['حمض الهيالورونيك النباتي', 'زيت بذور بلح الصحراء', 'سيروم فيتامين E'],
    base_notes_en: ['Madagascar Vanilla Orchid', 'Golden Shea Nectar', 'Silk Squalane'],
    base_notes_ar: ['أوركيد فانيليا مدغشقر', 'رحيق الشيا الذهبي', 'سكوالين الحرير'],
    callout_top: { en: 'Crystal-clear acrylic flacon with bevelled edges', ar: 'قارورة كريستالية مصقولة بحواف هندسية' },
    callout_cap: { en: 'Sculpted Venus profile emblem transparent cap', ar: 'غطاء زجاجي شفاف محفور بشعار لوفينوس' },
    callout_seal: { en: 'Plush velvet cloud applicator wand', ar: 'موزع مخملي فائق النعومة والدقة' },
    variants: [
      {
        id: 721,
        name_en: '5 ml Couture Lip Flacon',
        name_ar: '٥ مل قارورة كوتور محفورة',
        size_ml: 5,
        price: 750,
        compare_at_price: 950,
        sku: 'LV-LIP-DR-02',
        stock: 65,
        is_default: true,
      },
    ],
    images: {
      hero: '/images/lipgloss/shade-dusty-rose.jpg',
      bottle: '/images/lipgloss/shade-dusty-rose.jpg',
      box: '/images/lipgloss/shade-dusty-rose-open.jpg',
      lifestyle: '/images/lipgloss/shade-collection-trio.jpg',
      texture: '/images/lipgloss/shade-collection-swatches.jpg',
    },
    reviews: [
      {
        id: 721,
        name: 'ياسمين خليل',
        rating: 5,
        date: '2026-11-19',
        body_en: 'Pure Parisian luxury. The Dusty Rose shade is perfection, so hydrating and the crystal applicator bottle is a jewel.',
        body_ar: 'فخامة لا توصف! درجة الدستي روز مثالية ومريحة جداً على الشفايف، وشكل العبوة الكريستالية قطعة مجوهرات.',
      },
    ],
    accent_gradient: 'from-[#FAF1ED] via-[#F2D6DC] to-[#B67583]',
    featured_on_home: true,
    home_order: 4,
  },
  {
    id: 73,
    slug: 'lip-gloss-deep-berry',
    category_slug: 'soin',
    product_type: 'lipgloss',
    shade_hex: '#783B4B',
    shade_name_en: '03 Deep Berry',
    shade_name_ar: '٠٣ توتي ملكي',
    name_en: 'Élixir Lèvres Satiné — 03 Deep Berry',
    name_ar: 'إكسير الشفاه الساتاني — ٠٣ توتي ملكي',
    tagline_en: 'Rich sovereign berry tint with velvet depth and high-lacquer mirror radiance',
    tagline_ar: 'درجة التوت الملكي الفاخرة بعمق جذاب ولمعان زجاجي ساحر يفيض بالأنوثة والسيادة',
    story_en:
      'A deep, sovereign berry tone radiating quiet luxury and dramatic allure. Infused with wild blackberries, Alexandrian rose petals, and desert date oil to coat the lips in lustrous, non-sticky perfection.',
    story_ar:
      'درجة التوت الملكي العميقة المستوحاة من ليالي الشرق الفاتنة. تمنح الشفاه لوناً غنياً يفيض بالجاذبية والفخامة مع لمعان زجاجي فائق يدوم طويلاً.',
    family: 'botanical',
    family_en: 'Deep Berry & Royal Nectar',
    family_ar: 'توتي عميق ورحيق ملكي',
    concentration: 'Cellular Lip Gloss & Elixir',
    gender_vibe: 'Feminine',
    longevity: 9,
    sillage: 6,
    intensity: 7,
    top_notes_en: ['Wild Blackberry Nectar', 'Damask Rose Absolute', 'Cassis Blossom'],
    top_notes_ar: ['رحيق التوت البري', 'مستخلص الورد الدمشقي', 'زهر الكشمش الأسود'],
    heart_notes_en: ['Botanical Hyaluronic Acid', 'Desert Date Seed Oil', 'Vitamin E Serum'],
    heart_notes_ar: ['حمض الهيالورونيك النباتي', 'زيت بذور بلح الصحراء', 'سيروم فيتامين E'],
    base_notes_en: ['Madagascar Vanilla Orchid', 'Golden Shea Nectar', 'Silk Squalane'],
    base_notes_ar: ['أوركيد فانيليا مدغشقر', 'رحيق الشيا الذهبي', 'سكوالين الحرير'],
    callout_top: { en: 'Crystal-clear acrylic flacon with bevelled edges', ar: 'قارورة كريستالية مصقولة بحواف هندسية' },
    callout_cap: { en: 'Sculpted Venus profile emblem transparent cap', ar: 'غطاء زجاجي شفاف محفور بشعار لوفينوس' },
    callout_seal: { en: 'Plush velvet cloud applicator wand', ar: 'موزع مخملي فائق النعومة والدقة' },
    variants: [
      {
        id: 731,
        name_en: '5 ml Couture Lip Flacon',
        name_ar: '٥ مل قارورة كوتور محفورة',
        size_ml: 5,
        price: 750,
        compare_at_price: 950,
        sku: 'LV-LIP-DB-03',
        stock: 45,
        is_default: true,
      },
    ],
    images: {
      hero: '/images/lipgloss/shade-deep-berry.jpg',
      bottle: '/images/lipgloss/shade-deep-berry.jpg',
      box: '/images/lipgloss/shade-deep-berry-open.jpg',
      lifestyle: '/images/lipgloss/shade-collection-trio.jpg',
      texture: '/images/lipgloss/shade-collection-swatches.jpg',
    },
    reviews: [
      {
        id: 731,
        name: 'نوران الشاذلي',
        rating: 5,
        date: '2026-11-19',
        body_en: 'The Deep Berry gives the most breathtaking juicy berry lip! Not sticky at all and stays vibrant.',
        body_ar: 'درجة الديب بيري سحرية بجد! بتدي لون توتي شيك جداً وامتلاء ولمعان تحفة، وثابتة ومرطبة جداً.',
      },
    ],
    accent_gradient: 'from-[#FAF1ED] via-[#E2BAC6] to-[#783B4B]',
    featured_on_home: true,
    home_order: 8,
  },
  {
    id: 7,
    slug: 'elixir-levres-satine',
    category_slug: 'soin',
    product_type: 'lipgloss',
    shade_hex: '#B67583',
    shade_name_en: 'The Lip Gloss Collection Trio',
    shade_name_ar: 'المجموعة الثلاثية الكاملة',
    name_en: 'Élixir Lèvres Satiné — The Shade Collection Trio',
    name_ar: 'إكسير الشفاه الساتاني — المجموعة الثلاثية الكاملة',
    tagline_en: 'The complete three-shade couture lip gloss collection: Nude Peach, Dusty Rose & Deep Berry',
    tagline_ar: 'المجموعة الثلاثية الكاملة لليب غلوس لوفينوس بالألوان الثلاثة: نود خوخي، وردي كوتور، وتوتي ملكي',
    story_en:
      'Experience the complete spectrum of L’VENUS lip radiance. All three bespoke shades—01 Nude Peach, 02 Dusty Rose, and 03 Deep Berry—presented together in crystal flacons with pure Damask rose infusion.',
    story_ar:
      'اختبري الطيف الكامل لتألق شفاه لوفينوس الملكي. تشمل المجموعة الكاملة الدرجات الثلاث الحصرية: ٠١ نود خوخي دافئ، ٠٢ وردي كوتور ساتاني، و٠٣ توتي ملكي عميق في قوارير كريستالية نقية.',
    family: 'botanical',
    family_en: 'Couture Lip Radiance Trio',
    family_ar: 'ثلاثية الشفاه النباتية الفاخرة',
    concentration: 'Cellular Lip Gloss & Elixir (3 x 5ml)',
    gender_vibe: 'Feminine',
    longevity: 9,
    sillage: 6,
    intensity: 7,
    top_notes_en: ['Alexandrian Damask Rose', 'Sweet Orange Blossom', 'Wild Blackberry'],
    top_notes_ar: ['ورد دمشقي سكندري', 'زهر البرتقال الحلو', 'توت بري نقي'],
    heart_notes_en: ['Botanical Hyaluronic Acid', 'Desert Date Seed Oil', 'Vitamin E Serum'],
    heart_notes_ar: ['حمض الهيالورونيك النباتي', 'زيت بذور بلح الصحراء', 'سيروم فيتامين E'],
    base_notes_en: ['Madagascar Vanilla Orchid', 'Golden Shea Nectar', 'Silk Squalane'],
    base_notes_ar: ['أوركيد فانيليا مدغشقر', 'رحيق الشيا الذهبي', 'سكوالين الحرير'],
    callout_top: { en: 'Set of 3 crystal acrylic flacons with applicator wands', ar: 'طقم من ٣ قوارير كريستالية بموزعات مخملية' },
    callout_cap: { en: 'Engraved Venus profile caps with bevelled edges', ar: 'أغطية مصقولة ومحفورة بتاج وشعار لوفينوس' },
    callout_seal: { en: 'L’VENUS Couture Velvet Presentation Box', ar: 'صندوق تقديم مخملي راقي من لوفينوس' },
    variants: [
      {
        id: 703,
        name_en: 'Complete Trio Collection (3 x 5ml)',
        name_ar: 'المجموعة الثلاثية الكاملة (٣ × ٥ مل)',
        size_ml: 15,
        price: 1850,
        compare_at_price: 2250,
        sku: 'LV-LIP-TRIO',
        stock: 30,
        is_default: true,
      },
    ],
    images: {
      hero: '/images/lipgloss/shade-collection-trio.jpg',
      bottle: '/images/lipgloss/shade-collection-trio.jpg',
      box: '/images/lipgloss/shade-dusty-rose-open.jpg',
      lifestyle: '/images/lipgloss/shade-collection-trio.jpg',
      texture: '/images/lipgloss/shade-collection-swatches.jpg',
    },
    reviews: [
      {
        id: 701,
        name: 'فريدة عاصم',
        rating: 5,
        date: '2026-11-19',
        body_en: 'Buying the full trio was the best decision! Each shade is uniquely stunning and the packaging is absolute art.',
        body_ar: 'شراء المجموعة الثلاثية بالكامل كان أحسن قرار! كل لون أحلى من التاني والعلب تحفة على التسريحة.',
      },
    ],
    accent_gradient: 'from-[#FAF1ED] via-[#F4D9C8] to-[#B67583]',
    featured_on_home: true,
    home_order: 3,
  },
  {
    id: 8,
    slug: 'brume-botanique-dalexandrie',
    category_slug: 'brume',
    product_type: 'mist',
    name_en: 'Brume Botanique d’Alexandrie — Body Splash & Mist',
    name_ar: 'رذاذ الإسكندرية النباتي — عطر الجسم والشعر',
    tagline_en: 'Refreshing fine mist body splash & hair veil with Mediterranean neroli and sheer white musk',
    tagline_ar: 'رذاذ عطري أرستقراطي للجسم والشعر بنفحات زهر البرتقال والنيرولي والمسك الأبيض النقي',
    story_en:
      'Engineered for full-body immersion and hair conditioning. Cold-infused with Mediterranean neroli blossoms, zesty green bergamot, aloe vera hydration, and airy silk musks. A featherweight, alcohol-tempered mist that surrounds the wearer in an aura of crisp coastal majesty.',
    story_ar:
      'صُمم خصيصاً لرذاذ الجسم والشعر ليمنحك هالة من الانتعاش الأرستقراطي الراقي. يمزج بين زهر البرتقال المتوسطي ونيرولي الإسكندرية والبرغموت المنعش مع ماء الصبار المرطب والمسك الحريري، ليدوم شذاه طوال اليوم دون أن يثقل الشعر أو يجفف البشرة.',
    family: 'floral',
    family_en: 'Fresh Citrus & White Musk',
    family_ar: 'حمضيات منعشة ومسك أبيض نقي',
    concentration: 'Brume Parfumée & Cheveux (15%)',
    gender_vibe: 'Unisex',
    longevity: 8,
    sillage: 7,
    intensity: 7,
    top_notes_en: ['Alexandrian Neroli', 'Italian Green Bergamot', 'Sea Salt Breeze'],
    top_notes_ar: ['نيرولي سكندري', 'برغموت إيطالي أخضر', 'نسيم البحر المتوسط'],
    heart_notes_en: ['Orange Blossom Water', 'White Freesia', 'Hydrating Aloe Vera'],
    heart_notes_ar: ['ماء زهر البرتقال', 'فريزيا بيضاء', 'خلاصة الصبار المرطبة'],
    base_notes_en: ['Sheer Cashmere Musk', 'White Ambergris', 'Cedar Silk'],
    base_notes_ar: ['مسك كشميري نقي', 'عنبر أبيض شفاف', 'حرير الأرز'],
    callout_top: { en: 'Continuous Ultra-Fine Micro-Mist Nozzle', ar: 'رذاذ دقيق فائق النعومة والانتشار' },
    callout_cap: { en: 'Matte Noir Cap with Engraved Crown', ar: 'غطاء أسود مطفي محفور بتاج لوفينوس' },
    callout_seal: { en: 'Atelier Botanical Seal', ar: 'ختم النقاء النباتي المعتمد' },
    variants: [
      {
        id: 801,
        name_en: '150 ml Body & Hair Mist Spray',
        name_ar: '١٥٠ مل رذاذ فاخر للجسم والشعر',
        size_ml: 150,
        price: 950,
        compare_at_price: 1250,
        sku: 'LV-MIST-150',
        stock: 35,
        is_default: true,
      },
    ],
    images: {
      hero: '/images/products/brume-botanique-bottle.jpg',
      bottle: '/images/products/brume-botanique-bottle.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/brand/NEW_brand-identity.png',
      texture: '/images/brand/brand-identity.jpg',
    },
    reviews: [
      {
        id: 81,
        name: 'مريم الألفي',
        rating: 5,
        date: '2026-11-14',
        body_en: 'The mist is divine! The spray is ultra-fine and the neroli musk scent stays in my hair for over 24 hours without feeling heavy.',
        body_ar: 'البدي اسبلاش يجنن! رذاذه ناعم جداً وثباته في الشعر فوق الـ ٢٤ ساعة، ريحة نظافة وفخامة مش طبيعية وخفيف جداً على البشرة.',
      },
      {
        id: 82,
        name: 'طارق الدسوقي',
        rating: 5,
        date: '2026-11-13',
        body_en: 'Perfect post-shower mist. Fresh, crisp, and exceptionally sophisticated.',
        body_ar: 'ممتاز بعد الشاور، إحساس انتعاش ونظافة راقي ومختلف عن أي سبلاش تجاري.',
      },
    ],
    accent_gradient: 'from-[#EEF5F6] via-[#DAEAED] to-[#B0D2D9]',
    featured_on_home: true,
    home_order: 5,
  },
];

// In-Memory & LocalStorage Persisted Catalog Store
const STORAGE_KEY = 'lvenus_custom_catalog';
const CATEGORIES_KEY = 'lvenus_custom_categories';
const DELETED_PRODUCTS_KEY = 'lvenus_deleted_products';
const DELETED_CATEGORIES_KEY = 'lvenus_deleted_categories';

export function getStoredCategories(): MaisonCategory[] {
  if (typeof window === 'undefined') return MAISON_CATEGORIES;
  try {
    let deletedSlugs = new Set<string>();
    try {
      const dRaw = localStorage.getItem(DELETED_CATEGORIES_KEY);
      if (dRaw) deletedSlugs = new Set(JSON.parse(dRaw));
    } catch {}

    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) return MAISON_CATEGORIES.filter((c) => !deletedSlugs.has(c.slug));
    const parsed: MaisonCategory[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return MAISON_CATEGORIES.filter((c) => !deletedSlugs.has(c.slug));
    }
    // Ensure all canonical categories exist unless explicitly deleted
    const existingSlugs = new Set(parsed.map((c) => c.slug));
    const merged = parsed.filter((c) => !deletedSlugs.has(c.slug));
    for (const c of MAISON_CATEGORIES) {
      if (!existingSlugs.has(c.slug) && !deletedSlugs.has(c.slug)) {
        merged.push(c);
      }
    }
    return merged;
  } catch {
    return MAISON_CATEGORIES;
  }
}

export function saveCategory(category: MaisonCategory): MaisonCategory[] {
  if (typeof window === 'undefined') return MAISON_CATEGORIES;
  const current = getStoredCategories();
  const existingIdx = current.findIndex((c) => c.slug === category.slug);
  let updated: MaisonCategory[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = category;
  } else {
    updated = [...current, category];
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));

  // If was previously marked deleted, unmark it
  try {
    const dRaw = localStorage.getItem(DELETED_CATEGORIES_KEY);
    if (dRaw) {
      const deleted: string[] = JSON.parse(dRaw);
      const filtered = deleted.filter((s) => s !== category.slug);
      localStorage.setItem(DELETED_CATEGORIES_KEY, JSON.stringify(filtered));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('lv_categories_updated', { detail: updated }));
  return updated;
}

export function deleteCategoryFromStorage(slug: string): MaisonCategory[] {
  if (typeof window === 'undefined') return MAISON_CATEGORIES;
  const current = getStoredCategories();
  const updated = current.filter((c) => c.slug !== slug && c.id !== slug);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));

  try {
    const dRaw = localStorage.getItem(DELETED_CATEGORIES_KEY);
    const deleted: string[] = dRaw ? JSON.parse(dRaw) : [];
    if (!deleted.includes(slug)) {
      deleted.push(slug);
      localStorage.setItem(DELETED_CATEGORIES_KEY, JSON.stringify(deleted));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('lv_categories_updated', { detail: updated }));
  return updated;
}

export function getStoredCatalog(includeHidden: boolean = false): PerfumeData[] {
  if (typeof window === 'undefined') {
    return includeHidden ? CANONICAL_PERFUMES : CANONICAL_PERFUMES.filter((p) => p.is_hidden !== true);
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let deletedIds = new Set<number>();
    try {
      const dRaw = localStorage.getItem(DELETED_PRODUCTS_KEY);
      if (dRaw) deletedIds = new Set(JSON.parse(dRaw));
    } catch {}

    const filterList = (list: PerfumeData[]) => {
      let res = list.filter((p) => !deletedIds.has(p.id));
      if (!includeHidden) {
        res = res.filter((p) => p.is_hidden !== true);
      }
      return res;
    };

    if (!raw) {
      return filterList(CANONICAL_PERFUMES);
    }

    const parsed: PerfumeData[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return filterList(CANONICAL_PERFUMES);
    }

    // Merge: keep custom edits, ensure new canonical items are available unless deleted
    const existingSlugs = new Set(parsed.map((p) => p.slug));
    const merged = [...parsed];

    for (const c of CANONICAL_PERFUMES) {
      if (!existingSlugs.has(c.slug) && !deletedIds.has(c.id)) {
        merged.push(c);
      }
    }

    return filterList(merged);
  } catch {
    return includeHidden ? CANONICAL_PERFUMES : CANONICAL_PERFUMES.filter((p) => p.is_hidden !== true);
  }
}

export function saveProductToCatalog(product: PerfumeData): PerfumeData[] {
  if (typeof window === 'undefined') return CANONICAL_PERFUMES;
  const current = getStoredCatalog(true);
  const existingIdx = current.findIndex((p) => p.id === product.id || p.slug === product.slug);
  let updated: PerfumeData[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = product;
  } else {
    updated = [product, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('lv_catalog_updated', { detail: updated }));
  return updated;
}

export function deleteProductFromCatalog(id: number): PerfumeData[] {
  if (typeof window === 'undefined') return CANONICAL_PERFUMES;
  const current = getStoredCatalog(true);
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  try {
    const dRaw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    const deleted: number[] = dRaw ? JSON.parse(dRaw) : [];
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('lv_catalog_updated', { detail: updated }));
  return updated;
}

export function addProductReview(
  slug: string,
  review: { name: string; rating: number; body_ar: string; body_en: string }
): PerfumeData | null {
  const catalog = getStoredCatalog(true);
  const product = catalog.find((p) => p.slug === slug);
  if (!product) return null;

  const newReview = {
    id: Date.now(),
    name: review.name,
    rating: review.rating,
    date: new Date().toISOString().split('T')[0],
    body_en: review.body_en,
    body_ar: review.body_ar,
  };

  const updatedProduct = {
    ...product,
    reviews: [newReview, ...(product.reviews || [])],
  };

  saveProductToCatalog(updatedProduct);
  return updatedProduct;
}

export function deleteProductReview(slug: string, reviewId: number): PerfumeData | null {
  const catalog = getStoredCatalog(true);
  const product = catalog.find((p) => p.slug === slug);
  if (!product) return null;

  const updatedProduct = {
    ...product,
    reviews: (product.reviews || []).filter((r) => r.id !== reviewId),
  };

  saveProductToCatalog(updatedProduct);
  return updatedProduct;
}

// Backward-compatibility export
export const PERFUMES = CANONICAL_PERFUMES;

export function getPerfumeBySlug(slug: string, includeHidden: boolean = false): PerfumeData | undefined {
  const catalog = typeof window !== 'undefined' ? getStoredCatalog(includeHidden) : CANONICAL_PERFUMES;
  const found = catalog.find((p) => p.slug === slug);
  if (found && !includeHidden && found.is_hidden === true) {
    return undefined;
  }
  return found;
}

export function getOtherPerfumes(currentSlug: string): PerfumeData[] {
  const catalog = typeof window !== 'undefined' ? getStoredCatalog(false) : CANONICAL_PERFUMES.filter((p) => p.is_hidden !== true);
  return catalog.filter((p) => p.slug !== currentSlug && p.is_hidden !== true);
}
