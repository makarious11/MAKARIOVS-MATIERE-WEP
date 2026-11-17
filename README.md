# L’VENUS — Maison de Parfum | Le Caire · Paris
### Luxury Perfume E-Commerce Platform

> **"Extrait de Parfum — Crafted by Makarious"**  
> An uncompromising digital flagship reflecting Greco-Roman botanical alchemy, Parisian elegance, and Egyptian heritage.

---

## 1. Brand Identity & Asset Mapping

The maison is branded as **L’VENUS** (Arabic: `لفينوس`), rooted in the classical mythos of Venus and ancient Egyptian apothecary traditions:
- **`VINUS_LOSO` (`/brand/VINUS_LOSO.svg`)**: Primary navbar logo icon, favicon, and header branding beside `L’VENUS` text.
- **`Statue` (`/brand/Statue.svg`)**: Classical Venus sculpture head engraving, utilized for page loading stroke animations and custom cursor product states.
- **`Snake` (`/brand/Snake.svg`)**: Sinuous serpent engraving used as mystical section dividers, footer accents, and background watermarks.
- **`Side_profile` (`/brand/Side_profile.svg`)**: Classical torso & laurel branch line-art used as a vertical editorial column in the Brand Story strip and `/story` page.
- **`FULL_LOGO` & `NEW_brand-identity`**: Layout and proportion reference for typography and burgundy wax seal placement.
- **Wax Seal**: Burgundy red wax seal (`#6B1D2F`) embossed with the classical Venus face relief.

---

## 2. Design System & Tokens

- `--paper`: `#FDFBF7` (warm cream background)
- `--paper-2`: `#F1EADA` (cards, arches, secondary panels)
- `--ink`: `#14110F` (deep text, collection dark sections, footer)
- `--ink-soft`: `#3A332D`
- `--wax`: `#6B1D2F` (burgundy primary accent, CTA hover, wax seal stamp)
- `--gold`: `#B08D57` (1px hairlines, stars, celestial accents)

Typography:
- **Display Headings**: Cormorant Garamond / Playfair Display
- **Script Taglines**: Pinyon Script / Italianno
- **Body Text**: EB Garamond / Jost
- **Arabic Typography**: Noto Naskh Arabic & Amiri (Display), IBM Plex Sans Arabic (Body) with full RTL support

---

## 3. Project Architecture

```
MAKARIOVS-MATIÈRE-WEP/
├── frontend/                   ← Next.js 15 (App Router, TypeScript, Tailwind CSS, Framer Motion)
│   ├── public/
│   │   ├── brand/              ← SVG brand assets (VINUS_LOSO, Statue, Snake, Side_profile)
│   │   └── images/             ← Product photography & packaging mockups
│   ├── src/
│   │   ├── app/                ← Pages (Home, Shop, Product, Cart, Checkout, Success, Story, Contact)
│   │   ├── components/         ← UI, Layout, Product, Checkout, and Home interactive sections
│   │   ├── lib/                ← catalog.ts (4 Extraits), constants.ts, fonts.ts, api.ts
│   │   ├── store/              ← Zustand cartStore (persisted as lv_cart) & uiStore
│   │   └── styles/             ← globals.css with design tokens & paper grain overlay
│
├── backend/                    ← Laravel 11 REST API + Filament v3 Admin Panel
│   ├── app/
│   │   ├── Filament/Resources/ ← Admin management for Products, Orders, Reviews
│   │   ├── Http/Controllers/   ← V1 Controllers (Order, Product, Coupon, Shipping, Payment)
│   │   └── Models/             ← Eloquent models (Product, Order, Coupon, ShippingZone)
│   ├── database/seeders/       ← Seeders for 4 canonical Extraits, 27 Egyptian governorates, admin
│   └── routes/api.php          ← Versioned REST API endpoints (/api/v1/...)
```

---

## 4. Canonical 4-Perfume Collection

1. **La Fleur du Nil** (`la-fleur-du-nil`) — *Floral Botanical (32% Extrait)*
   - Egyptian Poppy, Wild Cornflower, White Peony, Jasmine Sambac, Sandalwood.
   - SKUs: `LV-FN-30`, `LV-FN-50`, `LV-FN-100`.
2. **Ambre d’Alexandrie** (`ambre-dalexandrie`) — *Warm Resinous Amber (35% Extrait)*
   - Alexandrian Sea Salt, Spiced Cinnamon, Golden Amber, Siam Benzoin, Smoked Vanilla.
   - SKUs: `LV-AA-30`, `LV-AA-50`, `LV-AA-100`.
3. **Bois de Louxor** (`bois-de-louxor`) — *Sacred Temple Woods (34% Extrait)*
   - Green Cardamom, Dried Papyrus, Sacred Cedar of Lebanon, Frankincense Tears.
   - SKUs: `LV-BL-30`, `LV-BL-50`, `LV-BL-100`.
4. **Al Oud Al Aswad** (`al-oud-al-aswad`) — *Oud & Sacred Spice (38% Extrait)*
   - Persian Saffron, Wild Cambodian Oud, Sacred Myrrh, Dark Leather, Black Musk.
   - SKUs: `LV-OA-30`, `LV-OA-50`, `LV-OA-100`.

---

## 5. Execution & Run Instructions

### 5.1 Frontend (Next.js 15)
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000` (or `http://localhost:3000/ar` for Arabic).

### 5.2 Frontend Production Build & Verification
```bash
cd frontend
npm run build
```

### 5.3 Backend (Laravel 11)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
Admin Panel credentials:
- **URL**: `http://localhost:8000/admin`
- **Email**: `admin@lvenus.test`
- **Password**: `password`

Default Promo Codes:
- `LVENUS10` / `VENUS10`: 10% off entire order
- `MAISON20`: 20% off orders over 3,000 EGP
- `EXTRAIT500`: 500 EGP deduction
