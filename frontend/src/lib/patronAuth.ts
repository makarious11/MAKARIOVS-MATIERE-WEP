// ============================================================
// L'VENUS — Patron Authentication & Sanctum Profile
// "MAISON DE PARFUM — LE CAIRE · PARIS"
// ============================================================

export interface PatronProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  governorate?: string;
  city?: string;
  address?: string;
  registeredAt: string;
}

export interface PatronWithStats extends PatronProfile {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  recentItems: string[];
  orders: string[];
}

const PATRON_SESSION_KEY = 'lv_patron_session';
const PATRONS_REGISTRY_KEY = 'lv_patrons_registry';

// Never bundle patron PII inside public client JavaScript
export const INITIAL_PATRONS: PatronProfile[] = [];

// Clean Egyptian phone numbers to canonical comparison format (e.g. 01012345678)
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('20') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  if (digits.startsWith('0020') && digits.length === 14) {
    return '0' + digits.slice(4);
  }
  if (digits.length === 10 && /^1[0125]/.test(digits)) {
    return '0' + digits;
  }
  return digits;
}

export function isPhoneAlreadyRegistered(rawPhone: string): boolean {
  if (!rawPhone) return false;
  const norm = normalizePhone(rawPhone);
  if (!norm || norm.length < 8) return false;
  const registry = getPatronsRegistry();
  return registry.some((p) => normalizePhone(p.phone) === norm);
}

export function getPatronsRegistry(): PatronProfile[] {
  if (typeof window === 'undefined') return INITIAL_PATRONS;
  try {
    const raw = localStorage.getItem(PATRONS_REGISTRY_KEY);
    if (!raw) {
      localStorage.setItem(PATRONS_REGISTRY_KEY, JSON.stringify(INITIAL_PATRONS));
      return INITIAL_PATRONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PATRONS;
  } catch {
    return INITIAL_PATRONS;
  }
}

export function savePatronToRegistry(profile: PatronProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getPatronsRegistry();
    const normPhone = normalizePhone(profile.phone);
    const existingIdx = list.findIndex(
      (p) => normalizePhone(p.phone) === normPhone || (p.email && profile.email && p.email.toLowerCase() === profile.email.toLowerCase())
    );

    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...profile };
    } else {
      list.push(profile);
    }
    localStorage.setItem(PATRONS_REGISTRY_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving patron to registry', e);
  }
}

export function getCurrentPatron(): PatronProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PATRON_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentPatron(profile: PatronProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!profile) {
      localStorage.removeItem(PATRON_SESSION_KEY);
    } else {
      localStorage.setItem(PATRON_SESSION_KEY, JSON.stringify(profile));
      savePatronToRegistry(profile);
    }
    window.dispatchEvent(new CustomEvent('lv_patron_auth_changed', { detail: profile }));
  } catch (e) {
    console.error('Error setting patron session', e);
  }
}

export function loginPatron(identifier: string, nameFallback?: string): { success: boolean; patron?: PatronProfile; error?: string } {
  if (!identifier || identifier.trim().length < 3) {
    return { success: false, error: 'Please enter a valid phone number or email' };
  }

  const clean = identifier.trim();
  const isPhone = /\d/.test(clean);
  const norm = isPhone ? normalizePhone(clean) : clean.toLowerCase();

  const registry = getPatronsRegistry();
  let found = registry.find((p) => {
    if (isPhone) {
      return normalizePhone(p.phone) === norm;
    }
    return p.email?.toLowerCase() === norm;
  });

  if (!found) {
    // If logging in for the first time with their mobile or email, initialize patron profile
    found = {
      id: `patron_${Date.now()}`,
      name: nameFallback?.trim() || (isPhone ? `Patron ${norm.slice(-4)}` : clean.split('@')[0]),
      phone: isPhone ? norm : '',
      email: isPhone ? '' : clean,
      registeredAt: new Date().getFullYear().toString(),
    };
    savePatronToRegistry(found);
  }

  setCurrentPatron(found);
  return { success: true, patron: found };
}

export function registerPatron(params: {
  name: string;
  phone: string;
  email?: string;
  governorate?: string;
  city?: string;
  address?: string;
  allowExisting?: boolean;
}): { success: boolean; patron?: PatronProfile; error?: string; alreadyRegistered?: boolean } {
  if (!params.name.trim() || params.name.trim().length < 2) {
    return { success: false, error: 'Full name is required (minimum 2 characters)' };
  }
  if (!params.phone.trim() || params.phone.trim().length < 8) {
    return { success: false, error: 'Valid Egyptian mobile number is required' };
  }

  const normPhone = normalizePhone(params.phone);
  const registry = getPatronsRegistry();
  const existing = registry.find((p) => normalizePhone(p.phone) === normPhone);

  if (existing) {
    if (!params.allowExisting) {
      // Explicit registration blocks duplicate phone accounts
      return {
        success: false,
        alreadyRegistered: true,
        error: 'هذا الرقم مسجل بالفعل في سجلات الدار. لا يمكن إنشاء حسابين بنفس الرقم، يرجى تسجيل الدخول.',
      };
    }

    // Checkout: Seamlessly merge/update patron info and link orders
    const merged: PatronProfile = {
      ...existing,
      name: params.name.trim() || existing.name,
      email: params.email?.trim() || existing.email,
      governorate: params.governorate || existing.governorate,
      city: params.city || existing.city,
      address: params.address || existing.address,
    };
    setCurrentPatron(merged);
    return { success: true, patron: merged };
  }

  const newProfile: PatronProfile = {
    id: `patron_${Date.now()}`,
    name: params.name.trim(),
    phone: normPhone,
    email: params.email?.trim() || '',
    governorate: params.governorate || 'Cairo',
    city: params.city || 'Zamalek',
    address: params.address || '',
    registeredAt: new Date().getFullYear().toString(),
  };

  setCurrentPatron(newProfile);
  return { success: true, patron: newProfile };
}

export function logoutPatron(): void {
  setCurrentPatron(null);
}

export function getAllPatronsWithStats(
  orders: Array<{ id: string; customer: string; phone: string; gov: string; items: string; total: number; date: string }>
): PatronWithStats[] {
  const registry = getPatronsRegistry();
  const patronMap = new Map<string, PatronWithStats>();

  for (const reg of registry) {
    const key = normalizePhone(reg.phone) || reg.email?.toLowerCase() || reg.name.toLowerCase();
    patronMap.set(key, {
      ...reg,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: '',
      recentItems: [],
      orders: [],
    });
  }

  for (const o of orders) {
    const key = normalizePhone(o.phone) || o.customer.toLowerCase();
    let entry = patronMap.get(key);
    if (!entry) {
      entry = {
        id: `client_${key}`,
        name: o.customer,
        phone: o.phone,
        email: '',
        governorate: o.gov,
        city: '',
        address: o.gov,
        registeredAt: '2026',
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: '',
        recentItems: [],
        orders: [],
      };
      patronMap.set(key, entry);
    }

    entry.totalOrders += 1;
    entry.totalSpent += o.total || 0;
    if (!entry.lastOrderDate) entry.lastOrderDate = o.date;
    if (o.items && !entry.recentItems.includes(o.items)) {
      entry.recentItems.push(o.items);
    }
    if (!entry.orders.includes(o.id)) {
      entry.orders.push(o.id);
    }
  }

  return Array.from(patronMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

