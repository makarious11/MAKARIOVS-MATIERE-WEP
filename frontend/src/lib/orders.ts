// ============================================================
// L'VENUS — Client Orders & Notifications Store
// "MAISON DE PARFUM — LE CAIRE · PARIS"
// ============================================================

import { normalizePhone } from './patronAuth';

export interface MaisonOrderItem {
  product_id?: number;
  product_slug?: string;
  name_en: string;
  name_ar?: string;
  size_ml: number;
  price: number;
  quantity: number;
  image?: string;
}

export interface MaisonOrder {
  id: string; // e.g. "LV-849201"
  customer: string;
  phone: string;
  gov: string;
  items: string;
  items_detail?: MaisonOrderItem[];
  map_url?: string;
  map_coords?: { lat: number; lng: number };
  total: number;
  payment: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  is_new?: boolean;
}

// Baseline client orders empty to avoid leaking PII or inflating analytics
export const BASELINE_ADMIN_ORDERS: MaisonOrder[] = [];

const STORAGE_KEY = 'lv_client_orders';

const STATUS_OVERRIDES_KEY = 'lv_status_overrides';

const DELETED_ORDERS_KEY = 'lv_deleted_orders';

export function getDeletedOrderIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStatusOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Returns strictly the real orders created in this browser/session.
 * Never leaks other patrons or admin mock orders.
 */
export function getRealClientOrders(): MaisonOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const overrides = getStatusOverrides();
    const deletedIds = new Set(getDeletedOrderIds());
    if (!raw) return [];
    const parsed: MaisonOrder[] = JSON.parse(raw);
    const baselineIds = new Set(BASELINE_ADMIN_ORDERS.map((b) => b.id));
    return parsed
      .filter((o) => !baselineIds.has(o.id) && !deletedIds.has(o.id))
      .map((o) => (overrides[o.id] ? { ...o, status: overrides[o.id] as any } : o));
  } catch (err) {
    console.error('Error reading real client orders', err);
    return [];
  }
}

/**
 * Returns orders belonging strictly to the specified patron.
 */
export function getPatronOrders(patronPhone?: string, patronName?: string): MaisonOrder[] {
  const allReal = getRealClientOrders();
  if (!patronPhone && !patronName) {
    return allReal;
  }

  const normPhone = patronPhone ? normalizePhone(patronPhone) : '';
  const cleanName = patronName ? patronName.trim().toLowerCase() : '';

  return allReal.filter((o) => {
    const orderPhone = normalizePhone(o.phone);
    const orderName = (o.customer || '').trim().toLowerCase();

    if (normPhone && orderPhone && (orderPhone === normPhone || orderPhone.includes(normPhone) || normPhone.includes(orderPhone))) {
      return true;
    }
    if (cleanName && orderName && (orderName === cleanName || orderName.includes(cleanName) || cleanName.includes(orderName))) {
      return true;
    }
    return false;
  });
}

/**
 * Admin view: Combines real client orders with the Maison demo baseline orders.
 */
export function getAllOrdersForAdmin(): MaisonOrder[] {
  if (typeof window === 'undefined') return BASELINE_ADMIN_ORDERS;
  const overrides = getStatusOverrides();
  const deletedIds = new Set(getDeletedOrderIds());
  const realOrders = getRealClientOrders();
  const knownIds = new Set<string>(realOrders.map((o) => o.id));
  const merged = [...realOrders];

  for (const b of BASELINE_ADMIN_ORDERS) {
    if (!knownIds.has(b.id) && !deletedIds.has(b.id)) {
      knownIds.add(b.id);
      merged.push(overrides[b.id] ? { ...b, status: overrides[b.id] as any } : b);
    }
  }
  return merged;
}

// Backward compatible alias for admin
export const getStoredOrders = getAllOrdersForAdmin;

export function deleteOrderFromStorage(orderId: string): MaisonOrder[] {
  if (typeof window === 'undefined') return getAllOrdersForAdmin();
  try {
    // 1. Mark in deleted IDs so baseline or real orders never reappear
    const deleted = getDeletedOrderIds();
    if (!deleted.includes(orderId)) {
      deleted.push(orderId);
      localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(deleted));
    }

    // 2. Filter from real orders storage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: MaisonOrder[] = JSON.parse(raw);
      const remaining = parsed.filter((o) => o.id !== orderId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    }

    // 3. Clean up status overrides
    const overrides = getStatusOverrides();
    if (overrides[orderId]) {
      delete overrides[orderId];
      localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));
    }

    // 4. Dispatch event so UI updates immediately
    window.dispatchEvent(new CustomEvent('lv_order_deleted', { detail: { id: orderId } }));

    return getAllOrdersForAdmin();
  } catch (err) {
    console.error('Error deleting order from storage', err);
    return getAllOrdersForAdmin();
  }
}

export function saveNewOrderToStorage(order: MaisonOrder): MaisonOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRealClientOrders();
    const updated = [order, ...current.filter((o) => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for reactive updates
    window.dispatchEvent(new CustomEvent('lv_order_created', { detail: order }));
    return updated;
  } catch (err) {
    console.error('Error saving order to localStorage', err);
    return [];
  }
}

export function updateOrderStatusInStorage(orderId: string, newStatus: string): MaisonOrder[] {
  if (typeof window === 'undefined') return getAllOrdersForAdmin();
  try {
    // 1. Save in status overrides so both real and baseline orders persist status change
    const overrides = getStatusOverrides();
    overrides[orderId] = newStatus;
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(overrides));

    // 2. Update real orders if present
    const current = getRealClientOrders();
    const updated = current.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 3. Dispatch reactive event so tracking page updates instantly in real-time
    window.dispatchEvent(new CustomEvent('lv_order_status_updated', { detail: { id: orderId, status: newStatus } }));

    return getAllOrdersForAdmin();
  } catch (err) {
    console.error('Error updating order status', err);
    return getAllOrdersForAdmin();
  }
}

export function markAllOrdersAsRead(): MaisonOrder[] {
  if (typeof window === 'undefined') return getAllOrdersForAdmin();
  try {
    const current = getRealClientOrders();
    const updated = current.map((o) => ({ ...o, is_new: false }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return getAllOrdersForAdmin();
  } catch (err) {
    console.error('Error marking orders as read', err);
    return getAllOrdersForAdmin();
  }
}

/**
 * Luxury Web Audio Chime for real-time notifications
 */
export function playLuxuryChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.9);
  } catch {
    // policy without gesture
  }
}
