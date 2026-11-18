// ============================================================
// L'VENUS — Persistent Server Database (JSON Storage Engine)
// "MAISON DE PARFUM — LE CAIRE · PARIS"
// Guarantees persistence across server restarts, reboots & devices.
// ============================================================

import fs from 'fs';
import path from 'path';
import { CANONICAL_PERFUMES, MAISON_CATEGORIES, PerfumeData, MaisonCategory } from './catalog';
import { INITIAL_PATRONS, PatronProfile } from './patronAuth';
import { MaisonOrder } from './orders';

function getDataDir(): string {
  // If running inside frontend/
  if (fs.existsSync(path.join(process.cwd(), 'src'))) {
    const d = path.join(process.cwd(), 'data');
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    return d;
  }
  // If running from root directory
  const dInFrontend = path.join(process.cwd(), 'frontend', 'data');
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    if (!fs.existsSync(dInFrontend)) fs.mkdirSync(dInFrontend, { recursive: true });
    return dInFrontend;
  }
  const rootD = path.join(process.cwd(), 'data');
  if (!fs.existsSync(rootD)) fs.mkdirSync(rootD, { recursive: true });
  return rootD;
}

const CATALOG_FILE = () => path.join(getDataDir(), 'catalog.json');
const CATEGORIES_FILE = () => path.join(getDataDir(), 'categories.json');
const ORDERS_FILE = () => path.join(getDataDir(), 'orders.json');
const PATRONS_FILE = () => path.join(getDataDir(), 'patrons.json');
const REVIEWS_FILE = () => path.join(getDataDir(), 'reviews.json');

// --- Helper Functions ---
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// ==========================================
// 1. Catalog & Products Persistence
// ==========================================
export function getServerCatalog(): PerfumeData[] {
  return readJsonFile<PerfumeData[]>(CATALOG_FILE(), CANONICAL_PERFUMES);
}

export function saveServerProduct(product: PerfumeData): PerfumeData[] {
  const current = getServerCatalog();
  const idx = current.findIndex((p) => p.id === product.id || p.slug === product.slug);
  let updated: PerfumeData[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = product;
  } else {
    updated = [product, ...current];
  }
  writeJsonFile(CATALOG_FILE(), updated);
  return updated;
}

export function deleteServerProduct(id: number): PerfumeData[] {
  const current = getServerCatalog();
  const updated = current.filter((p) => p.id !== id);
  writeJsonFile(CATALOG_FILE(), updated);
  return updated;
}

export function getServerProductBySlug(slug: string): PerfumeData | undefined {
  const catalog = getServerCatalog();
  return catalog.find((p) => p.slug === slug);
}

// ==========================================
// 2. Reviews Persistence
// ==========================================
export interface ServerReview {
  id: number;
  product_slug: string;
  product_id?: number | string;
  name: string;
  rating: number;
  body_en: string;
  body_ar: string;
  date: string;
}

export function getServerReviews(productSlug?: string): ServerReview[] {
  const all = readJsonFile<ServerReview[]>(REVIEWS_FILE(), []);
  if (productSlug) {
    return all.filter((r) => r.product_slug === productSlug);
  }
  return all;
}

export function addServerReview(
  slug: string,
  review: { name: string; rating: number; body_ar: string; body_en: string; product_id?: number | string }
): { product: PerfumeData | null; review: ServerReview } {
  const catalog = getServerCatalog();
  const prodIdx = catalog.findIndex((p) => p.slug === slug || (review.product_id && p.id === review.product_id));
  
  const newRev: ServerReview = {
    id: Date.now(),
    product_slug: slug,
    product_id: review.product_id || (prodIdx >= 0 ? catalog[prodIdx].id : undefined),
    name: review.name.trim(),
    rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
    date: new Date().toISOString().split('T')[0],
    body_en: review.body_en.trim(),
    body_ar: review.body_ar.trim(),
  };

  // 1. Save to reviews.json
  const allReviews = getServerReviews();
  allReviews.unshift(newRev);
  writeJsonFile(REVIEWS_FILE(), allReviews);

  // 2. Attach to product in catalog.json
  let updatedProduct: PerfumeData | null = null;
  if (prodIdx >= 0) {
    const prod = catalog[prodIdx];
    prod.reviews = [newRev, ...(prod.reviews || [])];
    catalog[prodIdx] = prod;
    writeJsonFile(CATALOG_FILE(), catalog);
    updatedProduct = prod;
  }

  return { product: updatedProduct, review: newRev };
}

export function deleteServerReview(slug: string, reviewId: number): PerfumeData | null {
  // 1. Remove from reviews.json
  const allReviews = getServerReviews().filter((r) => r.id !== reviewId);
  writeJsonFile(REVIEWS_FILE(), allReviews);

  // 2. Remove from product in catalog.json
  const catalog = getServerCatalog();
  const prodIdx = catalog.findIndex((p) => p.slug === slug);
  if (prodIdx >= 0) {
    const prod = catalog[prodIdx];
    prod.reviews = (prod.reviews || []).filter((r) => r.id !== reviewId);
    catalog[prodIdx] = prod;
    writeJsonFile(CATALOG_FILE(), catalog);
    return prod;
  }
  return null;
}

// ==========================================
// 3. Orders Persistence
// ==========================================
export function getServerOrders(): MaisonOrder[] {
  return readJsonFile<MaisonOrder[]>(ORDERS_FILE(), []);
}

export function saveServerOrder(order: MaisonOrder): MaisonOrder[] {
  const current = getServerOrders();
  const idx = current.findIndex((o) => o.id === order.id);
  let updated: MaisonOrder[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = order;
  } else {
    updated = [order, ...current];
  }
  writeJsonFile(ORDERS_FILE(), updated);
  return updated;
}

export function updateServerOrderStatus(orderId: string, status: MaisonOrder['status']): MaisonOrder[] {
  const current = getServerOrders();
  const updated = current.map((o) => (o.id === orderId ? { ...o, status } : o));
  writeJsonFile(ORDERS_FILE(), updated);
  return updated;
}

export function deleteServerOrder(orderId: string): MaisonOrder[] {
  const current = getServerOrders();
  const updated = current.filter((o) => o.id !== orderId);
  writeJsonFile(ORDERS_FILE(), updated);
  return updated;
}

// ==========================================
// 4. Patrons / Customers Persistence
// ==========================================
export function getServerPatrons(): PatronProfile[] {
  return readJsonFile<PatronProfile[]>(PATRONS_FILE(), INITIAL_PATRONS);
}

export function saveServerPatron(profile: PatronProfile): PatronProfile[] {
  const current = getServerPatrons();
  const normPhone = profile.phone.replace(/\D/g, '');
  const idx = current.findIndex(
    (p) =>
      (normPhone && p.phone.replace(/\D/g, '') === normPhone) ||
      (profile.email && p.email && profile.email.toLowerCase() === p.email.toLowerCase())
  );

  let updated: PatronProfile[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...updated[idx], ...profile };
  } else {
    updated = [profile, ...current];
  }
  writeJsonFile(PATRONS_FILE(), updated);
  return updated;
}

// ==========================================
// 5. Categories Persistence
// ==========================================
export function getServerCategories(): MaisonCategory[] {
  return readJsonFile<MaisonCategory[]>(CATEGORIES_FILE(), MAISON_CATEGORIES);
}

export function saveServerCategory(cat: MaisonCategory): MaisonCategory[] {
  const current = getServerCategories();
  const idx = current.findIndex((c) => c.id === cat.id || c.slug === cat.slug);
  let updated: MaisonCategory[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = cat;
  } else {
    updated = [...current, cat];
  }
  writeJsonFile(CATEGORIES_FILE(), updated);
  return updated;
}
