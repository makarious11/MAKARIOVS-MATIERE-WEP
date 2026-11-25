'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Package,
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  CheckCircle2,
  Clock,
  Truck,
  Tag,
  ShieldCheck,
  Shield,
  ShieldAlert,
  Ban,
  Search,
  Plus,
  ArrowUpRight,
  Filter,
  Edit2,
  Trash2,
  X,
  Layers,
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Sliders,
  DollarSign,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  MessageCircle,
  AlertCircle,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkle,
} from 'lucide-react';
import {
  MaisonOrder,
  getStoredOrders,
  updateOrderStatusInStorage,
  deleteOrderFromStorage,
  markAllOrdersAsRead,
  playLuxuryChime,
} from '@/lib/orders';
import {
  CANONICAL_PERFUMES,
  MAISON_CATEGORIES,
  PerfumeData,
  ProductVariant,
  MaisonCategory,
  getStoredCatalog,
  saveProductToCatalog,
  deleteProductFromCatalog,
  getStoredCategories,
  saveCategory,
  deleteCategoryFromStorage,
  addProductReview,
  deleteProductReview,
} from '@/lib/catalog';
import {
  getAllPatronsWithStats,
  normalizePhone,
  PatronWithStats,
} from '@/lib/patronAuth';
import { WaxSeal } from '@/components/ui/WaxSeal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AdminDashboardPage() {
  const pathname = usePathname();
  const isArabic = Boolean(pathname?.startsWith('/ar'));

  // Security Authentication Gate (Cryptographic HttpOnly Session via Server)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Security Center State
  const [securityData, setSecurityData] = useState<{
    configured: boolean;
    hasCustomRotatedKey: boolean;
    sessionEpoch: number;
    blockedIps: string[];
    activeLockouts: Array<{ ip: string; attempts: number; unlocksInMinutes: number }>;
    logs: Array<{
      id: string;
      timestamp: string;
      severity: 'info' | 'warning' | 'critical';
      event: string;
      ip: string;
      path: string;
      details: string;
    }>;
  } | null>(null);
  const [currentKeyInput, setCurrentKeyInput] = useState('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [confirmNewKeyInput, setConfirmNewKeyInput] = useState('');
  const [keyChangeMsg, setKeyChangeMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [ipBlockInput, setIpBlockInput] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/v1/admin/auth')
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        setIsAuthenticated(Boolean(json?.authenticated));
      })
      .catch(() => {
        if (active) setIsAuthenticated(false);
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmitting) return;
    setAuthSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/v1/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data?.authenticated) {
        setErrorMsg(
          isArabic
            ? data?.message_ar || data?.message || 'مفتاح المرور غير صحيح — الوصول مقيد لمديري دار لوفينوس فقط'
            : data?.message || 'Invalid Master Key — Access strictly restricted to Maison Directors'
        );
      } else {
        setIsAuthenticated(true);
        setPasscode('');
        setErrorMsg('');
      }
    } catch {
      setErrorMsg(
        isArabic ? 'تعذر الاتصال بخادم التحقق الأمني' : 'Could not verify credentials with security server'
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/admin/auth', { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
    setPasscode('');
    setSecurityData(null);
  };

  const [activeTab, setActiveTab] = useState<
    'products' | 'categories' | 'orders' | 'patrons' | 'coupons' | 'overview' | 'security'
  >('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Catalog & Categories State (Persisted)
  const [products, setProducts] = useState<PerfumeData[]>(CANONICAL_PERFUMES);
  const [categories, setCategories] = useState<MaisonCategory[]>(MAISON_CATEGORIES);

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalActiveTab, setModalActiveTab] = useState<'details' | 'variants' | 'images' | 'reviews'>('details');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Form State for Adding / Editing Product (Comprehensive)
  const [productForm, setProductForm] = useState({
    name_en: '',
    name_ar: '',
    slug: '',
    category_slug: 'parfums',
    product_type: 'perfume' as 'perfume' | 'skincare' | 'makeup' | 'couture' | 'accessory' | 'coffret' | 'mist' | 'lipgloss',
    featured_on_home: true,
    home_order: 1,
    tagline_en: '',
    tagline_ar: '',
    story_en: '',
    story_ar: '',
    family: 'floral' as 'floral' | 'woody' | 'amber' | 'oud' | 'botanical' | 'coffret',
    family_en: 'Floral Botanical',
    family_ar: 'زهري نباتي',
    concentration: 'Extrait de Parfum (32%)',
    gender_vibe: 'Unisex' as 'Feminine' | 'Masculine' | 'Unisex',
    images: {
      hero: '/images/products/la-fleur-du-nil-bottle.jpg',
      bottle: '/images/products/la-fleur-du-nil-bottle.jpg',
      box: '/images/products/packaging-mockup.jpg',
      lifestyle: '/images/brand/NEW_brand-identity.png',
      texture: '/images/brand/NEW_brand-identity.png',
    },
    variants: [
      {
        id: 1,
        name_en: '50 ml Signature',
        name_ar: '٥٠ مل التوقيع',
        size_ml: 50,
        price: 3600,
        compare_at_price: 4200,
        sku: 'LV-NEW-50',
        stock: 25,
        is_default: true,
      },
    ] as ProductVariant[],
    longevity: 9,
    sillage: 8,
    top_notes_ar: 'برغموت صقلي، زهر البرتقال',
    top_notes_en: 'Sicilian Bergamot, Orange Blossom',
    heart_notes_ar: 'ياسمين سامباك مصري، فاونيا بيضاء',
    heart_notes_en: 'Egyptian Sambac Jasmine, White Peony',
    base_notes_ar: 'صندل ميسور، مسك حريري، عنبر',
    base_notes_en: 'Mysore Sandalwood, Cashmere Musk',
    reviews: [] as Array<{
      id: number;
      name: string;
      rating: number;
      date: string;
      body_en: string;
      body_ar: string;
    }>,
  });

  // Review Form inside Product Modal
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // Form State for Category
  const [editingCategorySlug, setEditingCategorySlug] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name_en: '',
    name_ar: '',
    slug: '',
    tagline_en: '',
    tagline_ar: '',
    description_en: '',
    description_ar: '',
    sort_order: 1,
    is_active: true,
  });

  // Orders State (Persisted & Synced)
  const [orders, setOrders] = useState<MaisonOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [patronSearch, setPatronSearch] = useState('');
  const [patronsTrigger, setPatronsTrigger] = useState(0);
  // Coupons State (Dynamic Management)
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponSearch, setCouponSearch] = useState('');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 10,
    min_order: 1000,
    max_uses: '' as number | string,
    is_active: true,
    description: '',
  });

  const refreshSecurity = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/v1/admin/security');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) setSecurityData(json.data);
      }
    } catch {}
  };

  // Security Center Handlers
  const handleRotateMasterKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyChangeMsg(null);
    if (newKeyInput !== confirmNewKeyInput) {
      setKeyChangeMsg({
        type: 'err',
        text: isArabic ? 'مفتاح المرور الجديد غير متطابق مع التأكيد' : 'New Master Key confirmation does not match',
      });
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rotate_key',
          currentKey: currentKeyInput,
          newKey: newKeyInput,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setKeyChangeMsg({
          type: 'err',
          text: json?.message || (isArabic ? 'فشل تحديث مفتاح المرور' : 'Failed to rotate key'),
        });
        return;
      }
      if (json?.data) setSecurityData(json.data);
      setCurrentKeyInput('');
      setNewKeyInput('');
      setConfirmNewKeyInput('');
      setKeyChangeMsg({
        type: 'ok',
        text: isArabic
          ? 'تم تغيير مفتاح المرور وتشفيره بنجاح، وإغلاق كافة الجلسات الأخرى!'
          : 'Master Key updated with salted scrypt hash and all other sessions invalidated!',
      });
    } catch {
      setKeyChangeMsg({ type: 'err', text: isArabic ? 'تعذر الاتصال بالسيرفر' : 'Server connection error' });
    }
  };

  const handleRevokeAllSessions = async () => {
    if (
      !confirm(
        isArabic
          ? 'هل تريد إنهاء كافة جلسات الدخول المفتوحة على الأجهزة الأخرى فوراً؟'
          : 'Immediately invalidate all other active Admin sessions?'
      )
    )
      return;

    try {
      const res = await fetch('/api/v1/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke_sessions' }),
      });
      const json = await res.json();
      if (json?.data) setSecurityData(json.data);
    } catch {}
  };

  const handleBlockIp = async (ipAddr: string) => {
    const clean = ipAddr.trim();
    if (!clean) return;
    try {
      const res = await fetch('/api/v1/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block_ip', ip: clean }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json?.message || 'Failed to block IP');
        return;
      }
      if (json?.data) setSecurityData(json.data);
      setIpBlockInput('');
    } catch {}
  };

  const handleUnblockIp = async (ipAddr: string) => {
    try {
      const res = await fetch('/api/v1/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock_ip', ip: ipAddr }),
      });
      const json = await res.json();
      if (json?.data) setSecurityData(json.data);
    } catch {}
  };

  const handleClearSecurityLogs = async () => {
    if (!confirm(isArabic ? 'هل تريد مسح سجل التنبيهات السابق؟' : 'Clear archived security logs?')) return;
    try {
      const res = await fetch('/api/v1/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_logs' }),
      });
      const json = await res.json();
      if (json?.data) setSecurityData(json.data);
    } catch {}
  };

  const refreshCoupons = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch('/api/v1/coupons');
      if (!res.ok) return;
      const json = await res.json();
      if (json?.data) {
        setCoupons(json.data);
      }
    } catch {}
  };
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MaisonOrder | null>(null);
  const [selectedPatron, setSelectedPatron] = useState<any | null>(null);
  const [latestToast, setLatestToast] = useState<MaisonOrder | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync orders from storage & API
  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/v1/orders');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          const apiOrders: MaisonOrder[] = json.data.map((item: any) => ({
            id: item.id || item.order_number,
            customer:
              typeof item.customer === 'object' && item.customer
                ? item.customer.name
                : item.customer || 'Royal Patron',
            phone:
              typeof item.customer === 'object' && item.customer
                ? item.customer.phone
                : item.phone || '',
            gov:
              typeof item.customer === 'object' && item.customer
                ? `${item.customer?.governorate || 'Cairo'} — ${item.customer?.city || ''}`
                : item.gov || 'Cairo',
            items: item.items
              ? typeof item.items === 'string'
                ? item.items
                : item.items?.map((i: any) => `${i.name_en || 'Flacon'} (${i.size_ml || 50}ml)`).join(', ')
              : 'Bespoke Flacon',
            // Preserve rich order detail fields for the order detail panel
            items_detail: item.items_detail || (Array.isArray(item.items) ? item.items : undefined),
            map_url: item.map_url || item.customer?.map_url || undefined,
            map_coords: item.map_coords || item.customer?.map_coords || undefined,
            total: item.total || item.pricing?.total || 3600,
            payment:
              typeof item.payment === 'object' && item.payment
                ? item.payment.method === 'cod'
                  ? 'COD'
                  : 'Paymob Card'
                : item.payment || 'COD',
            status: item.status || 'Processing',
            date:
              item.date ||
              (item.created_at
                ? new Date(item.created_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Today'),
            is_new: item.is_new !== false,
          }));

          const rawClient = typeof window !== 'undefined' ? localStorage.getItem('lv_client_orders') : null;
          const currentClient: MaisonOrder[] = rawClient ? JSON.parse(rawClient) : [];
          const existingMap = new Map(currentClient.map((o) => [o.id, o]));
          let hasChanges = false;
          for (const ao of apiOrders) {
            if (!existingMap.has(ao.id)) {
              currentClient.unshift(ao);
              existingMap.set(ao.id, ao);
              hasChanges = true;
            } else {
              // Merge rich fields into existing entry without overwriting local status overrides
              const existing = existingMap.get(ao.id)!;
              if (ao.items_detail && !existing.items_detail) {
                existing.items_detail = ao.items_detail;
                hasChanges = true;
              }
              if (ao.map_url && !existing.map_url) {
                existing.map_url = ao.map_url;
                hasChanges = true;
              }
              if (ao.map_coords && !existing.map_coords) {
                existing.map_coords = ao.map_coords;
                hasChanges = true;
              }
            }
          }
          if (hasChanges && typeof window !== 'undefined') {
            localStorage.setItem('lv_client_orders', JSON.stringify(currentClient));
          }
        }
      }
    } catch {
      // offline / fallback
    }
    setOrders(getStoredOrders());
  };

  // Load persisted catalog & orders ONLY after server authentication succeeds
  useEffect(() => {
    if (!isAuthenticated) return;

    setProducts(getStoredCatalog(true));
    setCategories(getStoredCategories());
    refreshOrders();
    refreshCoupons();
    refreshSecurity();

    // 1. Sync server catalog (including hidden items for admin control)
    fetch('/api/v1/products?include_hidden=true')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setProducts(json.data);
          localStorage.setItem('lvenus_custom_catalog', JSON.stringify(json.data));
        }
      })
      .catch(() => {});

    // 2. Sync patrons from authenticated server endpoint
    fetch('/api/v1/patrons')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          localStorage.setItem('lv_patrons_registry', JSON.stringify(json.data));
          setPatronsTrigger((prev) => prev + 1);
        }
      })
      .catch(() => {});

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lv_client_orders' || e.key === 'lv_deleted_orders' || e.key === 'lv_status_overrides') {
        const updated = getStoredOrders();
        setOrders(updated);
      }
      if (e.key === 'lvenus_custom_catalog' || e.key === 'lvenus_deleted_products') {
        setProducts(getStoredCatalog(true));
      }
      if (e.key === 'lv_patrons_registry') {
        setPatronsTrigger((prev) => prev + 1);
      }
    };
    window.addEventListener('storage', handleStorage);

    const handlePatronsUpdated = () => {
      setPatronsTrigger((prev) => prev + 1);
    };
    window.addEventListener('lv_patrons_updated', handlePatronsUpdated);

    const handleLocalNewOrder = (e: any) => {
      const newOrder = e.detail as MaisonOrder;
      const updated = getStoredOrders();
      setOrders(updated);
      setLatestToast(newOrder);
      if (soundEnabled) playLuxuryChime();
    };
    window.addEventListener('lv_order_created', handleLocalNewOrder);

    const handleCatalogUpdate = () => {
      setProducts(getStoredCatalog(true));
    };
    window.addEventListener('lv_catalog_updated', handleCatalogUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('lv_patrons_updated', handlePatronsUpdated);
      window.removeEventListener('lv_order_created', handleLocalNewOrder);
      window.removeEventListener('lv_catalog_updated', handleCatalogUpdate);
    };
  }, [isAuthenticated, soundEnabled]);

  // Open Modal for New Product
  const openAddProductModal = () => {
    setModalMode('add');
    setEditingProductId(null);
    setModalActiveTab('details');
    setProductForm({
      name_en: '',
      name_ar: '',
      slug: '',
      category_slug: 'parfums',
      product_type: 'perfume',
      featured_on_home: true,
      home_order: products.length + 1,
      tagline_en: '',
      tagline_ar: '',
      story_en: '',
      story_ar: '',
      family: 'floral',
      family_en: 'Floral Botanical',
      family_ar: 'زهري نباتي',
      concentration: 'Extrait de Parfum (32%)',
      gender_vibe: 'Unisex',
      images: {
        hero: '/images/products/la-fleur-du-nil-bottle.jpg',
        bottle: '/images/products/la-fleur-du-nil-bottle.jpg',
        box: '/images/products/packaging-mockup.jpg',
        lifestyle: '/images/brand/NEW_brand-identity.png',
        texture: '/images/brand/NEW_brand-identity.png',
      },
      variants: [
        {
          id: Date.now(),
          name_en: '50 ml Signature Flacon',
          name_ar: '٥٠ مل القارورة الملكية',
          size_ml: 50,
          price: 3600,
          compare_at_price: 4200,
          sku: 'LV-NEW-50',
          stock: 30,
          is_default: true,
        },
      ],
      longevity: 9,
      sillage: 8,
      top_notes_ar: 'برغموت صقلي، زهر البرتقال',
      top_notes_en: 'Sicilian Bergamot, Orange Blossom',
      heart_notes_ar: 'ياسمين مصري نقي، ورد دمشقي',
      heart_notes_en: 'Egyptian Sambac Jasmine, Damask Rose',
      base_notes_ar: 'صندل ميسور، عنبر ذهبي، مسك',
      base_notes_en: 'Mysore Sandalwood, Golden Ambergris',
      reviews: [],
    });
    setIsProductModalOpen(true);
  };

  // Open Modal for Edit Product
  const openEditProductModal = (product: PerfumeData) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setModalActiveTab('details');
    setProductForm({
      name_en: product.name_en,
      name_ar: product.name_ar,
      slug: product.slug,
      category_slug: product.category_slug || 'parfums',
      product_type: product.product_type || 'perfume',
      featured_on_home: product.featured_on_home !== false,
      home_order: product.home_order || 1,
      tagline_en: product.tagline_en,
      tagline_ar: product.tagline_ar,
      story_en: product.story_en,
      story_ar: product.story_ar,
      family: product.family,
      family_en: product.family_en,
      family_ar: product.family_ar,
      concentration: product.concentration,
      gender_vibe: product.gender_vibe || 'Unisex',
      images: {
        hero: product.images?.hero || '/images/products/la-fleur-du-nil-bottle.jpg',
        bottle: product.images?.bottle || '/images/products/la-fleur-du-nil-bottle.jpg',
        box: product.images?.box || '/images/products/packaging-mockup.jpg',
        lifestyle: product.images?.lifestyle || '/images/brand/NEW_brand-identity.png',
        texture: product.images?.texture || '/images/brand/NEW_brand-identity.png',
      },
      variants: product.variants?.length > 0 ? JSON.parse(JSON.stringify(product.variants)) : [
        {
          id: Date.now(),
          name_en: '50 ml Flacon',
          name_ar: '٥٠ مل',
          size_ml: 50,
          price: 3500,
          compare_at_price: null,
          sku: `${product.slug}-50`,
          stock: 20,
          is_default: true,
        },
      ],
      longevity: product.longevity || 9,
      sillage: product.sillage || 8,
      top_notes_ar: Array.isArray(product.top_notes_ar) ? product.top_notes_ar.join(', ') : (product.top_notes_ar || ''),
      top_notes_en: Array.isArray(product.top_notes_en) ? product.top_notes_en.join(', ') : (product.top_notes_en || ''),
      heart_notes_ar: Array.isArray(product.heart_notes_ar) ? product.heart_notes_ar.join(', ') : (product.heart_notes_ar || ''),
      heart_notes_en: Array.isArray(product.heart_notes_en) ? product.heart_notes_en.join(', ') : (product.heart_notes_en || ''),
      base_notes_ar: Array.isArray(product.base_notes_ar) ? product.base_notes_ar.join(', ') : (product.base_notes_ar || ''),
      base_notes_en: Array.isArray(product.base_notes_en) ? product.base_notes_en.join(', ') : (product.base_notes_en || ''),
      reviews: product.reviews?.length > 0 ? JSON.parse(JSON.stringify(product.reviews)) : [],
    });
    setIsProductModalOpen(true);
  };

  // Add / Edit Product Submit
  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name_en.trim() || !productForm.name_ar.trim()) {
      alert(isArabic ? 'يرجى إدخال اسم المنتج بالإنجليزية والعربية' : 'Product name in Arabic & English is required');
      return;
    }

    if (!productForm.variants || productForm.variants.length === 0) {
      alert(isArabic ? 'يجب إضافة حجم وسعر واحد على الأقل للمنتج' : 'At least one variant/size is required');
      return;
    }

    const slug = productForm.slug.trim() || productForm.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const prodId = editingProductId ? editingProductId : Date.now();

    const productPayload: PerfumeData = {
      id: prodId,
      slug,
      category_slug: productForm.category_slug,
      product_type: productForm.product_type,
      featured_on_home: productForm.featured_on_home,
      home_order: Number(productForm.home_order) || 1,
      name_en: productForm.name_en.trim(),
      name_ar: productForm.name_ar.trim(),
      tagline_en: productForm.tagline_en.trim() || 'A bespoke creation from Maison L’VENUS',
      tagline_ar: productForm.tagline_ar.trim() || 'إبداع ملكي استثنائي من دار لوفينوس',
      story_en: productForm.story_en.trim() || productForm.tagline_en.trim(),
      story_ar: productForm.story_ar.trim() || productForm.tagline_ar.trim(),
      family: productForm.family,
      family_en: productForm.family_en,
      family_ar: productForm.family_ar,
      concentration: productForm.concentration,
      gender_vibe: productForm.gender_vibe,
      longevity: Number(productForm.longevity) || 9,
      sillage: Number(productForm.sillage) || 8,
      intensity: Number(productForm.longevity) || 9,
      top_notes_en: productForm.top_notes_en ? productForm.top_notes_en.split(',').map((s) => s.trim()).filter(Boolean) : ['Botanical Essences'],
      top_notes_ar: productForm.top_notes_ar ? productForm.top_notes_ar.split(',').map((s) => s.trim()).filter(Boolean) : ['مكونات نباتية نقية'],
      heart_notes_en: productForm.heart_notes_en ? productForm.heart_notes_en.split(',').map((s) => s.trim()).filter(Boolean) : ['Floral Heart'],
      heart_notes_ar: productForm.heart_notes_ar ? productForm.heart_notes_ar.split(',').map((s) => s.trim()).filter(Boolean) : ['قلب العطر الزهري'],
      base_notes_en: productForm.base_notes_en ? productForm.base_notes_en.split(',').map((s) => s.trim()).filter(Boolean) : ['Velvet Base'],
      base_notes_ar: productForm.base_notes_ar ? productForm.base_notes_ar.split(',').map((s) => s.trim()).filter(Boolean) : ['قاعدة العطر الفاخرة'],
      callout_top: { en: 'Hand-Selected Notes', ar: 'مكونات نقية منتقاة بعناية' },
      callout_cap: { en: 'Artisanal Presentation Cap', ar: 'غطاء فاخر مصقول' },
      callout_seal: { en: 'Burgundy Wax Stamp', ar: 'ختم الشمع البرغندي' },
      variants: productForm.variants.map((v, idx) => ({
        ...v,
        id: v.id || prodId * 10 + (idx + 1),
        size_ml: Number(v.size_ml) || 50,
        price: Number(v.price) || 1000,
        compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
        stock: Number(v.stock) || 10,
        sku: v.sku || `${slug}-${v.size_ml}`,
        is_default: idx === 0 || v.is_default,
      })),
      images: {
        hero: productForm.images.hero || '/images/products/la-fleur-du-nil-bottle.jpg',
        bottle: productForm.images.bottle || '/images/products/la-fleur-du-nil-bottle.jpg',
        box: productForm.images.box || '/images/products/packaging-mockup.jpg',
        lifestyle: productForm.images.lifestyle || '/images/brand/NEW_brand-identity.png',
        texture: productForm.images.texture || '/images/brand/NEW_brand-identity.png',
      },
      reviews: productForm.reviews,
      accent_gradient: 'from-[#FDF3E7] via-[#F6DEBE] to-[#E0B888]',
    };

    const updated = saveProductToCatalog(productPayload);
    setProducts(updated);
    setIsProductModalOpen(false);

    // Save to server database so all users on website see it immediately
    fetch('/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload),
    }).catch(() => {});
  };

  // Quick Toggle Homepage Feature directly from Table
  const handleToggleHomeFeatured = (product: PerfumeData) => {
    const updatedProd = {
      ...product,
      featured_on_home: product.featured_on_home === false ? true : false,
    };
    saveProductToCatalog(updatedProd);
    setProducts(getStoredCatalog(true));
    fetch('/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProd),
    }).catch(() => {});
  };

  // Quick Toggle Storefront Visibility (Hide / Show) directly from Table
  const handleToggleStorefrontVisibility = (product: PerfumeData) => {
    const isCurrentlyHidden = product.is_hidden === true;
    const updatedProd = {
      ...product,
      is_hidden: !isCurrentlyHidden,
    };
    saveProductToCatalog(updatedProd);
    setProducts(getStoredCatalog(true));
    fetch('/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProd),
    }).catch(() => {});
  };

  // Delete Product
  const handleDeleteProduct = (id: number) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا المنتج نهائياً من الكتالوج؟' : 'Are you sure you want to permanently delete this product?')) {
      const updated = deleteProductFromCatalog(id);
      setProducts(getStoredCatalog(true));
      fetch(`/api/v1/products?id=${id}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  // Toggle Category Active / Hidden
  const handleToggleCategoryActive = (cat: MaisonCategory) => {
    const updatedCat: MaisonCategory = {
      ...cat,
      is_active: cat.is_active === false ? true : false,
    };
    const updated = saveCategory(updatedCat);
    setCategories(updated);
    fetch('/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCat),
    }).catch(() => {});
  };

  // Delete Category
  const handleDeleteCategory = (slug: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا الخط الإنتاجي نهائياً من الكاتالوج؟' : 'Are you sure you want to permanently delete this line?')) {
      const updated = deleteCategoryFromStorage(slug);
      setCategories(updated);
      fetch(`/api/v1/categories?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  // Open Edit Category Modal
  const openEditCategoryModal = (cat: MaisonCategory) => {
    setEditingCategorySlug(cat.slug);
    setCategoryForm({
      name_en: cat.name_en,
      name_ar: cat.name_ar,
      slug: cat.slug,
      tagline_en: cat.tagline_en || '',
      tagline_ar: cat.tagline_ar || '',
      description_en: cat.description_en || '',
      description_ar: cat.description_ar || '',
      sort_order: cat.sort_order || 1,
      is_active: cat.is_active !== false,
    });
    setIsAddCategoryOpen(true);
  };

  // Add Variant inside Modal
  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      id: Date.now(),
      name_en: '100 ml Grand',
      name_ar: '١٠٠ مل كبير',
      size_ml: 100,
      price: 5500,
      compare_at_price: 6200,
      sku: `LV-${Date.now().toString().slice(-4)}`,
      stock: 15,
      is_default: false,
    };
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, newVar],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    if (productForm.variants.length <= 1) {
      alert(isArabic ? 'يجب الإبقاء على حجم وسعر واحد على الأقل للمنتج' : 'At least one variant must remain');
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateVariant = (index: number, field: string, val: any) => {
    setProductForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, variants: updated };
    });
  };

  // Reviews inside Modal
  // Coupon Handlers
  const openAddCouponModal = () => {
    setEditingCouponId(null);
    setCouponForm({
      code: '',
      type: 'percent',
      value: 10,
      min_order: 1000,
      max_uses: '',
      is_active: true,
      description: '',
    });
    setIsCouponModalOpen(true);
  };

  const openEditCouponModal = (c: any) => {
    setEditingCouponId(c.id);
    setCouponForm({
      code: c.code,
      type: c.type || 'percent',
      value: c.value,
      min_order: c.min_order || 0,
      max_uses: c.max_uses || '',
      is_active: c.is_active !== false,
      description: c.description || '',
    });
    setIsCouponModalOpen(true);
  };

  const handleCouponFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      alert(isArabic ? 'يرجى كتابة كود الخصم' : 'Coupon code is required');
      return;
    }

    const payload = {
      id: editingCouponId || Date.now(),
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value) || 10,
      min_order: Number(couponForm.min_order) || 0,
      max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
      is_active: couponForm.is_active,
      description: couponForm.description.trim(),
    };

    try {
      const res = await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.coupons) {
        setCoupons(json.coupons);
      } else {
        refreshCoupons();
      }
      setIsCouponModalOpen(false);
    } catch {
      alert(isArabic ? 'حدث خطأ أثناء حفظ الكوبون' : 'Failed to save coupon');
    }
  };

  const handleToggleCouponActive = async (c: any) => {
    const updated = { ...c, is_active: !c.is_active };
    try {
      const res = await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (json?.coupons) setCoupons(json.coupons);
      else refreshCoupons();
    } catch {}
  };

  const handleDeleteCoupon = async (id: number) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف كود الخصم هذا؟' : 'Are you sure you want to delete this coupon?')) {
      try {
        const res = await fetch(`/api/v1/coupons?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json?.coupons) setCoupons(json.coupons);
        else refreshCoupons();
      } catch {}
    }
  };

  const handleAddReview = () => {
    if (!newReviewAuthor.trim() || !newReviewText.trim()) return;
    const newRev = {
      id: Date.now(),
      name: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: new Date().toISOString().split('T')[0],
      body_en: newReviewText.trim(),
      body_ar: newReviewText.trim(),
    };
    setProductForm((prev) => ({
      ...prev,
      reviews: [newRev, ...prev.reviews],
    }));

    if (editingProductId && productForm.slug) {
      addProductReview(productForm.slug, newRev);
      setProducts(getStoredCatalog());
      fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRev.name,
          rating: newRev.rating,
          body: newRev.body_ar || newRev.body_en,
          product_slug: productForm.slug,
          product_id: editingProductId,
        }),
      }).catch(() => {});
    }

    setNewReviewAuthor('');
    setNewReviewText('');
    setNewReviewRating(5);
  };

  const handleDeleteReview = (reviewId: number) => {
    setProductForm((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== reviewId),
    }));

    if (editingProductId && productForm.slug) {
      deleteProductReview(productForm.slug, reviewId);
      setProducts(getStoredCatalog());
      fetch(`/api/v1/reviews?product_slug=${productForm.slug}&id=${reviewId}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  };

  // Category Submit (Add / Edit)
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = editingCategorySlug || categoryForm.slug.trim() || categoryForm.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: MaisonCategory = {
      id: `cat-${slug}`,
      slug,
      name_en: categoryForm.name_en.trim(),
      name_ar: categoryForm.name_ar.trim(),
      tagline_en: categoryForm.tagline_en.trim(),
      tagline_ar: categoryForm.tagline_ar.trim(),
      description_en: categoryForm.description_en.trim(),
      description_ar: categoryForm.description_ar.trim(),
      is_active: categoryForm.is_active !== false,
      sort_order: Number(categoryForm.sort_order) || categories.length + 1,
    };

    const updated = saveCategory(newCat);
    setCategories(updated);
    setIsAddCategoryOpen(false);
    setEditingCategorySlug(null);
    setCategoryForm({
      name_en: '',
      name_ar: '',
      slug: '',
      tagline_en: '',
      tagline_ar: '',
      description_en: '',
      description_ar: '',
      sort_order: 1,
      is_active: true,
    });

    fetch('/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    }).catch(() => {});
  };

  // Order Status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const updated = updateOrderStatusInStorage(orderId, newStatus);
    setOrders(updated);
    fetch('/api/v1/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status: newStatus }),
    }).catch(() => {});
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    if (confirm(isArabic ? `هل أنت متأكد من حذف الطلب رقم ${orderId} نهائياً؟` : `Are you sure you want to permanently delete order ${orderId}?`)) {
      const updated = deleteOrderFromStorage(orderId);
      setOrders(updated);
      fetch(`/api/v1/orders?id=${encodeURIComponent(orderId)}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  const handleMarkAllRead = () => {
    const updated = markAllOrdersAsRead();
    setOrders(updated);
    setIsNotificationsOpen(false);
  };

  const unreadCount = orders.filter((o) => o.is_new).length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category_slug === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name_ar.includes(searchTerm) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch =
      orderSearch === '' ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      o.gov.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Patrons Directory (Extracted from real logins and orders)
  const patronsList = useMemo(() => {
    const all = getAllPatronsWithStats(orders);
    if (!patronSearch.trim()) return all;
    const q = patronSearch.toLowerCase().trim();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.governorate && p.governorate.toLowerCase().includes(q))
    );
  }, [orders, patronSearch, patronsTrigger]);

  // Real, Accurate Financial & Analytics Calculations (Calculated from orders and products)
  const nonCancelledOrders = orders.filter((o) => o.status !== 'Cancelled');
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = nonCancelledOrders.length > 0 ? Math.round(totalRevenue / nonCancelledOrders.length) : 0;

  const countProcessing = orders.filter((o) => o.status === 'Processing' || !o.status).length;
  const countShipped = orders.filter((o) => o.status === 'Shipped').length;
  const countDelivered = orders.filter((o) => o.status === 'Delivered').length;
  const countCancelled = orders.filter((o) => o.status === 'Cancelled').length;

  // Real Top Selling Products from Orders
  const productSalesMap: Record<string, { count: number; revenue: number }> = {};
  for (const o of nonCancelledOrders) {
    const itemNames = (o.items || '').split(',').map((s) => s.trim());
    for (const item of itemNames) {
      if (!item) continue;
      const clean = item.replace(/\(.*?\)/g, '').trim();
      if (!productSalesMap[clean]) {
        productSalesMap[clean] = { count: 0, revenue: 0 };
      }
      productSalesMap[clean].count += 1;
      productSalesMap[clean].revenue += Math.round(o.total / itemNames.length);
    }
  }
  const topSellingList = Object.entries(productSalesMap).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

  // Real Governorate Distribution
  const govMap: Record<string, number> = {};
  for (const o of orders) {
    const gov = (o.gov || 'Cairo').split('—')[0].trim();
    govMap[gov] = (govMap[gov] || 0) + 1;
  }
  const topGovs = Object.entries(govMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Total Catalog Retail Inventory Value
  const totalCatalogValue = products.reduce((sum, p) => {
    const def = p.variants?.find((v) => v.is_default) || p.variants?.[0];
    const price = def?.price || 0;
    const stock = def?.stock || 0;
    return sum + price * stock;
  }, 0);

  // Security Gate Screen (No hardcoded credentials or client-side passcode hints)
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0D0A08] text-[#FDFBF7] flex flex-col items-center justify-center p-4 gap-4">
        <WaxSeal size={56} />
        <span className="font-display text-xs uppercase tracking-[0.3em] text-[#B08D57] animate-pulse">
          {isArabic ? 'جاري التحقق من الجلسة الأمنية...' : 'Verifying Cryptographic Session...'}
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0A08] text-[#FDFBF7] flex items-center justify-center p-4 relative overflow-hidden select-none">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(107,29,47,0.25) 0%, rgba(13,10,8,0.95) 75%)',
          }}
        />

        <div className="relative z-10 max-w-md w-full p-8 sm:p-10 rounded-3xl ios-glass-dark border border-[#B08D57]/30 shadow-2xl space-y-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <WaxSeal size={64} />
            <div>
              <span className="font-display text-[10px] tracking-[0.35em] uppercase text-[#B08D57] font-semibold block mb-1">
                {isArabic ? 'المشغل الخاص — حماية مشددة' : 'ATELIER PRIVÉ — SECURED VAULT'}
              </span>
              <h1 className="font-serif text-3xl tracking-wider text-[#FDFBF7]">
                {isArabic ? 'بوابة إدارة لوفينوس' : 'Maison L’VENUS'}
              </h1>
              <p className="text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/70 mt-1 font-body italic">
                {isArabic
                  ? 'لوحة التحكم المركزية المحمية بالتشفير وجدار الحماية'
                  : 'Encrypted Master Catalog, Orders & Patron Directory'}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-display uppercase tracking-widest text-[#B08D57] mb-2">
                {isArabic ? 'مفتاح المرور السري (Master Key)' : 'Master Access Key'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#1C1613] border border-[#B08D57]/40 text-[#FDFBF7] placeholder-[#FDFBF7]/20 text-sm focus:outline-none focus:border-[#B08D57] transition-all"
                />
                <KeyRound size={16} className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'left-3' : 'right-3'} text-[#B08D57]/60`} />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs text-center flex items-center justify-center gap-2">
                <Lock size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3.5 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] disabled:opacity-50 text-[#FDFBF7] font-display text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              <Unlock size={14} />
              <span>
                {authSubmitting
                  ? isArabic ? 'جاري التحقق المشفر...' : 'Verifying...'
                  : isArabic ? 'دخول لوحة التحكم' : 'Authenticate Entry'}
              </span>
            </button>
          </form>

          <div className="pt-3 border-t border-[#B08D57]/20 text-[11px] text-[#DFCA9B]/60 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>
              {isArabic
                ? 'محمي بتشفير HttpOnly وحظر تلقائي لمحاولات الاختراق'
                : 'Protected by HttpOnly HMAC Sessions & Brute-Force Lockout'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] dark:bg-[#0D0A08] text-[#14110F] dark:text-[#FDFBF7] pt-28 pb-20 select-none transition-colors duration-300">
      {/* Toast Notification for Live Orders */}
      {latestToast && (
        <div className="fixed top-24 right-4 z-50 max-w-sm w-full bg-[#1C1613] text-[#FDFBF7] border border-[#B08D57] rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-slide-in">
          <div className="w-10 h-10 rounded-full bg-[#6B1D2F] flex items-center justify-center shrink-0">
            <BellRing size={18} className="text-[#DFCA9B] animate-bounce" />
          </div>
          <div className="flex-1 text-xs">
            <span className="font-display text-[10px] uppercase tracking-wider text-[#B08D57] block font-bold">
              {isArabic ? 'طلب جديد وارد الآن!' : 'New Consignment Commissioned!'}
            </span>
            <p className="font-semibold text-sm mt-0.5">{latestToast.id} — {latestToast.total.toLocaleString()} EGP</p>
            <p className="text-[11px] text-[#DFCA9B]/80">{latestToast.customer} ({latestToast.gov})</p>
          </div>
          <button
            onClick={() => setLatestToast(null)}
            className="text-[#DFCA9B]/60 hover:text-[#DFCA9B] p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#B08D57]/20 dark:border-[#B08D57]/30 gap-4">
          <div className="flex items-center gap-4">
            <WaxSeal size={48} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'إدارة دار لوفينوس' : 'L’VENUS — Maison Atelier'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#6B1D2F] text-white text-[9px] uppercase tracking-widest font-bold">
                  DIRECTOR
                </span>
              </div>
              <p className="text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/80 mt-0.5 font-body">
                {isArabic
                  ? 'التحكم بالمنتجات، التسعير، الأوردرات، والعملاء'
                  : 'Master catalog, real-time logistics & registered patrons'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                soundEnabled
                  ? 'border-[#B08D57] bg-[#B08D57]/15 text-[#B08D57]'
                  : 'border-[#B08D57]/30 text-[#8C6E3D]/50 hover:text-[#8C6E3D]'
              }`}
              title={soundEnabled ? 'Chime sound enabled' : 'Muted'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-full border border-[#B08D57]/40 hover:border-[#B08D57] bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] relative cursor-pointer"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#6B1D2F] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#FDFBF7] dark:bg-[#1C1613] border border-[#B08D57]/40 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-2">
                    <span className="font-display text-xs uppercase tracking-wider font-bold text-[#8C6E3D] dark:text-[#DFCA9B]">
                      {isArabic ? 'إشعارات الطلبات' : 'Consignment Feed'}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] text-[#6B1D2F] dark:text-[#DFCA9B] underline"
                      >
                        {isArabic ? 'تحديد الكل كمقروء' : 'Mark all read'}
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-[#B08D57]/10">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="pt-2 text-xs flex justify-between items-start">
                        <div>
                          <span className="font-bold text-[#14110F] dark:text-[#FDFBF7]">{o.id}</span>
                          <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">{o.customer}</p>
                          <span className="text-[10px] text-[#6B1D2F] dark:text-[#DFCA9B] font-mono">{o.total.toLocaleString()} EGP</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B]">
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#6B1D2F] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] transition-all text-xs uppercase tracking-wider font-medium"
            >
              <Eye size={14} />
              <span>{isArabic ? 'معاينة المتجر' : 'Live Boutique'}</span>
            </Link>

            <button
              onClick={openAddProductModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-[#FDFBF7] transition-all text-xs uppercase tracking-wider font-medium shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>{isArabic ? 'منتج جديد' : 'New Creation'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-500/10 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
              title={isArabic ? 'تسجيل الخروج' : 'Logout'}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#B08D57]/20 dark:border-[#B08D57]/30">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm'
                : 'text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7] hover:bg-[#F1EADA] dark:hover:bg-[#1A1412]'
            }`}
          >
            <Package size={15} />
            <span>{isArabic ? 'المنتجات والتسعير' : 'Products & Pricing'}</span>
            <span className="text-[10px] opacity-70">({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm'
                : 'text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7] hover:bg-[#F1EADA] dark:hover:bg-[#1A1412]'
            }`}
          >
            <Layers size={15} />
            <span>{isArabic ? 'خطوط البراند والكاتلوج' : 'Maison Lines & Categories'}</span>
            <span className="text-[10px] opacity-70">({categories.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('orders');
              handleMarkAllRead();
            }}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm'
                : 'text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7] hover:bg-[#F1EADA] dark:hover:bg-[#1A1412]'
            }`}
          >
            <ShoppingBag size={15} />
            <span>{isArabic ? 'طلبات العملاء' : 'Client Orders'}</span>
            <span className="text-[10px] opacity-70">({orders.length})</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#6B1D2F] text-white text-[9px] font-bold animate-pulse">
                {unreadCount} {isArabic ? 'جديد' : 'NEW'}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('patrons')}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'patrons'
                ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm'
                : 'text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7] hover:bg-[#F1EADA] dark:hover:bg-[#1A1412]'
            }`}
          >
            <Users size={15} />
            <span>{isArabic ? 'العملاء المسجلين' : 'Client Directory'}</span>
            <span className="text-[10px] opacity-70">({patronsList.length})</span>
          </button>

          <button
              onClick={() => setActiveTab('coupons')}
              className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'coupons'
                  ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm'
                  : 'text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7] hover:bg-[#F1EADA] dark:hover:bg-[#1A1412]'
              }`}
            >
              <Tag size={15} />
              <span>{isArabic ? 'أكواد الخصم والبروموكود' : 'Coupons & Promos'}</span>
              <span className="text-[10px] opacity-70">({coupons.length})</span>
            </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm'
                : 'text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7] hover:bg-[#F1EADA] dark:hover:bg-[#1A1412]'
            }`}
          >
            <TrendingUp size={15} />
            <span>{isArabic ? 'المؤشرات والمالية الحقيقية' : 'Financial Insights'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('security');
              refreshSecurity();
            }}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#14110F] dark:bg-[#6B1D2F] text-[#FDFBF7] shadow-sm'
                : 'text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7] hover:bg-[#F1EADA] dark:hover:bg-[#1A1412]'
            }`}
          >
            <ShieldCheck size={15} className="text-emerald-500" />
            <span>{isArabic ? 'الأمان وجدار الحماية' : 'Security & Firewall'}</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS & PRICING */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F1EADA]/60 dark:bg-[#161210] p-4 rounded-2xl border border-[#B08D57]/25 dark:border-[#B08D57]/30">
              <div className="relative w-full sm:w-80">
                <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'} text-[#B08D57]`} />
                <input
                  type="text"
                  placeholder={isArabic ? 'بحث بالاسم أو الكود...' : 'Search creations or SKU...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-2 ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-full bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57] placeholder:text-[#14110F]/40 dark:placeholder:text-[#FDFBF7]/40`}
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#6B1D2F] text-[#FDFBF7]'
                      : 'bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
                  }`}
                >
                  {isArabic ? 'الكل' : 'All Lines'}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === c.slug
                        ? 'bg-[#6B1D2F] text-[#FDFBF7]'
                        : 'bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
                    }`}
                  >
                    {isArabic ? c.name_ar : c.name_en}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-[#FDFBF7] dark:bg-[#14100E] rounded-3xl border border-[#B08D57]/25 dark:border-[#B08D57]/30 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1EADA]/70 dark:bg-[#1C1613] border-b border-[#B08D57]/20 dark:border-[#B08D57]/30 text-[#8C6E3D] dark:text-[#DFCA9B] uppercase tracking-wider font-display">
                      <th className="py-4 px-6">{isArabic ? 'المنتج' : 'Creation'}</th>
                      <th className="py-4 px-4">{isArabic ? 'الخط / القسم' : 'Line / Category'}</th>
                      <th className="py-4 px-4">{isArabic ? 'الأحجام والأسعار' : 'Sizes & Prices (EGP)'}</th>
                      <th className="py-4 px-4">{isArabic ? 'ظهور المتجر' : 'Storefront'}</th>
                      <th className="py-4 px-4">{isArabic ? 'واجهة الموقع' : 'Home Showcase'}</th>
                      <th className="py-4 px-4">{isArabic ? 'التقييمات' : 'Reviews'}</th>
                      <th className="py-4 px-4">{isArabic ? 'المخزون' : 'Stock'}</th>
                      <th className="py-4 px-6 text-right">{isArabic ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B08D57]/15 dark:divide-[#B08D57]/20">
                    {filteredProducts.map((p) => {
                      const matchedCat = categories.find((c) => c.slug === p.category_slug);
                      const isFeatured = p.featured_on_home !== false;
                      const isStoreActive = p.is_hidden !== true;
                      return (
                        <tr key={p.id} className="hover:bg-[#F1EADA]/30 dark:hover:bg-[#1C1613]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-[#F1EADA] dark:bg-[#1C1613] border border-[#B08D57]/30 overflow-hidden relative shrink-0">
                                <img
                                  src={p.images?.bottle || p.images?.hero}
                                  alt={p.name_en}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-serif text-sm font-medium text-[#14110F] dark:text-[#FDFBF7] block">
                                  {isArabic ? p.name_ar : p.name_en}
                                </span>
                                <span className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70 italic font-serif">
                                  {isArabic ? p.name_en : p.tagline_en}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium bg-[#F1EADA] dark:bg-[#1C1613] border border-[#B08D57]/30 text-[#6B1D2F] dark:text-[#DFCA9B]">
                              {matchedCat ? (isArabic ? matchedCat.name_ar : matchedCat.name_en) : (p.category_slug || 'Parfums')}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              {p.variants.map((v) => (
                                <div key={v.sku || v.id} className="flex items-center gap-2 text-[11px]">
                                  <span className="text-[#8C6E3D] dark:text-[#DFCA9B]/70 font-mono">
                                    {v.size_ml}ml:
                                  </span>
                                  <span className="font-semibold text-[#14110F] dark:text-[#FDFBF7]">
                                    {v.price.toLocaleString()} EGP
                                  </span>
                                </div>
                              ))}
                              <span className="text-[9px] text-[#8C6E3D]/60 dark:text-[#DFCA9B]/50 font-mono">
                                ({p.variants.length} {p.variants.length === 1 ? 'حجم واحد' : 'أحجام'})
                              </span>
                            </div>
                          </td>

                          {/* Quick Toggle Storefront Visibility */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleStorefrontVisibility(p)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-all ${
                                isStoreActive
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700'
                              }`}
                              title={isArabic ? 'انقر لإخفاء أو إظهار المنتج في المتجر' : 'Toggle storefront visibility'}
                            >
                              {isStoreActive ? <Eye size={11} /> : <EyeOff size={11} />}
                              <span>{isStoreActive ? (isArabic ? 'معروض' : 'Active') : (isArabic ? 'مخفي' : 'Hidden')}</span>
                            </button>
                          </td>

                          {/* Quick Toggle Homepage Feature */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleHomeFeatured(p)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-all ${
                                isFeatured
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700'
                              }`}
                              title="انقر لتغيير ظهور المنتج بالصفحة الرئيسية"
                            >
                              <Star size={11} className={isFeatured ? 'fill-amber-500 text-amber-500' : ''} />
                              <span>{isFeatured ? (isArabic ? 'معروض بالرئيسية' : 'Featured') : (isArabic ? 'مخفي من الرئيسية' : 'Hidden')}</span>
                            </button>
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 font-mono text-xs text-[#8C6E3D] dark:text-[#DFCA9B]">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span>{p.reviews?.length || 0}</span>
                              <span className="text-[10px] opacity-70">({isArabic ? 'تعليق' : 'reviews'})</span>
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-xs font-mono font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
                              {p.variants.reduce((acc, curr) => acc + curr.stock, 0)} units
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={isArabic ? `/ar/product/${p.slug}` : `/product/${p.slug}`}
                                target="_blank"
                                title={isArabic ? 'معاينة في المتجر' : 'Preview in Store'}
                                className="p-2 rounded-full border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#B08D57] hover:bg-[#B08D57]/10 transition-all"
                              >
                                <ExternalLink size={13} />
                              </Link>
                              <button
                                onClick={() => handleToggleStorefrontVisibility(p)}
                                title={isArabic ? (isStoreActive ? 'إخفاء من المتجر' : 'إظهار في المتجر') : (isStoreActive ? 'Hide from Store' : 'Show in Store')}
                                className={`p-2 rounded-full border transition-all cursor-pointer ${
                                  isStoreActive
                                    ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                    : 'border-stone-400 text-stone-500 hover:bg-stone-500 hover:text-white'
                                }`}
                              >
                                {isStoreActive ? <Eye size={13} /> : <EyeOff size={13} />}
                              </button>
                              <button
                                onClick={() => openEditProductModal(p)}
                                title={isArabic ? 'تعديل كامل (سعر، وصف، مقاسات، صور، تقييمات)' : 'Full Edit'}
                                className="p-2 rounded-full border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#6B1D2F] hover:bg-[#6B1D2F] hover:text-[#FDFBF7] transition-all cursor-pointer"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                title={isArabic ? 'حذف المنتج' : 'Delete Product'}
                                className="p-2 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES / LINES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'خطوط وأقسام دار لوفينوس' : 'Maison Lines & Categories'}
                </h3>
                <p className="text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/80 font-body">
                  {isArabic
                    ? 'إدارة خطوط العطور، العناية بالبشرة والشفاه، بدي اسبلاش، والمجموعات الفاخرة'
                    : 'Manage Parfums, Skincare & Lip Care, Body Splash, and Coffrets'}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCategorySlug(null);
                  setCategoryForm({
                    name_en: '',
                    name_ar: '',
                    slug: '',
                    tagline_en: '',
                    tagline_ar: '',
                    description_en: '',
                    description_ar: '',
                    sort_order: categories.length + 1,
                    is_active: true,
                  });
                  setIsAddCategoryOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6B1D2F] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#8A1D2E] transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>{isArabic ? 'إضافة خط إنتاج جديد' : 'New Maison Line'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category_slug === cat.slug).length;
                const isCatActive = cat.is_active !== false;
                return (
                  <div
                    key={cat.slug}
                    className={`p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#14100E] border shadow-sm space-y-4 transition-all ${
                      isCatActive
                        ? 'border-[#B08D57]/30 hover:border-[#B08D57]'
                        : 'border-stone-300 dark:border-stone-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-display text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold block">
                          {isArabic ? cat.name_en : cat.slug}
                        </span>
                        <h4 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7] mt-0.5">
                          {isArabic ? cat.name_ar : cat.name_en}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B] font-bold">
                        {count} {isArabic ? 'منتجات' : 'items'}
                      </span>
                    </div>

                    <p className="text-xs text-[#3A332D]/80 dark:text-[#FDFBF7]/70 leading-relaxed min-h-[36px]">
                      {isArabic ? cat.description_ar : cat.description_en}
                    </p>

                    <div className="pt-3 border-t border-[#B08D57]/20 flex items-center justify-between text-xs">
                      {/* Toggle Active / Hidden */}
                      <button
                        onClick={() => handleToggleCategoryActive(cat)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-display uppercase tracking-wider font-semibold cursor-pointer transition-all ${
                          isCatActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700'
                        }`}
                        title={isArabic ? 'انقر لإخفاء أو تفعيل الخط في المتجر' : 'Toggle category visibility'}
                      >
                        {isCatActive ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{isCatActive ? (isArabic ? 'مفعل بالمتجر' : 'Active') : (isArabic ? 'مخفي' : 'Hidden')}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditCategoryModal(cat)}
                          title={isArabic ? 'تعديل بيانات الخط' : 'Edit Line'}
                          className="p-2 rounded-full border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#6B1D2F] hover:bg-[#6B1D2F] hover:text-[#FDFBF7] transition-all cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.slug)}
                          title={isArabic ? 'حذف الخط' : 'Delete Line'}
                          className="p-2 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CLIENT ORDERS (With Search, Filter, Delete, and WhatsApp) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filter and Search Bar for Orders */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F1EADA]/60 dark:bg-[#161210] p-4 rounded-2xl border border-[#B08D57]/25 dark:border-[#B08D57]/30">
              <div className="relative w-full sm:w-80">
                <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'} text-[#B08D57]`} />
                <input
                  type="text"
                  placeholder={isArabic ? 'بحث بالاسم، رقم الطلب، الهاتف...' : 'Search order #, patron, phone...'}
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className={`w-full py-2 ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-full bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]`}
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {(['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      orderFilter === st
                        ? 'bg-[#6B1D2F] text-[#FDFBF7]'
                        : 'bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7]'
                    }`}
                  >
                    {st === 'all'
                      ? isArabic ? `الكل (${orders.length})` : `All (${orders.length})`
                      : `${st} (${orders.filter((o) => o.status === st).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-[#14100E] rounded-3xl border border-[#B08D57]/25 dark:border-[#B08D57]/30 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1EADA]/70 dark:bg-[#1C1613] border-b border-[#B08D57]/20 dark:border-[#B08D57]/30 text-[#8C6E3D] dark:text-[#DFCA9B] uppercase tracking-wider font-display">
                      <th className="py-4 px-6">{isArabic ? 'رقم الطلب' : 'Order #'}</th>
                      <th className="py-4 px-4">{isArabic ? 'العميل والتواصل' : 'Client & Contact'}</th>
                      <th className="py-4 px-4">{isArabic ? 'المحافظة' : 'Governorate'}</th>
                      <th className="py-4 px-4">{isArabic ? 'القطع والمنتجات' : 'Creations'}</th>
                      <th className="py-4 px-4">{isArabic ? 'الإجمالي' : 'Total (EGP)'}</th>
                      <th className="py-4 px-4">{isArabic ? 'الحالة الحالية' : 'Live Status'}</th>
                      <th className="py-4 px-6 text-right">{isArabic ? 'تحديث ومسح' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B08D57]/15 dark:divide-[#B08D57]/20">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                          {isArabic ? 'لا توجد طلبات مطابقة للبحث' : 'No consignments match your criteria'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr
                          key={o.id}
                          onClick={() => setSelectedOrder(o)} className={`cursor-pointer transition-colors ${
                            o.is_new
                              ? 'bg-[#B08D57]/15 dark:bg-[#B08D57]/20 border-l-4 border-l-[#B08D57]'
                              : 'hover:bg-[#F1EADA]/30 dark:hover:bg-[#1C1613]/50'
                          }`}
                        >
                          <td className="py-4 px-6 font-mono font-semibold text-[#6B1D2F] dark:text-[#DFCA9B]">
                            <div className="flex items-center gap-2">
                              <span>{o.id}</span>
                              {o.is_new && (
                                <span className="px-1.5 py-0.5 rounded bg-[#6B1D2F] text-white text-[9px] font-bold uppercase tracking-wider animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B]/60 block font-sans">
                              {o.date}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-[#14110F] dark:text-[#FDFBF7] block">{o.customer}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70 font-mono">{o.phone}</span>
                              {o.phone && (
                                <a
                                  href={`https://wa.me/20${normalizePhone(o.phone).replace(/^0/, '')}?text=${encodeURIComponent(
                                    `مرحباً ${o.customer}، نتشرف بالتواصل معك بخصوص طلبك رقم ${o.id} من دار لوفينوس.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                                  title="مراسلة واتساب"
                                >
                                  <MessageCircle size={13} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[#3A332D] dark:text-[#FDFBF7]/80">
                            <div className="flex items-center gap-1.5">
                              <span>{o.gov}</span>
                              {(o.map_url || o.map_coords || o.gov) && (
                                <a
                                  href={o.map_url || (o.map_coords ? `https://www.google.com/maps?q=${o.map_coords.lat},${o.map_coords.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.gov + ', Egypt')}`)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 rounded-full text-[#6B1D2F] dark:text-[#DFCA9B] hover:bg-[#6B1D2F] hover:text-white transition-all shrink-0 cursor-pointer"
                                  title={isArabic ? 'فتح موقع هذا العميل على الخريطة' : 'Open in Maps'}
                                >
                                  <MapPin size={13} />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[#3A332D] dark:text-[#FDFBF7]/70 max-w-xs truncate">{o.items}</td>
                          <td className="py-4 px-4 font-mono font-bold text-[#14110F] dark:text-[#FDFBF7]">
                            {o.total.toLocaleString()} EGP
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                                o.status === 'Delivered'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                                  : o.status === 'Shipped'
                                  ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                                  : o.status === 'Cancelled'
                                  ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300'
                                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Status Select */}
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 rounded-full text-[11px] px-3 py-1 cursor-pointer focus:outline-none"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>

                              {/* Live Track Link */}
                              <Link
                                href={isArabic ? `/ar/orders/${o.id}` : `/orders/${o.id}`}
                                target="_blank"
                                title={isArabic ? 'تتبع مسار الشحنة' : 'Track Order'}
                                className="p-1.5 rounded-full border border-[#B08D57]/30 text-[#8C6E3D] dark:text-[#DFCA9B] hover:bg-[#B08D57]/15"
                              >
                                <Eye size={13} />
                              </Link>

                              {/* DELETE ORDER BUTTON */}
                              <button
                                onClick={() => handleDeleteOrder(o.id)}
                                title={isArabic ? 'حذف هذا الأوردر نهائياً' : 'Delete Order Permanently'}
                                className="p-1.5 rounded-full border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLIENT DIRECTORY / PATRONS (New Requested Feature) */}
        {activeTab === 'patrons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F1EADA]/60 dark:bg-[#161210] p-4 rounded-2xl border border-[#B08D57]/25 dark:border-[#B08D57]/30">
              <div className="relative w-full sm:w-80">
                <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'} text-[#B08D57]`} />
                <input
                  type="text"
                  placeholder={isArabic ? 'بحث بالاسم، الهاتف، المحافظة...' : 'Search patrons by name, phone...'}
                  value={patronSearch}
                  onChange={(e) => setPatronSearch(e.target.value)}
                  className={`w-full py-2 ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-full bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]`}
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8C6E3D] dark:text-[#DFCA9B]">
                <span className="font-semibold">{patronsList.length} {isArabic ? 'عميل مسجل' : 'Registered Patrons'}</span>
              </div>
            </div>

            <div className="bg-[#FDFBF7] dark:bg-[#14100E] rounded-3xl border border-[#B08D57]/25 dark:border-[#B08D57]/30 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1EADA]/70 dark:bg-[#1C1613] border-b border-[#B08D57]/20 dark:border-[#B08D57]/30 text-[#8C6E3D] dark:text-[#DFCA9B] uppercase tracking-wider font-display">
                      <th className="py-4 px-6">{isArabic ? 'العميل' : 'Patron'}</th>
                      <th className="py-4 px-4">{isArabic ? 'بيانات الاتصال' : 'Contact'}</th>
                      <th className="py-4 px-4">{isArabic ? 'الموقع والعنوان' : 'Location & Address'}</th>
                      <th className="py-4 px-4">{isArabic ? 'عدد الطلبات' : 'Orders'}</th>
                      <th className="py-4 px-4">{isArabic ? 'إجمالي المشتريات' : 'Lifetime Value'}</th>
                      <th className="py-4 px-6 text-right">{isArabic ? 'تواصل مباشر' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B08D57]/15 dark:divide-[#B08D57]/20">
                    {patronsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                          {isArabic ? 'لا يوجد عملاء مسجلين حالياً' : 'No patrons in directory'}
                        </td>
                      </tr>
                    ) : (
                      patronsList.map((patron) => (
                        <tr key={patron.id} className="hover:bg-[#F1EADA]/30 dark:hover:bg-[#1C1613]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#6B1D2F] text-[#DFCA9B] font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-[#B08D57]/40 shadow-sm">
                                {patron.name?.charAt(0) || 'P'}
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPatron(patron)}
                                  className="font-semibold text-sm text-[#14110F] dark:text-[#FDFBF7] block hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] underline decoration-[#B08D57]/40 hover:decoration-[#6B1D2F] text-left cursor-pointer transition-colors"
                                  title={isArabic ? 'انقر لعرض سجل طلبات وتفاصيل العميل' : 'View customer history'}
                                >
                                  {patron.name}
                                </button>
                                <span className="text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B]/70 font-mono">
                                  {isArabic ? `عضو منذ ${patron.registeredAt || '2026'}` : `Member since ${patron.registeredAt || '2026'}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-mono text-xs block text-[#14110F] dark:text-[#FDFBF7]">
                              {patron.phone || '—'}
                            </span>
                            {patron.email && (
                              <span className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70 block truncate max-w-xs">
                                {patron.email}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-[#3A332D] dark:text-[#FDFBF7]/80">
                            <span className="block font-medium">{patron.governorate || 'Cairo'}</span>
                            <span className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70 block truncate max-w-xs">
                              {patron.city ? `${patron.city}, ` : ''}{patron.address || ''}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedPatron(patron)}
                                className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#B08D57]/20 hover:bg-[#6B1D2F] text-[#8C6E3D] hover:text-white dark:text-[#DFCA9B] dark:hover:text-white font-bold cursor-pointer transition-colors flex items-center gap-1"
                                title={isArabic ? 'عرض كافة طلبات هذا العميل' : 'View orders history'}
                              >
                                <span>{patron.totalOrders} {isArabic ? 'طلبات' : 'orders'}</span>
                                <ExternalLink size={10} />
                              </button>
                            </td>

                          <td className="py-4 px-4 font-mono font-bold text-sm text-[#6B1D2F] dark:text-[#DFCA9B]">
                            {patron.totalSpent.toLocaleString()} EGP
                          </td>

                          <td className="py-4 px-6 text-right">
                            {patron.phone ? (
                              <a
                                href={`https://wa.me/20${normalizePhone(patron.phone).replace(/^0/, '')}?text=${encodeURIComponent(
                                  `مرحباً ${patron.name}، نتشرف بالتواصل معك من دار لوفينوس للعطور والمستحضرات الملكية.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-all shadow-sm"
                              >
                                <MessageCircle size={13} />
                                <span>{isArabic ? 'محادثة واتساب' : 'WhatsApp'}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-stone-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COUPONS & PROMO CODES MANAGEMENT (Requested by user) */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              {/* Header and Add Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F1EADA]/60 dark:bg-[#161210] p-4 rounded-2xl border border-[#B08D57]/25 dark:border-[#B08D57]/30">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${isArabic ? 'right-3' : 'left-3'} text-[#B08D57]`} />
                  <input
                    type="text"
                    placeholder={isArabic ? 'بحث بكود الخصم أو الوصف...' : 'Search coupons by code...'}
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    className={`w-full py-2 ${isArabic ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-full bg-[#FDFBF7] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/30 text-xs focus:outline-none focus:border-[#6B1D2F] dark:focus:border-[#B08D57]`}
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="text-xs text-[#8C6E3D] dark:text-[#DFCA9B]">
                    {coupons.length} {isArabic ? 'كوبونات نشطة ومحفوظة' : 'Coupons in System'}
                  </span>
                  <button
                    onClick={openAddCouponModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-[#FDFBF7] transition-all text-xs uppercase tracking-wider font-medium shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{isArabic ? 'إضافة كود خصم جديد' : 'New Promo Code'}</span>
                  </button>
                </div>
              </div>

              {/* Coupons Table */}
              <div className="bg-[#FDFBF7] dark:bg-[#14100E] rounded-3xl border border-[#B08D57]/25 dark:border-[#B08D57]/30 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F1EADA]/70 dark:bg-[#1C1613] border-b border-[#B08D57]/20 dark:border-[#B08D57]/30 text-[#8C6E3D] dark:text-[#DFCA9B] uppercase tracking-wider font-display">
                        <th className="py-4 px-6">{isArabic ? 'كود الخصم (Code)' : 'Coupon Code'}</th>
                        <th className="py-4 px-4">{isArabic ? 'نوع وقيمة الخصم' : 'Discount Value'}</th>
                        <th className="py-4 px-4">{isArabic ? 'الحد الأدنى للطلب' : 'Min Order'}</th>
                        <th className="py-4 px-4">{isArabic ? 'مرات الاستخدام' : 'Usage / Limit'}</th>
                        <th className="py-4 px-4">{isArabic ? 'الحالة' : 'Status'}</th>
                        <th className="py-4 px-6 text-right">{isArabic ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#B08D57]/15 dark:divide-[#B08D57]/20">
                      {coupons.filter((c) => !couponSearch || c.code.toLowerCase().includes(couponSearch.toLowerCase()) || (c.description && c.description.toLowerCase().includes(couponSearch.toLowerCase()))).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                            {isArabic ? 'لا توجد أكواد خصم مطابقة للبحث' : 'No coupons match your search'}
                          </td>
                        </tr>
                      ) : (
                        coupons
                          .filter((c) => !couponSearch || c.code.toLowerCase().includes(couponSearch.toLowerCase()) || (c.description && c.description.toLowerCase().includes(couponSearch.toLowerCase())))
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-[#F1EADA]/30 dark:hover:bg-[#1C1613]/50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#6B1D2F]/10 dark:bg-[#6B1D2F]/20 text-[#6B1D2F] dark:text-[#DFCA9B] flex items-center justify-center shrink-0 border border-[#B08D57]/30">
                                    <Tag size={14} />
                                  </div>
                                  <div>
                                    <span className="font-mono font-bold text-sm tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B] block">
                                      {c.code}
                                    </span>
                                    {c.description && (
                                      <span className="text-[11px] text-stone-500 block truncate max-w-xs">
                                        {c.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <span className="font-bold text-sm text-[#14110F] dark:text-[#FDFBF7]">
                                  {c.type === 'percent' ? `${c.value}% خصم` : `${c.value.toLocaleString()} ج.م خصم ثابت`}
                                </span>
                              </td>

                              <td className="py-4 px-4 font-mono text-[#3A332D] dark:text-[#FDFBF7]/80">
                                {c.min_order > 0 ? `${c.min_order.toLocaleString()} EGP` : (isArabic ? 'بدون حد أدنى' : 'No Minimum')}
                              </td>

                              <td className="py-4 px-4 font-mono">
                                <span className="px-2 py-0.5 rounded-full bg-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B] text-[10px] font-bold">
                                  {c.used_count || 0} {c.max_uses ? `/ ${c.max_uses}` : ''} {isArabic ? 'مرة' : 'used'}
                                </span>
                              </td>

                              <td className="py-4 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCouponActive(c)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold cursor-pointer transition-all ${
                                    c.is_active
                                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-300 dark:border-stone-700'
                                  }`}
                                  title={isArabic ? 'انقر لتفعيل أو تعطيل الكود' : 'Toggle active'}
                                >
                                  {c.is_active ? (isArabic ? 'مُفعّل' : 'Active') : (isArabic ? 'معطّل' : 'Disabled')}
                                </button>
                              </td>

                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditCouponModal(c)}
                                    title={isArabic ? 'تعديل الكود' : 'Edit Coupon'}
                                    className="p-2 rounded-full border border-[#B08D57]/30 text-[#14110F] dark:text-[#FDFBF7] hover:border-[#6B1D2F] hover:bg-[#6B1D2F] hover:text-[#FDFBF7] transition-all cursor-pointer"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCoupon(c.id)}
                                    title={isArabic ? 'حذف الكود' : 'Delete Coupon'}
                                    className="p-2 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIAL INSIGHTS & REAL STATS */}
          {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/25 dark:border-[#B08D57]/30 space-y-2">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold block">
                  {isArabic ? 'إجمالي المبيعات النشطة' : 'Total Active Revenue'}
                </span>
                <h4 className="text-3xl font-serif font-light text-[#14110F] dark:text-[#FDFBF7]">
                  {totalRevenue.toLocaleString()}{' '}
                  <span className="text-sm font-sans text-[#8C6E3D] dark:text-[#DFCA9B]">EGP</span>
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {isArabic
                    ? `منها ${deliveredRevenue.toLocaleString()} ج.م تم تسليمها وتحصيلها`
                    : `${deliveredRevenue.toLocaleString()} EGP collected from delivered`}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/25 dark:border-[#B08D57]/30 space-y-2">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold block">
                  {isArabic ? 'إجمالي عدد الطلبات' : 'Total Orders Placed'}
                </span>
                <h4 className="text-3xl font-serif font-light text-[#14110F] dark:text-[#FDFBF7]">
                  {orders.length}{' '}
                  <span className="text-sm font-sans text-[#8C6E3D] dark:text-[#DFCA9B]">
                    {isArabic ? 'أوردر' : 'orders'}
                  </span>
                </h4>
                <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                  {isArabic ? `متوسط قيمة الأوردر: ${avgOrderValue.toLocaleString()} ج.م` : `Average ticket: ${avgOrderValue.toLocaleString()} EGP`}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/25 dark:border-[#B08D57]/30 space-y-2">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold block">
                  {isArabic ? 'قيمة بضاعة المخزون بالتجزئة' : 'Total Inventory Value'}
                </span>
                <h4 className="text-3xl font-serif font-light text-[#14110F] dark:text-[#FDFBF7]">
                  {totalCatalogValue.toLocaleString()}{' '}
                  <span className="text-sm font-sans text-[#8C6E3D] dark:text-[#DFCA9B]">EGP</span>
                </h4>
                <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                  {isArabic ? `عبر ${products.length} إبداع في الكتالوج` : `Across ${products.length} catalog items`}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-[#F1EADA]/50 dark:bg-[#161210] border border-[#B08D57]/25 dark:border-[#B08D57]/30 space-y-2">
                <span className="text-[10px] tracking-widest uppercase text-[#B08D57] font-semibold block">
                  {isArabic ? 'قاعدة العملاء المسجلين' : 'Patron Directory Base'}
                </span>
                <h4 className="text-3xl font-serif font-light text-[#14110F] dark:text-[#FDFBF7]">
                  {patronsList.length}{' '}
                  <span className="text-sm font-sans text-[#8C6E3D] dark:text-[#DFCA9B]">
                    {isArabic ? 'عميل' : 'patrons'}
                  </span>
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {isArabic ? 'عملاء حقيقيون بأرقام هواتف موثقة' : 'Verified Egyptian contacts'}
                </p>
              </div>
            </div>

            {/* Status Breakdown & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#14100E] border border-[#B08D57]/30 shadow-sm space-y-4">
                <h4 className="font-serif text-lg text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'توزيع الطلبات حسب المرحلة' : 'Orders Fulfillment Pipeline'}
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between py-1">
                      <span className="text-amber-800 dark:text-amber-300 font-medium">
                        {isArabic ? 'قيد التجهيز والختم (Processing)' : 'Processing in Atelier'}
                      </span>
                      <span className="font-mono font-bold">{countProcessing}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-amber-100 dark:bg-amber-950/40 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${orders.length ? (countProcessing / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between py-1">
                      <span className="text-blue-800 dark:text-blue-300 font-medium">
                        {isArabic ? 'في طريق الشحن (Shipped)' : 'Shipped with Courier'}
                      </span>
                      <span className="font-mono font-bold">{countShipped}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-blue-100 dark:bg-blue-950/40 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${orders.length ? (countShipped / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between py-1">
                      <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                        {isArabic ? 'تم التسليم بنجاح (Delivered)' : 'Delivered to Patron'}
                      </span>
                      <span className="font-mono font-bold">{countDelivered}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-100 dark:bg-emerald-950/40 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${orders.length ? (countDelivered / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between py-1">
                      <span className="text-red-800 dark:text-red-300 font-medium">
                        {isArabic ? 'ملغي (Cancelled)' : 'Cancelled'}
                      </span>
                      <span className="font-mono font-bold">{countCancelled}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-red-100 dark:bg-red-950/40 overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${orders.length ? (countCancelled / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products Leaderboard */}
              <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#14100E] border border-[#B08D57]/30 shadow-sm space-y-4">
                <h4 className="font-serif text-lg text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'المنتجات الأكثر مبيعاً وتحقيقاً للإيراد' : 'Top Performing Creations'}
                </h4>
                <div className="divide-y divide-[#B08D57]/15 text-xs">
                  {topSellingList.length === 0 ? (
                    <p className="py-6 text-center text-stone-400">
                      {isArabic ? 'لا توجد بيانات مبيعات كافية حتى الآن' : 'No sales recorded yet'}
                    </p>
                  ) : (
                    topSellingList.map(([title, stats], i) => (
                      <div key={title} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B] font-mono font-bold text-xs flex items-center justify-center">
                            #{i + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-sm text-[#14110F] dark:text-[#FDFBF7] block">
                              {title}
                            </span>
                            <span className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                              {stats.count} {isArabic ? 'مرات طلب' : 'times commissioned'}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[#6B1D2F] dark:text-[#DFCA9B]">
                          {stats.revenue.toLocaleString()} EGP
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY CENTER & ANTI-HACKING FIREWALL */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Active Defense Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
                    {isArabic ? 'جلسات HttpOnly المشفرة' : 'HMAC-SHA256 Sessions'}
                  </span>
                  <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? `نشط · دورة رقم #${securityData?.sessionEpoch || 1}` : `Active · Epoch #${securityData?.sessionEpoch || 1}`}
                </h4>
                <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                  {isArabic ? 'توقيع رقمي غير قابل للتزوير أو السرقة عبر المتصفح' : 'Tamper-proof server cookies isolated from JS'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#B08D57] font-bold">
                    {isArabic ? 'حماية التخمين (Brute-Force)' : 'Brute-Force Lockout'}
                  </span>
                  <Lock size={18} className="text-[#6B1D2F] dark:text-[#DFCA9B]" />
                </div>
                <h4 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7]">
                  {securityData?.activeLockouts?.length || 0} {isArabic ? 'حظر مؤقت نشط' : 'Active Lockouts'}
                </h4>
                <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                  {isArabic ? 'إغلاق تلقائي 15 دقيقة بعد 5 محاولات خاطئة' : 'Auto 15-min lock after 5 failed attempts'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-[#B08D57]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[#B08D57] font-bold">
                    {isArabic ? 'جدار الحماية و CSRF / XSS' : 'Edge WAF & Headers'}
                  </span>
                  <Shield size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7]">
                  {isArabic ? 'مُفعّل بالكامل (CSP + WAF)' : 'Enforced (CSP + CSRF)'}
                </h4>
                <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                  {isArabic ? 'منع فحص الثغرات، الحقن، وتزوير الطلبات' : 'Blocks probes, XSS, SQLi & cross-origin mutations'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#F1EADA]/60 dark:bg-[#161210] border border-red-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-red-700 dark:text-red-400 font-bold">
                    {isArabic ? 'قائمة الحظر الدائمة' : 'Firewall Blocklist'}
                  </span>
                  <Ban size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <h4 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7]">
                  {securityData?.blockedIps?.length || 0} {isArabic ? 'عنوان محظور' : 'Blocked IPs'}
                </h4>
                <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                  {isArabic ? 'منع فوري لعناوين IP المشبوهة من الوصول' : 'Hard block on banned network addresses'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rotate Master Access Key & Panic Session Reset */}
              <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#14100E] border border-[#B08D57]/30 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-3">
                  <div>
                    <h4 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'تغيير مفتاح المرور السري (Master Key)' : 'Rotate Admin Master Key'}
                    </h4>
                    <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                      {isArabic
                        ? 'يتم التشفير بخوارزمية scrypt مع ملح عشوائي وإنهاء كافة الجلسات المفتوحة'
                        : 'Hashed via salted scrypt; rotates session epoch immediately'}
                    </p>
                  </div>
                  <KeyRound size={20} className="text-[#B08D57]" />
                </div>

                <form onSubmit={handleRotateMasterKey} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                      {isArabic ? 'مفتاح المرور الحالي' : 'Current Master Key'}
                    </label>
                    <input
                      type="password"
                      required
                      value={currentKeyInput}
                      onChange={(e) => setCurrentKeyInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                      placeholder="••••••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                        {isArabic ? 'المفتاح الجديد (10+ أحرف مختلطة)' : 'New Master Key (10+ mixed chars)'}
                      </label>
                      <input
                        type="password"
                        required
                        minLength={10}
                        value={newKeyInput}
                        onChange={(e) => setNewKeyInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                        placeholder="Aa123456!@"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                        {isArabic ? 'تأكيد المفتاح الجديد' : 'Confirm New Key'}
                      </label>
                      <input
                        type="password"
                        required
                        minLength={10}
                        value={confirmNewKeyInput}
                        onChange={(e) => setConfirmNewKeyInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>

                  {keyChangeMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        keyChangeMsg.type === 'ok'
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {keyChangeMsg.text}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-white text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                    >
                      {isArabic ? 'حفظ وتحديث المفتاح' : 'Rotate Master Key'}
                    </button>

                    <button
                      type="button"
                      onClick={handleRevokeAllSessions}
                      className="px-4 py-2.5 rounded-full border border-red-400/50 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white text-xs font-medium cursor-pointer transition-colors"
                    >
                      {isArabic ? 'طرد كافة الجلسات الأخرى فوراً' : 'Revoke All Other Sessions'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Manual IP Blocklist */}
              <div className="p-6 rounded-3xl bg-[#FDFBF7] dark:bg-[#14100E] border border-[#B08D57]/30 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-3">
                  <div>
                    <h4 className="font-serif text-xl text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'إدارة حظر عناوين الشبكة (IP Firewall)' : 'IP Access Blocklist'}
                    </h4>
                    <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                      {isArabic ? 'منع أي عنوان IP مريب من استخدام الـ API أو الدخول' : 'Block suspicious IPs across all endpoints'}
                    </p>
                  </div>
                  <Ban size={20} className="text-red-500" />
                </div>

                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={ipBlockInput}
                    onChange={(e) => setIpBlockInput(e.target.value)}
                    placeholder="e.g. 192.168.1.50"
                    className="flex-1 p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleBlockIp(ipBlockInput)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium cursor-pointer transition-colors shrink-0"
                  >
                    {isArabic ? 'حظر IP' : 'Block IP'}
                  </button>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {(!securityData?.blockedIps || securityData.blockedIps.length === 0) ? (
                    <p className="text-xs text-stone-400 text-center py-6">
                      {isArabic ? 'لا توجد عناوين IP محظورة حالياً' : 'No blocked IPs in firewall'}
                    </p>
                  ) : (
                    securityData.blockedIps.map((ipAddr) => (
                      <div
                        key={ipAddr}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F1EADA]/40 dark:bg-[#1C1613] border border-red-500/20 text-xs"
                      >
                        <span className="font-mono font-semibold text-red-700 dark:text-red-300">{ipAddr}</span>
                        <button
                          type="button"
                          onClick={() => handleUnblockIp(ipAddr)}
                          className="text-[11px] px-3 py-1 rounded-full border border-stone-300 dark:border-stone-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                        >
                          {isArabic ? 'رفع الحظر' : 'Unblock'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Live Security Audit Logs */}
            <div className="bg-[#FDFBF7] dark:bg-[#14100E] rounded-3xl border border-[#B08D57]/30 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-[#B08D57]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F1EADA]/50 dark:bg-[#161210]">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert size={18} className="text-[#6B1D2F] dark:text-[#DFCA9B]" />
                  <div>
                    <h4 className="font-serif text-lg text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'سجل الحماية ومحاولات الاختراق المباشر' : 'Live Security Audit Logs'}
                    </h4>
                    <span className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70">
                      {isArabic ? 'يتم تسجيل كل محاولة دخول، حظر، أو تلاعب بالطلبات لحظياً' : 'Real-time intrusion and authentication events'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshSecurity}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#B08D57]/40 text-xs hover:bg-[#B08D57]/15 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>{isArabic ? 'تحديث' : 'Refresh'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSecurityLogs}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>{isArabic ? 'مسح السجل' : 'Clear Logs'}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1EADA]/40 dark:bg-[#1C1613] border-b border-[#B08D57]/20 text-[#8C6E3D] dark:text-[#DFCA9B] uppercase tracking-wider font-display">
                      <th className="py-3 px-4">{isArabic ? 'المستوى' : 'Severity'}</th>
                      <th className="py-3 px-4">{isArabic ? 'الحدث' : 'Event'}</th>
                      <th className="py-3 px-4">{isArabic ? 'عنوان الشبكة' : 'IP'}</th>
                      <th className="py-3 px-4">{isArabic ? 'التفاصيل والمسار' : 'Details'}</th>
                      <th className="py-3 px-4 text-right">{isArabic ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B08D57]/15">
                    {(!securityData?.logs || securityData.logs.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-stone-400">
                          {isArabic ? 'لا توجد تنبيهات أمنية مسجلة حتى الآن' : 'No security alerts logged yet'}
                        </td>
                      </tr>
                    ) : (
                      securityData.logs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#F1EADA]/25 dark:hover:bg-[#1C1613]/50">
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.severity === 'critical'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                  : log.severity === 'warning'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-[#14110F] dark:text-[#FDFBF7]">
                            <span>{log.event}</span>
                            <span className="block text-[10px] text-stone-400 font-normal">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[#6B1D2F] dark:text-[#DFCA9B]">
                            {log.ip}
                          </td>
                          <td className="py-3 px-4 text-[#3A332D] dark:text-[#FDFBF7]/80">
                            <span className="block font-medium">{log.details}</span>
                            <span className="text-[10px] font-mono text-stone-400">{log.path}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.ip && log.ip !== '127.0.0.1' && !securityData.blockedIps.includes(log.ip) && (
                              <button
                                type="button"
                                onClick={() => handleBlockIp(log.ip)}
                                className="px-2.5 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-600 hover:text-white text-[10px] cursor-pointer transition-colors"
                              >
                                {isArabic ? 'حظر' : 'Ban IP'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE PRODUCT MODAL: ADD / EDIT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFBF7] dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-[#B08D57]/40 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-4">
              <div>
                <h3 className="font-serif text-2xl text-[#14110F] dark:text-[#FDFBF7]">
                  {modalMode === 'add'
                    ? isArabic ? 'إضافة منتج أو عطر جديد للدار' : 'Add New Maison Creation'
                    : isArabic ? `تعديل شامل للمنتج: ${productForm.name_ar}` : `Edit Creation: ${productForm.name_en}`}
                </h3>
                <p className="text-xs text-[#8C6E3D] dark:text-[#DFCA9B]/80 italic">
                  {isArabic
                    ? 'تحكم كامل في الأسعار، الأحجام، الوصف، الصور، والتقييمات'
                    : 'Manage pricing, variants, story, photography, and customer reviews'}
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#F1EADA] dark:hover:bg-[#1C1613] text-[#14110F]/70 dark:text-[#FDFBF7]/70"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Inner Tabs */}
            <div className="flex items-center gap-2 border-b border-[#B08D57]/20 pb-2">
              <button
                type="button"
                onClick={() => setModalActiveTab('details')}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium cursor-pointer ${
                  modalActiveTab === 'details'
                    ? 'bg-[#6B1D2F] text-white'
                    : 'bg-[#F1EADA] dark:bg-[#1C1613] text-[#8C6E3D] dark:text-[#DFCA9B]'
                }`}
              >
                {isArabic ? 'البيانات والوصف' : 'General & Story'}
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab('variants')}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium cursor-pointer ${
                  modalActiveTab === 'variants'
                    ? 'bg-[#6B1D2F] text-white'
                    : 'bg-[#F1EADA] dark:bg-[#1C1613] text-[#8C6E3D] dark:text-[#DFCA9B]'
                }`}
              >
                {isArabic ? `الأحجام والأسعار (${productForm.variants.length})` : `Variants & Sizes (${productForm.variants.length})`}
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab('images')}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium cursor-pointer ${
                  modalActiveTab === 'images'
                    ? 'bg-[#6B1D2F] text-white'
                    : 'bg-[#F1EADA] dark:bg-[#1C1613] text-[#8C6E3D] dark:text-[#DFCA9B]'
                }`}
              >
                {isArabic ? 'الصور والمظهر' : 'Images & Assets'}
              </button>
              <button
                type="button"
                onClick={() => setModalActiveTab('reviews')}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium cursor-pointer ${
                  modalActiveTab === 'reviews'
                    ? 'bg-[#6B1D2F] text-white'
                    : 'bg-[#F1EADA] dark:bg-[#1C1613] text-[#8C6E3D] dark:text-[#DFCA9B]'
                }`}
              >
                {isArabic ? `التقييمات والكومنتات (${productForm.reviews.length})` : `Reviews & Comments (${productForm.reviews.length})`}
              </button>
                          <button
                type="button"
                onClick={() => setModalActiveTab('notes' as any)}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-medium cursor-pointer ${
                  (modalActiveTab as any) === 'notes'
                    ? 'bg-[#6B1D2F] text-white'
                    : 'bg-[#F1EADA] dark:bg-[#1C1613] text-[#8C6E3D] dark:text-[#DFCA9B]'
                }`}
              >
                {isArabic ? 'النوتات والثبات والفوحان' : 'Notes & Performance'}
              </button>
            </div>

            <form onSubmit={handleProductFormSubmit} className="space-y-6 text-xs">
              {/* TAB 1: DETAILS & DESCRIPTION */}
              {modalActiveTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                        Title (EN)
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name_en}
                        onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                        placeholder="e.g. La Fleur du Nil"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                        اسم المنتج بالعربية
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name_ar}
                        onChange={(e) => setProductForm({ ...productForm, name_ar: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                        placeholder="مثال: زهرة النيل"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                        الخط / القسم (Category)
                      </label>
                      <select
                        value={productForm.category_slug}
                        onChange={(e) => setProductForm({ ...productForm, category_slug: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name_ar} ({c.name_en})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                        نوع المنتج (Type)
                      </label>
                      <select
                        value={productForm.product_type}
                        onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] cursor-pointer"
                      >
                        <option value="perfume">عطر (Perfume)</option>
                        <option value="lipgloss">ليب غلوس وكوتور الشفاه (Lip Gloss)</option>
                        <option value="skincare">عناية بالبشرة والشفاه (Skincare)</option>
                        <option value="mist">بدي اسبلاش ومعطر شعر (Body Splash & Mist)</option>
                        <option value="coffret">صندوق استكشاف وهدايا (Discovery Coffret)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                        التركيز (Concentration)
                      </label>
                      <input
                        type="text"
                        value={productForm.concentration}
                        onChange={(e) => setProductForm({ ...productForm, concentration: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                        placeholder="e.g. Extrait de Parfum (35%)"
                      />
                    </div>
                  </div>

                  {/* Homepage Featured Toggle */}
                  <div className="p-4 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#1C1613] border border-[#B08D57]/30 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-[#14110F] dark:text-[#FDFBF7] block">
                        {isArabic ? 'العرض في واجهة الصفحة الرئيسية (Homepage Showcase)' : 'Showcase on Homepage'}
                      </span>
                      <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                        {isArabic
                          ? 'تفعيل ظهور هذا المنتج في استعراض المجموعة الكاملة أول الصفحة الرئيسية'
                          : 'Feature this product in the signature collection on the front page'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.featured_on_home}
                        onChange={(e) => setProductForm({ ...productForm, featured_on_home: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B1D2F]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                      الوصف القصير (Tagline AR)
                    </label>
                    <input
                      type="text"
                      value={productForm.tagline_ar}
                      onChange={(e) => setProductForm({ ...productForm, tagline_ar: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                      placeholder="وصف شعري قصير جذاب"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                      قصة المنتج والوصف الكامل (Story / Description AR)
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.story_ar}
                      onChange={(e) => setProductForm({ ...productForm, story_ar: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                      placeholder="التفاصيل الكاملة للمنتج ومكوناته..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DYNAMIC SIZES & VARIANTS (Any count, even single size!) */}
              {modalActiveTab === 'variants' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? 'أحجام وأسعار المنتج' : 'Product Sizing & Pricing Variants'}
                      </h4>
                      <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                        {isArabic
                          ? 'يمكنك وضع حجم واحد فقط (مثل ليب غلوس 15مل أو بدي اسبلاش 150مل)، أو عدة أحجام'
                          : 'Configure a single size (e.g. 15ml lip gloss, 150ml splash) or multiple sizes'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B08D57] text-[#14110F] font-bold text-xs hover:bg-[#8C6E3D] hover:text-white transition-all cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{isArabic ? 'إضافة حجم آخر' : 'Add Size'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {productForm.variants.map((v, idx) => (
                      <div
                        key={v.id || idx}
                        className="p-4 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#1C1613] border border-[#B08D57]/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#6B1D2F] dark:text-[#DFCA9B]">
                            {isArabic ? `الحجم #${idx + 1}` : `Variant #${idx + 1}`}
                          </span>
                          {productForm.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              className="text-red-600 hover:text-red-700 p-1 cursor-pointer"
                              title="حذف هذا الحجم"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                              الحجم (ml)
                            </label>
                            <input
                              type="number"
                              required
                              value={v.size_ml}
                              onChange={(e) => handleUpdateVariant(idx, 'size_ml', Number(e.target.value))}
                              className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                              placeholder="50"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                              السعر (EGP)
                            </label>
                            <input
                              type="number"
                              required
                              value={v.price}
                              onChange={(e) => handleUpdateVariant(idx, 'price', Number(e.target.value))}
                              className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                              placeholder="3600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                              سعر المقارنة قبل الخصم
                            </label>
                            <input
                              type="number"
                              value={v.compare_at_price || ''}
                              onChange={(e) =>
                                handleUpdateVariant(idx, 'compare_at_price', e.target.value ? Number(e.target.value) : null)
                              }
                              className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                              placeholder="اختياري"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                              المخزون المتاح (Stock)
                            </label>
                            <input
                              type="number"
                              required
                              value={v.stock}
                              onChange={(e) => handleUpdateVariant(idx, 'stock', Number(e.target.value))}
                              className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                              placeholder="25"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                              تسمية الحجم بالعربية (Display Label)
                            </label>
                            <input
                              type="text"
                              value={v.name_ar || ''}
                              onChange={(e) => handleUpdateVariant(idx, 'name_ar', e.target.value)}
                              className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7]"
                              placeholder="مثال: ٥٠ مل القارورة التوقيعية"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                              كود التتبع (SKU)
                            </label>
                            <input
                              type="text"
                              value={v.sku || ''}
                              onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                              className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                              placeholder="LV-SKU-50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: IMAGES & VISUAL ASSETS */}
              {modalActiveTab === 'images' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                      رابط صورة الزجاجة / المنتج الرئيسية (Bottle Image URL)
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.images.bottle}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          images: { ...productForm.images, bottle: e.target.value, hero: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                    />
                  </div>

                  {/* Preset Quick Images */}
                  <div className="p-3 rounded-2xl bg-[#F1EADA]/40 dark:bg-[#1C1613] border border-[#B08D57]/20 space-y-2">
                    <span className="font-semibold text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B] block">
                      {isArabic ? 'صور فاخرة جاهزة بلمسة واحدة:' : 'One-Click Luxury Presets:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            images: {
                              ...productForm.images,
                              bottle: '/images/products/la-fleur-du-nil-bottle.jpg',
                              hero: '/images/products/la-fleur-du-nil-bottle.jpg',
                            },
                          })
                        }
                        className="px-3 py-1 rounded-full bg-white dark:bg-[#14100E] border border-[#B08D57]/40 text-[10px] hover:border-[#6B1D2F] cursor-pointer"
                      >
                        قارورة عطر زجاجية فاخرة
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            images: {
                              ...productForm.images,
                              bottle: '/images/products/packaging-mockup.jpg',
                              hero: '/images/products/packaging-mockup.jpg',
                            },
                          })
                        }
                        className="px-3 py-1 rounded-full bg-white dark:bg-[#14100E] border border-[#B08D57]/40 text-[10px] hover:border-[#6B1D2F] cursor-pointer"
                      >
                        صندوق ورنيشي أسود فاخر
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            images: {
                              ...productForm.images,
                              bottle: '/images/brand/NEW_brand-identity.png',
                              hero: '/images/brand/NEW_brand-identity.png',
                            },
                          })
                        }
                        className="px-3 py-1 rounded-full bg-white dark:bg-[#14100E] border border-[#B08D57]/40 text-[10px] hover:border-[#6B1D2F] cursor-pointer"
                      >
                        هوية لوفينوس الملكية
                      </button>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1C1613] border border-[#B08D57]/30">
                    <div className="w-24 h-24 rounded-xl border border-[#B08D57]/40 overflow-hidden relative shrink-0 bg-[#F1EADA] dark:bg-[#14100E]">
                      <img
                        src={productForm.images.bottle}
                        alt="Preview"
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          (e.target as any).src = '/images/products/packaging-mockup.jpg';
                        }}
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-xs block text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? 'معاينة الصورة المعتمدة' : 'Image Preview'}
                      </span>
                      <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/70 mt-1">
                        تظهر هذه الصورة كعنصر رئيسي في المتجر، السلة، وتفاصيل المنتج.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: REVIEWS & COMMENTS (New Requested Feature) */}
              {modalActiveTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#1C1613] border border-[#B08D57]/30 space-y-3">
                    <span className="font-semibold text-xs text-[#14110F] dark:text-[#FDFBF7] block">
                      {isArabic ? 'إضافة تقييم أو كومنت جديد للمنتج' : 'Add New Customer Review / Comment'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                          اسم العميل
                        </label>
                        <input
                          type="text"
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7]"
                          placeholder="مثال: ياسمين المنشاوي"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                          التقييم (النجوم)
                        </label>
                        <select
                          value={newReviewRating}
                          onChange={(e) => setNewReviewRating(Number(e.target.value))}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] cursor-pointer"
                        >
                          <option value={5}>★★★★★ (5 Stars)</option>
                          <option value={4}>★★★★☆ (4 Stars)</option>
                          <option value={3}>★★★☆☆ (3 Stars)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] uppercase mb-1">
                        نص التعليق / الكومنت
                      </label>
                      <textarea
                        rows={2}
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[#B08D57]/40 bg-white dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7]"
                        placeholder="اكتب تجربة العميل ورأيه هنا..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddReview}
                      className="px-4 py-2 rounded-full bg-[#6B1D2F] text-white font-medium text-xs hover:bg-[#8A1D2E] transition-all cursor-pointer"
                    >
                      {isArabic ? 'إدراج التقييم للمنتج' : 'Insert Review'}
                    </button>
                  </div>

                  {/* Existing Reviews List */}
                  <div className="space-y-2">
                    <span className="font-semibold text-xs text-[#8C6E3D] dark:text-[#DFCA9B] block">
                      {isArabic
                        ? `التقييمات المعتمدة الحالية (${productForm.reviews.length}):`
                        : `Current Customer Reviews (${productForm.reviews.length}):`}
                    </span>
                    {productForm.reviews.length === 0 ? (
                      <p className="p-4 text-center text-stone-400 text-xs">
                        {isArabic ? 'لا توجد تقييمات مضافة لهذا المنتج بعد' : 'No reviews added yet'}
                      </p>
                    ) : (
                      productForm.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3 rounded-xl bg-white dark:bg-[#1C1613] border border-[#B08D57]/20 flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#14110F] dark:text-[#FDFBF7]">{rev.name}</span>
                              <div className="flex items-center text-amber-400">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} size={11} className="fill-amber-400" />
                                ))}
                              </div>
                              <span className="text-[10px] text-stone-400 font-mono">{rev.date}</span>
                            </div>
                            <p className="text-[11px] text-[#3A332D] dark:text-[#FDFBF7]/80 mt-1 leading-relaxed">
                              {isArabic ? rev.body_ar || rev.body_en : rev.body_en}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                            title="حذف التقييم"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB: OLFACTORY NOTES & PERFORMANCE (Requested by user) */}
              {(modalActiveTab as any) === 'notes' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#1C1613] border border-[#B08D57]/30 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? 'تقييم الأداء (الثبات والفوحان والتركيز)' : 'Performance Ratings (1 - 10)'}
                      </h4>
                      <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                        {isArabic
                          ? 'حدد درجة ثبات العطر وقوة انتشاره وفوحانه لتظهر للعميل في شريط الأداء بصفحة المنتج'
                          : 'Set longevity and sillage meters displayed on the product page'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#14100E] border border-[#B08D57]/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-semibold text-[#14110F] dark:text-[#FDFBF7]">
                            {isArabic ? 'درجة الثبات (Longevity):' : 'Longevity:'}
                          </label>
                          <span className="font-mono font-bold text-sm text-[#6B1D2F] dark:text-[#DFCA9B]">
                            {productForm.longevity}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={10}
                          value={productForm.longevity}
                          onChange={(e) => setProductForm({ ...productForm, longevity: Number(e.target.value) })}
                          className="w-full accent-[#6B1D2F] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                          <span>5/10 (متوسط)</span>
                          <span>8/10 (ثبات يوم كامل)</span>
                          <span>10/10 (ثبات ملكي فائق)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#14100E] border border-[#B08D57]/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[11px] font-semibold text-[#14110F] dark:text-[#FDFBF7]">
                            {isArabic ? 'قوة الفوحان والانتشار (Sillage):' : 'Sillage:'}
                          </label>
                          <span className="font-mono font-bold text-sm text-[#6B1D2F] dark:text-[#DFCA9B]">
                            {productForm.sillage}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={10}
                          value={productForm.sillage}
                          onChange={(e) => setProductForm({ ...productForm, sillage: Number(e.target.value) })}
                          className="w-full accent-[#6B1D2F] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                          <span>5/10 (هادئ وحميمي)</span>
                          <span>8/10 (فوحان ملحوظ)</span>
                          <span>10/10 (هالة عطرية طاغية)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Pyramid Inputs */}
                  <div className="p-4 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#1C1613] border border-[#B08D57]/30 space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-[#14110F] dark:text-[#FDFBF7]">
                        {isArabic ? 'الهرم العطري والنوتات (قمة، قلب، وقاعدة العطر)' : 'Olfactory Pyramid Notes'}
                      </h4>
                      <p className="text-[11px] text-[#8C6E3D] dark:text-[#DFCA9B]/80">
                        {isArabic ? 'اكتب المكونات مفصولة بفواصل (مثال: برغموت، فانيليا، عنبر)' : 'Enter ingredients separated by commas'}
                      </p>
                    </div>

                    {/* Top Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-[#14100E] border border-[#B08D57]/20">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                          قمة العطر - الافتتاحية (بالعربية)
                        </label>
                        <input
                          type="text"
                          value={productForm.top_notes_ar}
                          onChange={(e) => setProductForm({ ...productForm, top_notes_ar: e.target.value })}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/30 bg-transparent text-[#14110F] dark:text-[#FDFBF7]"
                          placeholder="مثال: برغموت صقلي، زهر البرتقال"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                          Top Notes (English)
                        </label>
                        <input
                          type="text"
                          value={productForm.top_notes_en}
                          onChange={(e) => setProductForm({ ...productForm, top_notes_en: e.target.value })}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/30 bg-transparent text-[#14110F] dark:text-[#FDFBF7]"
                          placeholder="e.g. Sicilian Bergamot, Neroli"
                        />
                      </div>
                    </div>

                    {/* Heart Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-[#14100E] border border-[#B08D57]/20">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                          قلب العطر (بالعربية)
                        </label>
                        <input
                          type="text"
                          value={productForm.heart_notes_ar}
                          onChange={(e) => setProductForm({ ...productForm, heart_notes_ar: e.target.value })}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/30 bg-transparent text-[#14110F] dark:text-[#FDFBF7]"
                          placeholder="مثال: ياسمين سامباك، ورد دمشقي"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                          Heart Notes (English)
                        </label>
                        <input
                          type="text"
                          value={productForm.heart_notes_en}
                          onChange={(e) => setProductForm({ ...productForm, heart_notes_en: e.target.value })}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/30 bg-transparent text-[#14110F] dark:text-[#FDFBF7]"
                          placeholder="e.g. Sambac Jasmine, Damask Rose"
                        />
                      </div>
                    </div>

                    {/* Base Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-[#14100E] border border-[#B08D57]/20">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                          قاعدة العطر والارتكاز (بالعربية)
                        </label>
                        <input
                          type="text"
                          value={productForm.base_notes_ar}
                          onChange={(e) => setProductForm({ ...productForm, base_notes_ar: e.target.value })}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/30 bg-transparent text-[#14110F] dark:text-[#FDFBF7]"
                          placeholder="مثال: خشب الصندل، عنبر، مسك نباتي"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                          Base Notes (English)
                        </label>
                        <input
                          type="text"
                          value={productForm.base_notes_en}
                          onChange={(e) => setProductForm({ ...productForm, base_notes_en: e.target.value })}
                          className="w-full p-2 rounded-lg border border-[#B08D57]/30 bg-transparent text-[#14110F] dark:text-[#FDFBF7]"
                          placeholder="e.g. Sandalwood, Golden Ambergris, Musk"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#B08D57]/20">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] uppercase tracking-wider text-xs hover:bg-[#F1EADA] dark:hover:bg-[#1C1613] cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#6B1D2F] text-[#FDFBF7] uppercase tracking-wider text-xs hover:bg-[#8A1D2E] transition-all shadow-md font-medium cursor-pointer"
                >
                  {isArabic ? 'حفظ ونشر التعديلات' : 'Publish & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY / LINE */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#B08D57]/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-4">
              <h3 className="font-serif text-2xl text-[#14110F] dark:text-[#FDFBF7]">
                {editingCategorySlug
                  ? (isArabic ? 'تعديل بيانات خط الإنتاج' : 'Edit Maison Line')
                  : (isArabic ? 'إضافة خط إنتاج جديد للدار' : 'Add New Maison Line')}
              </h3>
              <button
                onClick={() => {
                  setIsAddCategoryOpen(false);
                  setEditingCategorySlug(null);
                }}
                className="p-2 rounded-full hover:bg-[#F1EADA] dark:hover:bg-[#1C1613] text-[#14110F]/70 dark:text-[#FDFBF7]/70 hover:text-[#14110F] dark:hover:text-[#FDFBF7]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    Line Name (EN)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soin Botanique"
                    value={categoryForm.name_en}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    اسم الخط (عربي)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: العناية الفائقة بالبشرة والشفاه"
                    value={categoryForm.name_ar}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name_ar: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                  Tagline (EN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapitre II — Rare Botanical Skincare"
                  value={categoryForm.tagline_en}
                  onChange={(e) => setCategoryForm({ ...categoryForm, tagline_en: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                  شعار الخط (عربي)
                </label>
                <input
                  type="text"
                  placeholder="مثال: الفصل الثاني — إكسيرات نباتية نادرة وغلوس الشفاه"
                  value={categoryForm.tagline_ar}
                  onChange={(e) => setCategoryForm({ ...categoryForm, tagline_ar: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                  الوصف التفصيلي (عربي)
                </label>
                <textarea
                  rows={2}
                  value={categoryForm.description_ar}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description_ar: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                  placeholder="شرح عن هذا الخط ومكوناته الفاخرة..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    {isArabic ? 'ترتيب الظهور' : 'Sort Order'}
                  </label>
                  <input
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                  />
                </div>
                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#6B1D2F] border-[#B08D57]/40 focus:ring-0"
                    />
                    <span className="text-xs font-medium text-[#14110F] dark:text-[#FDFBF7]">
                      {isArabic ? 'تفعيل وظهور في المتجر' : 'Active in Storefront'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#B08D57]/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCategoryOpen(false);
                    setEditingCategorySlug(null);
                  }}
                  className="px-5 py-2.5 rounded-full border border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] uppercase tracking-wider text-xs hover:bg-[#F1EADA] dark:hover:bg-[#1C1613] cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#6B1D2F] text-[#FDFBF7] uppercase tracking-wider text-xs hover:bg-[#8A1D2E] transition-all shadow-md font-medium cursor-pointer"
                >
                  {editingCategorySlug
                    ? (isArabic ? 'تحديث الخط' : 'Update Line')
                    : (isArabic ? 'حفظ الخط الجديد' : 'Save Line')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: ORDER DETAILS (Requested by user: عند النقر على الأوردر تفتح تفاصيله والمنتجات المطلوبة) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#B08D57]/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold block">
                  {isArabic ? 'تفاصيل الطلب والمنتجات' : 'Order Specification'}
                </span>
                <h3 className="font-serif text-2xl text-[#6B1D2F] dark:text-[#DFCA9B] flex items-center gap-2 mt-1">
                  <span>{selectedOrder.id}</span>
                  {selectedOrder.is_new && (
                    <span className="px-2 py-0.5 rounded-full bg-[#6B1D2F] text-white text-[10px] font-bold uppercase animate-pulse">
                      NEW
                    </span>
                  )}
                </h3>
                <span className="text-xs text-stone-500 font-mono mt-0.5 block">{selectedOrder.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full border border-[#B08D57]/30 text-stone-500 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Information Card */}
            <div className="p-4 rounded-2xl bg-[#F1EADA]/50 dark:bg-[#1C1613] border border-[#B08D57]/25 space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] font-semibold block">
                {isArabic ? 'بيانات العميل والتوصيل' : 'Customer & Shipping'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px]">{isArabic ? 'اسم العميل' : 'Customer Name'}</span>
                  <span className="font-bold text-[#14110F] dark:text-[#FDFBF7] text-sm">{selectedOrder.customer}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">{isArabic ? 'رقم الهاتف' : 'Phone'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{selectedOrder.phone}</span>
                    {selectedOrder.phone && (
                      <a
                        href={`https://wa.me/20${normalizePhone(selectedOrder.phone).replace(/^0/, '')}?text=${encodeURIComponent(
                          `مرحباً ${selectedOrder.customer}، نتواصل معك بخصوص طلبك رقم ${selectedOrder.id} من دار لوفينوس.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        title="مراسلة واتساب"
                      >
                        <MessageCircle size={12} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 block text-[10px]">{isArabic ? 'عنوان الشحن وموقع الاستلام' : 'Delivery Address & Location'}</span>
                    {/* Direct Map Button (Requested by user: تظهر عندي أيقونة أدوس عليها يجيبلي الموقع على طول) */}
                    {(selectedOrder.map_url || selectedOrder.map_coords || selectedOrder.gov) && (
                      <a
                        href={selectedOrder.map_url || (selectedOrder.map_coords ? `https://www.google.com/maps?q=${selectedOrder.map_coords.lat},${selectedOrder.map_coords.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOrder.gov + ', Egypt')}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-white text-[11px] font-medium shadow-sm transition-all hover:scale-105 cursor-pointer"
                        title={isArabic ? 'فتح موقع العميل مباشرة على خرائط جوجل' : 'Open Location on Google Maps'}
                      >
                        <MapPin size={13} className="text-[#DFCA9B]" />
                        <span>{isArabic ? 'فتح موقع العميل على الخريطة (Google Maps)' : 'Open in Maps'}</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <span className="font-medium text-[#14110F] dark:text-[#FDFBF7] block mt-1">{selectedOrder.gov}</span>
                  {selectedOrder.map_coords && (
                    <span className="text-[10px] text-[#8C6E3D] dark:text-[#DFCA9B] font-mono block mt-0.5">
                      GPS: {selectedOrder.map_coords.lat.toFixed(5)}, {selectedOrder.map_coords.lng.toFixed(5)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Items Ordered with Photos and Clickable Product Links (Requested by user) */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] font-semibold block">
                {isArabic ? 'المنتجات المطلوبة في هذا الأوردر' : 'Ordered Creations'}
              </span>

              {selectedOrder.items_detail && selectedOrder.items_detail.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedOrder.items_detail.map((item, idx) => {
                    // Find product matching item in catalog
                    const matchedProd = products.find(
                      (p) => p.id === item.product_id || p.slug === item.product_slug
                    );
                    const prodSlug = item.product_slug || matchedProd?.slug || 'la-fleur-du-nil';
                    const prodImage = item.image || matchedProd?.images?.bottle || matchedProd?.images?.hero || '/images/products/la-fleur-du-nil-bottle.jpg';
                    const prodHref = isArabic ? `/ar/product/${prodSlug}` : `/product/${prodSlug}`;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white dark:bg-[#1A1412] border border-[#B08D57]/30 flex items-center justify-between gap-3 shadow-sm hover:border-[#6B1D2F] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {/* Product Image */}
                          <div className="w-14 h-14 rounded-xl bg-[#F1EADA] dark:bg-[#14100E] border border-[#B08D57]/25 overflow-hidden shrink-0 relative">
                            <Image
                              src={prodImage}
                              alt={item.name_en || 'Product'}
                              fill
                              className="object-cover"
                              onError={(e: any) => {
                                e.target.src = '/images/products/la-fleur-du-nil-bottle.jpg';
                              }}
                            />
                          </div>

                          {/* Product Details & Clickable Link */}
                          <div>
                            <Link
                              href={prodHref}
                              target="_blank"
                              className="font-bold text-xs sm:text-sm text-[#14110F] dark:text-[#FDFBF7] hover:text-[#6B1D2F] dark:hover:text-[#DFCA9B] flex items-center gap-1.5 transition-colors group"
                              title={isArabic ? 'انقر لفتح صفحة المنتج في المتجر' : 'View product page on website'}
                            >
                              <span>{isArabic ? item.name_ar || item.name_en : item.name_en}</span>
                              <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                              <span className="font-mono bg-[#F1EADA]/80 dark:bg-[#1C1613] px-2 py-0.5 rounded-full border border-[#B08D57]/20">
                                {item.size_ml} ml
                              </span>
                              <span>× {item.quantity} قطعة</span>
                              <span className="font-semibold text-[#6B1D2F] dark:text-[#DFCA9B] font-mono">
                                {(item.price * item.quantity).toLocaleString()} EGP
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* View Product Button */}
                        <Link
                          href={prodHref}
                          target="_blank"
                          className="px-3 py-1.5 rounded-full border border-[#B08D57]/40 text-[#6B1D2F] dark:text-[#DFCA9B] hover:bg-[#6B1D2F] hover:text-white transition-all text-[11px] font-medium shrink-0 flex items-center gap-1"
                        >
                          <span>{isArabic ? 'معاينة المنتج' : 'View'}</span>
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback if older baseline order without items_detail */
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1A1412] border border-[#B08D57]/30 space-y-2">
                  <div className="flex items-start gap-3">
                    <Package className="text-[#6B1D2F] dark:text-[#DFCA9B] shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1">
                      <p className="font-medium text-xs sm:text-sm text-[#14110F] dark:text-[#FDFBF7] leading-relaxed">
                        {selectedOrder.items}
                      </p>
                      <Link
                        href={isArabic ? '/ar/shop' : '/shop'}
                        target="_blank"
                        className="text-[11px] text-[#B08D57] hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>{isArabic ? 'فتح الكتالوج في المتجر' : 'Browse Boutique'}</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Financial & Status Summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#F1EADA]/60 dark:bg-[#1C1613] border border-[#B08D57]/25">
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                  {isArabic ? 'طريقة الدفع' : 'Payment Method'}
                </span>
                <span className="font-bold text-xs sm:text-sm text-[#14110F] dark:text-[#FDFBF7] block mt-0.5">
                  {selectedOrder.payment === 'COD' ? (isArabic ? 'دفع عند الاستلام (COD)' : 'Cash on Delivery') : (isArabic ? 'بطاقة بنكية إلكترونية' : 'Online Card')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#6B1D2F]/10 dark:bg-[#6B1D2F]/20 border border-[#6B1D2F]/30">
                <span className="text-[10px] uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B] block font-semibold">
                  {isArabic ? 'إجمالي الأوردر' : 'Total Amount'}
                </span>
                <span className="font-serif font-bold text-base sm:text-lg text-[#6B1D2F] dark:text-[#DFCA9B] block mt-0.5">
                  {selectedOrder.total.toLocaleString()} EGP
                </span>
              </div>
            </div>

            {/* Change Status & Action Buttons */}
            <div className="pt-4 border-t border-[#B08D57]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-stone-500">{isArabic ? 'تغيير الحالة:' : 'Status:'}</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    handleUpdateOrderStatus(selectedOrder.id, newStatus);
                    setSelectedOrder({ ...selectedOrder, status: newStatus as any });
                  }}
                  className="bg-[#F1EADA] dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] border border-[#B08D57]/40 rounded-full text-xs px-3 py-1.5 cursor-pointer focus:outline-none"
                >
                  <option value="Processing">Processing (قيد التجهيز)</option>
                  <option value="Shipped">Shipped (تم الشحن)</option>
                  <option value="Delivered">Delivered (تم التوصيل)</option>
                  <option value="Cancelled">Cancelled (ملغي)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link
                  href={isArabic ? `/ar/orders/${selectedOrder.id}` : `/orders/${selectedOrder.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-full border border-[#B08D57]/40 text-xs font-medium hover:bg-[#F1EADA] dark:hover:bg-[#1C1613] transition-colors flex items-center gap-1.5"
                >
                  <span>{isArabic ? 'صفحة التتبع المباشر' : 'Live Tracking'}</span>
                  <ExternalLink size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-white text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors shadow-sm"
                >
                  {isArabic ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PATRON ORDER HISTORY (Requested by user: لما ادوس على عميل يجيبلي كل الطلبات وقيمتها وكل تفاصيله) */}
      {selectedPatron && (() => {
        // Find all orders placed by this customer (by matching phone or name)
        const patronNormPhone = selectedPatron.phone ? normalizePhone(selectedPatron.phone) : '';
        const patronOrders = orders.filter((o) => {
          if (patronNormPhone && o.phone) {
            return normalizePhone(o.phone) === patronNormPhone;
          }
          return o.customer.toLowerCase().trim() === selectedPatron.name.toLowerCase().trim();
        });

        const totalLifetimeSpent = patronOrders.reduce((sum, o) => sum + (o.total || 0), 0) || selectedPatron.totalSpent || 0;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FDFBF7] dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-[#B08D57]/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#6B1D2F] text-[#DFCA9B] font-serif font-bold text-lg flex items-center justify-center border border-[#B08D57]/40 shadow-md">
                    {selectedPatron.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#B08D57] font-semibold block">
                      {isArabic ? 'ملف وسجل طلبات العميل' : 'Patron Profile & Orders History'}
                    </span>
                    <h3 className="font-serif text-2xl text-[#14110F] dark:text-[#FDFBF7] mt-0.5">
                      {selectedPatron.name}
                    </h3>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {isArabic ? `عضو مسجل منذ ${selectedPatron.registeredAt || '2026'}` : `Member since ${selectedPatron.registeredAt || '2026'}`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatron(null)}
                  className="p-2 rounded-full border border-[#B08D57]/30 text-stone-500 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Patron Info & Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F1EADA]/60 dark:bg-[#1C1613] border border-[#B08D57]/25">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">{isArabic ? 'بيانات الاتصال' : 'Contact'}</span>
                  <span className="font-mono font-bold text-xs block text-[#14110F] dark:text-[#FDFBF7] mt-1">{selectedPatron.phone || '—'}</span>
                  {selectedPatron.email && (
                    <span className="text-[11px] text-stone-500 block truncate mt-0.5">{selectedPatron.email}</span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F1EADA]/60 dark:bg-[#1C1613] border border-[#B08D57]/25">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block">{isArabic ? 'العنوان والمحافظة' : 'Address'}</span>
                  <span className="font-bold text-xs block text-[#14110F] dark:text-[#FDFBF7] mt-1">{selectedPatron.governorate || 'Cairo'}</span>
                  <span className="text-[11px] text-stone-500 block truncate mt-0.5">{selectedPatron.address || '—'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#6B1D2F]/10 dark:bg-[#6B1D2F]/20 border border-[#6B1D2F]/30">
                  <span className="text-[10px] uppercase tracking-wider text-[#6B1D2F] dark:text-[#DFCA9B] font-semibold block">
                    {isArabic ? 'إجمالي المشتريات (Lifetime)' : 'Lifetime Value'}
                  </span>
                  <span className="font-serif font-bold text-base text-[#6B1D2F] dark:text-[#DFCA9B] block mt-1">
                    {totalLifetimeSpent.toLocaleString()} EGP
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
                    {patronOrders.length} {isArabic ? 'طلبات سابقة' : 'Total Orders'}
                  </span>
                </div>
              </div>

              {/* All Orders Table for this Patron */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B]">
                    {isArabic ? `سجل كافة الطلبات السابقة (${patronOrders.length}):` : `Order History (${patronOrders.length}):`}
                  </h4>
                  {selectedPatron.phone && (
                    <a
                      href={`https://wa.me/20${normalizePhone(selectedPatron.phone).replace(/^0/, '')}?text=${encodeURIComponent(
                        `مرحباً ${selectedPatron.name}، نتواصل معك من دار لوفينوس للعطور والمستحضرات الفاخرة.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-medium transition-colors shadow-sm"
                    >
                      <MessageCircle size={12} />
                      <span>{isArabic ? 'مراسلة واتساب مباشرة' : 'WhatsApp'}</span>
                    </a>
                  )}
                </div>

                {patronOrders.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-[#F1EADA]/30 dark:bg-[#1C1613]/40 border border-[#B08D57]/20 text-xs text-stone-400">
                    {isArabic ? 'لا توجد طلبات مسجلة لهذا العميل حتى الآن' : 'No previous orders found for this patron'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patronOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedOrder(ord);
                        }}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#1A1412] border border-[#B08D57]/25 hover:border-[#6B1D2F] dark:hover:border-[#DFCA9B] transition-all cursor-pointer shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#6B1D2F] dark:text-[#DFCA9B]">
                              {ord.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {ord.status}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">{ord.date}</span>
                          </div>
                          <p className="text-xs text-[#14110F] dark:text-[#FDFBF7] font-medium leading-snug">
                            {ord.items}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="font-mono font-bold text-sm text-[#14110F] dark:text-[#FDFBF7]">
                            {ord.total.toLocaleString()} EGP
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-[#B08D57] font-semibold underline">
                            {isArabic ? 'تفاصيل الأوردر ←' : 'Details →'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-[#B08D57]/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPatron(null)}
                  className="px-6 py-2 rounded-full bg-[#6B1D2F] hover:bg-[#8A1D2E] text-white text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors shadow-sm"
                >
                  {isArabic ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* MODAL: ADD / EDIT COUPON */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] dark:bg-[#14100E] text-[#14110F] dark:text-[#FDFBF7] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#B08D57]/40 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#6B1D2F] text-white flex items-center justify-center shrink-0">
                  <Tag size={16} />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-[#14110F] dark:text-[#FDFBF7]">
                  {editingCouponId
                    ? (isArabic ? 'تعديل كود الخصم' : 'Edit Coupon Code')
                    : (isArabic ? 'إضافة كود خصم جديد' : 'Create New Promo Code')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="p-2 rounded-full border border-[#B08D57]/30 text-stone-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCouponFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    كود الخصم (Coupon Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="مثال: SUMMER25"
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] font-mono font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    نوع الخصم (Type)
                  </label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] cursor-pointer"
                  >
                    <option value="percent">نسبة مئوية % (Percentage)</option>
                    <option value="fixed">مبلغ مالي ثابت ج.م (Fixed Amount)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    قيمة الخصم ({couponForm.type === 'percent' ? '%' : 'جنيه'}) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    الحد الأدنى للأوردر (جنيه)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={couponForm.min_order}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order: Number(e.target.value) })}
                    placeholder="مثال: 1000"
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                    أقصى عدد مرات استخدام (اختياري)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={couponForm.max_uses}
                    onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                    placeholder="اتركه فارغاً لعدد غير محدود"
                    className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7] font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F1EADA]/50 dark:bg-[#1C1613] border border-[#B08D57]/30 self-end">
                  <span className="font-semibold text-xs text-[#14110F] dark:text-[#FDFBF7]">
                    {isArabic ? 'تفعيل الكود فوراً' : 'Active Immediately'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponForm.is_active}
                      onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B1D2F]"></div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8C6E3D] dark:text-[#DFCA9B] mb-1">
                  وصف الكود أو المناسبة (Description)
                </label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="مثال: خصم الجمعة البيضاء لعملاء الدار"
                  className="w-full p-2.5 rounded-xl border border-[#B08D57]/40 bg-white dark:bg-[#1C1613] text-[#14110F] dark:text-[#FDFBF7]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#B08D57]/20">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#B08D57]/40 text-[#14110F] dark:text-[#FDFBF7] uppercase tracking-wider text-xs hover:bg-[#F1EADA] dark:hover:bg-[#1C1613] cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#6B1D2F] text-[#FDFBF7] uppercase tracking-wider text-xs hover:bg-[#8A1D2E] transition-all shadow-md font-medium cursor-pointer"
                >
                  {isArabic ? 'حفظ وتفعيل الكود' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
