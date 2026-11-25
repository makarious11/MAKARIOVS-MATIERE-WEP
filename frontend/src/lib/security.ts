// ============================================================
// L'VENUS — Enterprise Security & Anti-Intrusion Engine
// Cryptographic Sessions (HMAC-SHA256 + scrypt), Rate Limiting,
// Brute-Force IP Lockout, Input Sanitization & Security Audit Logs
// ============================================================

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'lv_admin_session';
export const PATRON_COOKIE_NAME = 'lv_patron_session';
export const ORDER_RECEIPT_COOKIE_NAME = 'lv_order_receipts';

const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const PATRON_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ORDER_RECEIPT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// ------------------------------------------------------------
// 1. Storage Paths
// ------------------------------------------------------------
export function getSecurityDataDir(): string {
  if (fs.existsSync(path.join(process.cwd(), 'src'))) {
    const d = path.join(process.cwd(), 'data');
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    return d;
  }
  const dInFrontend = path.join(process.cwd(), 'frontend', 'data');
  if (fs.existsSync(path.join(process.cwd(), 'frontend'))) {
    if (!fs.existsSync(dInFrontend)) fs.mkdirSync(dInFrontend, { recursive: true });
    return dInFrontend;
  }
  const rootD = path.join(process.cwd(), 'data');
  if (!fs.existsSync(rootD)) fs.mkdirSync(rootD, { recursive: true });
  return rootD;
}

const ADMIN_SECURITY_FILE = () => path.join(getSecurityDataDir(), 'admin_security.json');
const SECURITY_LOGS_FILE = () => path.join(getSecurityDataDir(), 'security_logs.json');

export interface LoginFailureRecord {
  count: number;
  firstAt: number;
  lockedUntil: number;
}

export interface AdminSecurityState {
  sessionSecret: string;
  passwordHash?: string; // Set when admin rotates Master Key from Security Center
  sessionEpoch: number;
  loginFailures: Record<string, LoginFailureRecord>;
  blockedIps: string[];
  updatedAt: string;
}

export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  event: string;
  ip: string;
  path: string;
  details: string;
}

const g = globalThis as unknown as {
  __LV_ADMIN_SEC__?: AdminSecurityState;
  __LV_RATE_LIMITS__?: Map<string, { count: number; resetAt: number }>;
};

function readSecurityState(): AdminSecurityState {
  const filePath = ADMIN_SECURITY_FILE();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<AdminSecurityState>;
      const state: AdminSecurityState = {
        sessionSecret: parsed.sessionSecret || crypto.randomBytes(32).toString('hex'),
        passwordHash: parsed.passwordHash,
        sessionEpoch: typeof parsed.sessionEpoch === 'number' ? parsed.sessionEpoch : 1,
        loginFailures: parsed.loginFailures || {},
        blockedIps: Array.isArray(parsed.blockedIps) ? parsed.blockedIps : [],
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      g.__LV_ADMIN_SEC__ = state;
      return state;
    }
  } catch {
    // Fallback to memory cache if read fails
  }

  if (g.__LV_ADMIN_SEC__) return g.__LV_ADMIN_SEC__;

  const initial: AdminSecurityState = {
    sessionSecret: process.env.AUTH_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    sessionEpoch: 1,
    loginFailures: {},
    blockedIps: [],
    updatedAt: new Date().toISOString(),
  };

  writeSecurityState(initial);
  return initial;
}

function writeSecurityState(state: AdminSecurityState): void {
  state.updatedAt = new Date().toISOString();
  g.__LV_ADMIN_SEC__ = state;
  try {
    const filePath = ADMIN_SECURITY_FILE();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Ignore write error in read-only environments; memory cache still holds state
  }
}

function getEffectiveSigningSecret(): string {
  const envSecret = process.env.AUTH_SESSION_SECRET;
  if (envSecret && envSecret.length >= 32) return envSecret;
  return readSecurityState().sessionSecret;
}

// ------------------------------------------------------------
// 2. Client IP Detection & Cookie Parsing
// ------------------------------------------------------------
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first && /^[0-9a-fA-F.:]+$/.test(first)) return first;
  }
  const realIp = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');
  if (realIp && /^[0-9a-fA-F.:]+$/.test(realIp.trim())) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

export function parseCookieHeader(request: Request, cookieName: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  const parts = header.split(';');
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === cookieName) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return undefined;
}

// ------------------------------------------------------------
// 3. Password / Master Key Hashing & Verification
// ------------------------------------------------------------
export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(secret, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyHashedSecret(secret: string, stored: string): boolean {
  try {
    const [salt, hashHex] = stored.split(':');
    if (!salt || !hashHex) return false;
    const derived = crypto.scryptSync(secret, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

function timingSafeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function isAdminConfigured(): boolean {
  const state = readSecurityState();
  const envKey = process.env.ADMIN_ACCESS_KEY?.trim();
  return Boolean(state.passwordHash || (envKey && envKey.length >= 6));
}

export function verifyAdminMasterKey(inputKey: string): { valid: boolean; misconfigured?: boolean } {
  const clean = inputKey.trim();
  if (!clean) return { valid: false };

  const state = readSecurityState();
  // 1. If admin rotated key from Security Center UI, validate against salted scrypt hash
  if (state.passwordHash) {
    return { valid: verifyHashedSecret(clean, state.passwordHash) };
  }

  // 2. Otherwise verify against ADMIN_ACCESS_KEY environment variable
  const envKey = process.env.ADMIN_ACCESS_KEY?.trim();
  if (envKey && envKey.length >= 6) {
    return { valid: timingSafeCompareStrings(clean, envKey) };
  }

  return { valid: false, misconfigured: true };
}

export function rotateAdminMasterKey(currentKey: string, newKey: string): { ok: boolean; error?: string } {
  const check = verifyAdminMasterKey(currentKey);
  if (!check.valid) {
    return { ok: false, error: 'Current Master Key is incorrect' };
  }

  const trimmedNew = newKey.trim();
  if (trimmedNew.length < 10) {
    return { ok: false, error: 'New Master Key must be at least 10 characters long' };
  }
  const hasUpper = /[A-Z]/.test(trimmedNew);
  const hasLower = /[a-z]/.test(trimmedNew);
  const hasNumOrSym = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedNew);
  if (!(hasUpper && hasLower && hasNumOrSym)) {
    return {
      ok: false,
      error: 'New Master Key must mix uppercase letters, lowercase letters, and numbers/symbols',
    };
  }

  const state = readSecurityState();
  state.passwordHash = hashSecret(trimmedNew);
  state.sessionEpoch += 1; // Invalidate all previously issued sessions
  writeSecurityState(state);
  return { ok: true };
}

// ------------------------------------------------------------
// 4. HMAC-SHA256 Signed Cookie Tokens
// ------------------------------------------------------------
function signPayload(payloadObj: Record<string, unknown>): string {
  const secret = getEffectiveSigningSecret();
  const encoded = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySignedPayload<T extends { exp?: number }>(token: string | undefined): T | null {
  if (!token || typeof token !== 'string') return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;

  const encoded = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);
  if (!encoded || !providedSig) return null;

  try {
    const secret = getEffectiveSigningSecret();
    const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');

    const bufProvided = Buffer.from(providedSig, 'utf8');
    const bufExpected = Buffer.from(expectedSig, 'utf8');
    if (bufProvided.length !== bufExpected.length) return null;
    if (!crypto.timingSafeEqual(bufProvided, bufExpected)) return null;

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as T;
    if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSessionToken(ip: string): string {
  const state = readSecurityState();
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
  return signPayload({
    role: 'admin',
    epoch: state.sessionEpoch,
    ipHash,
    jti: crypto.randomBytes(12).toString('hex'),
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
  });
}

export function revokeAllAdminSessions(): number {
  const state = readSecurityState();
  state.sessionEpoch += 1;
  writeSecurityState(state);
  return state.sessionEpoch;
}

export function verifyAdminFromRequest(request: Request): {
  authenticated: boolean;
  ip: string;
  reason?: string;
} {
  const ip = getClientIp(request);
  if (isIpBlocked(ip)) {
    return { authenticated: false, ip, reason: 'IP_BLOCKED' };
  }

  const token = parseCookieHeader(request, ADMIN_COOKIE_NAME);
  const payload = verifySignedPayload<{
    role?: string;
    epoch?: number;
    exp?: number;
  }>(token);

  if (!payload || payload.role !== 'admin') {
    return { authenticated: false, ip, reason: 'INVALID_OR_MISSING_TOKEN' };
  }

  const state = readSecurityState();
  if (payload.epoch !== state.sessionEpoch) {
    return { authenticated: false, ip, reason: 'SESSION_REVOKED' };
  }

  return { authenticated: true, ip };
}

export function requireAdmin(request: Request, actionLabel = 'Admin API'): NextResponse | null {
  const auth = verifyAdminFromRequest(request);
  if (auth.authenticated) return null;

  const url = new URL(request.url);
  logSecurityEvent({
    severity: 'warning',
    event: 'UNAUTHORIZED_ADMIN_ACCESS',
    ip: auth.ip,
    path: `${request.method} ${url.pathname}`,
    details: `${actionLabel} blocked (${auth.reason || 'unauthenticated'})`,
  });

  return NextResponse.json(
    { message: 'Unauthorized — Valid Atelier Director authentication required' },
    { status: auth.reason === 'IP_BLOCKED' ? 403 : 401 }
  );
}

// Patron Session Token
export function createPatronSessionToken(patronId: string, phone: string): string {
  return signPayload({
    role: 'patron',
    patronId,
    phone,
    jti: crypto.randomBytes(8).toString('hex'),
    exp: Date.now() + PATRON_SESSION_TTL_MS,
  });
}

export function verifyPatronFromRequest(request: Request): {
  authenticated: boolean;
  patronId?: string;
  phone?: string;
} {
  const token = parseCookieHeader(request, PATRON_COOKIE_NAME);
  const payload = verifySignedPayload<{
    role?: string;
    patronId?: string;
    phone?: string;
    exp?: number;
  }>(token);

  if (!payload || payload.role !== 'patron' || !payload.patronId) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    patronId: payload.patronId,
    phone: payload.phone,
  };
}

// Guest Order Receipt Token (lets checkout buyer inspect their own unmasked tracking receipt)
export function createOrderReceiptToken(
  existingCookieVal: string | undefined,
  newOrderNumber: string
): string {
  let orders: string[] = [];
  if (existingCookieVal) {
    const verified = verifySignedPayload<{ orders?: string[]; exp?: number }>(existingCookieVal);
    if (verified && Array.isArray(verified.orders)) {
      orders = verified.orders.slice(0, 9);
    }
  }
  const cleanNum = newOrderNumber.trim().toUpperCase();
  const nextOrders = [cleanNum, ...orders.filter((o) => o !== cleanNum)].slice(0, 10);

  return signPayload({
    orders: nextOrders,
    exp: Date.now() + ORDER_RECEIPT_TTL_MS,
  });
}

export function hasOrderReceiptAccess(request: Request, orderNumber: string): boolean {
  const cookieVal = parseCookieHeader(request, ORDER_RECEIPT_COOKIE_NAME);
  const verified = verifySignedPayload<{ orders?: string[]; exp?: number }>(cookieVal);
  if (!verified || !Array.isArray(verified.orders)) return false;
  return verified.orders.includes(orderNumber.trim().toUpperCase());
}

export function buildSecureCookieOptions(maxAgeSeconds: number, sameSite: 'strict' | 'lax' = 'strict') {
  return {
    httpOnly: true,
    sameSite,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

// ------------------------------------------------------------
// 5. Brute-Force Lockout, IP Blocking & Sliding-Window Rate Limiter
// ------------------------------------------------------------
export function isIpBlocked(ip: string): boolean {
  const state = readSecurityState();
  return state.blockedIps.includes(ip);
}

export function blockIpAddress(ip: string): string[] {
  const cleanIp = ip.trim();
  if (!/^[0-9a-fA-F.:]+$/.test(cleanIp)) return readSecurityState().blockedIps;
  const state = readSecurityState();
  if (!state.blockedIps.includes(cleanIp)) {
    state.blockedIps.push(cleanIp);
    writeSecurityState(state);
    logSecurityEvent({
      severity: 'critical',
      event: 'IP_MANUALLY_BLOCKED',
      ip: cleanIp,
      path: '/admin/security',
      details: `IP ${cleanIp} added to firewall blocklist`,
    });
  }
  return state.blockedIps;
}

export function unblockIpAddress(ip: string): string[] {
  const state = readSecurityState();
  state.blockedIps = state.blockedIps.filter((x) => x !== ip.trim());
  if (state.loginFailures[ip.trim()]) {
    delete state.loginFailures[ip.trim()];
  }
  writeSecurityState(state);
  return state.blockedIps;
}

export function checkAdminLoginLockout(ip: string): {
  locked: boolean;
  retryAfterSeconds: number;
} {
  const state = readSecurityState();
  const rec = state.loginFailures[ip];
  if (!rec) return { locked: false, retryAfterSeconds: 0 };

  if (rec.lockedUntil && Date.now() < rec.lockedUntil) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((rec.lockedUntil - Date.now()) / 1000),
    };
  }

  if (Date.now() - rec.firstAt > LOGIN_LOCKOUT_MS) {
    delete state.loginFailures[ip];
    writeSecurityState(state);
  }
  return { locked: false, retryAfterSeconds: 0 };
}

export function recordFailedAdminLogin(ip: string): {
  locked: boolean;
  attemptsRemaining: number;
  retryAfterSeconds: number;
} {
  const state = readSecurityState();
  const now = Date.now();
  let rec = state.loginFailures[ip];

  if (!rec || now - rec.firstAt > LOGIN_LOCKOUT_MS) {
    rec = { count: 1, firstAt: now, lockedUntil: 0 };
  } else {
    rec.count += 1;
  }

  let locked = false;
  let retryAfterSeconds = 0;

  if (rec.count >= MAX_LOGIN_FAILURES) {
    rec.lockedUntil = now + LOGIN_LOCKOUT_MS;
    locked = true;
    retryAfterSeconds = Math.ceil(LOGIN_LOCKOUT_MS / 1000);
  }

  state.loginFailures[ip] = rec;
  writeSecurityState(state);

  logSecurityEvent({
    severity: locked ? 'critical' : 'warning',
    event: locked ? 'ADMIN_BRUTEFORCE_LOCKOUT' : 'ADMIN_LOGIN_FAILED',
    ip,
    path: 'POST /api/v1/admin/auth',
    details: locked
      ? `IP locked out for 15 minutes after ${rec.count} failed passcode attempts`
      : `Invalid admin key attempt (${rec.count}/${MAX_LOGIN_FAILURES})`,
  });

  return {
    locked,
    attemptsRemaining: Math.max(0, MAX_LOGIN_FAILURES - rec.count),
    retryAfterSeconds,
  };
}

export function clearAdminLoginFailures(ip: string): void {
  const state = readSecurityState();
  if (state.loginFailures[ip]) {
    delete state.loginFailures[ip];
    writeSecurityState(state);
  }
}

export function checkRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  if (!g.__LV_RATE_LIMITS__) {
    g.__LV_RATE_LIMITS__ = new Map();
  }

  const now = Date.now();
  const store = g.__LV_RATE_LIMITS__;

  // Periodic lightweight cleanup to prevent unbounded growth
  if (store.size > 2000) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  const entry = store.get(bucketKey);
  if (!entry || now > entry.resetAt) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  store.set(bucketKey, entry);
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

// ------------------------------------------------------------
// 6. Security Audit Logging
// ------------------------------------------------------------
export function getSecurityLogs(): SecurityLogEntry[] {
  try {
    const filePath = SECURITY_LOGS_FILE();
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logSecurityEvent(entry: Omit<SecurityLogEntry, 'id' | 'timestamp'>): void {
  try {
    const logs = getSecurityLogs();
    const record: SecurityLogEntry = {
      id: `sec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const nextLogs = [record, ...logs].slice(0, 300);
    const filePath = SECURITY_LOGS_FILE();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(nextLogs, null, 2), 'utf8');
  } catch {
    // Non-fatal in read-only environments
  }
}

export function clearSecurityLogs(ip: string): SecurityLogEntry[] {
  const resetLog: SecurityLogEntry[] = [
    {
      id: `sec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      event: 'SECURITY_LOGS_CLEARED',
      ip,
      path: 'POST /api/v1/admin/security',
      details: 'Security audit log archive cleared by Admin',
    },
  ];
  try {
    const filePath = SECURITY_LOGS_FILE();
    fs.writeFileSync(filePath, JSON.stringify(resetLog, null, 2), 'utf8');
  } catch {}
  return resetLog;
}

export function getSecurityOverviewForAdmin() {
  const state = readSecurityState();
  const logs = getSecurityLogs();
  const now = Date.now();
  const activeLockouts = Object.entries(state.loginFailures)
    .filter(([, rec]) => rec.lockedUntil && rec.lockedUntil > now)
    .map(([ip, rec]) => ({
      ip,
      attempts: rec.count,
      unlocksInMinutes: Math.ceil((rec.lockedUntil - now) / 60000),
    }));

  return {
    configured: isAdminConfigured(),
    hasCustomRotatedKey: Boolean(state.passwordHash),
    sessionEpoch: state.sessionEpoch,
    blockedIps: state.blockedIps,
    activeLockouts,
    logs: logs.slice(0, 100),
  };
}

// ------------------------------------------------------------
// 7. Input Validation, XSS Sanitization & PII Masking
// ------------------------------------------------------------
export function sanitizeText(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLen);
}

export function sanitizeSlug(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function isSafeAssetUrl(input: unknown): boolean {
  if (typeof input !== 'string' || !input.trim()) return false;
  const trimmed = input.trim();
  if (trimmed.includes('..') || trimmed.includes('<') || trimmed.includes('>')) return false;
  if (/^(javascript|vbscript|data|file):/i.test(trimmed)) return false;

  // Allow relative local assets under /images/ or /brand/
  if (trimmed.startsWith('/images/') || trimmed.startsWith('/brand/')) {
    return true;
  }

  // Allow valid HTTPS URLs
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+20|0020|0)?1[0125][0-9]{8}$/.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.length <= 160;
}

export function maskPhone(phone: string): string {
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 7) return '***';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

export function maskName(name: string): string {
  const clean = name.trim();
  if (!clean) return 'Patron';
  const firstWord = clean.split(/\s+/)[0] || clean;
  return `${firstWord.slice(0, 3)}***`;
}
