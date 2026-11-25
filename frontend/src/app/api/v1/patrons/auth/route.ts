import { NextResponse } from 'next/server';
import { getServerOrders, getServerPatrons, saveServerPatron, ServerPatronRecord } from '@/lib/serverDb';
import { normalizePhone } from '@/lib/patronAuth';
import {
  PATRON_COOKIE_NAME,
  buildSecureCookieOptions,
  checkRateLimit,
  createPatronSessionToken,
  getClientIp,
  hashSecret,
  isIpBlocked,
  isValidEgyptianPhone,
  isValidEmail,
  logSecurityEvent,
  sanitizeText,
  verifyHashedSecret,
  verifyPatronFromRequest,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

function stripSensitivePatronFields(p: ServerPatronRecord) {
  return {
    id: p.id,
    name: p.name,
    phone: p.phone,
    email: p.email || '',
    governorate: p.governorate || 'Cairo',
    city: p.city || '',
    address: p.address || '',
    registeredAt: p.registeredAt || '2026',
    hasPin: Boolean(p.passwordHash),
  };
}

function getOrdersForSinglePatron(patron: ServerPatronRecord) {
  const all = getServerOrders();
  const normPhone = patron.phone ? normalizePhone(patron.phone) : '';
  const cleanName = patron.name ? patron.name.trim().toLowerCase() : '';

  return all.filter((o) => {
    const orderPhone = o.phone ? normalizePhone(o.phone) : '';
    if (normPhone && orderPhone) {
      return orderPhone === normPhone;
    }
    if (!normPhone && cleanName && o.customer) {
      return o.customer.trim().toLowerCase() === cleanName;
    }
    return false;
  });
}

// GET: Returns ONLY the authenticated patron's own profile & orders (never leaks other customers!)
export async function GET(request: Request) {
  const session = verifyPatronFromRequest(request);
  if (!session.authenticated || !session.patronId) {
    return NextResponse.json({ authenticated: false, patron: null, orders: [] });
  }

  const patrons = getServerPatrons();
  const found = patrons.find(
    (p) =>
      p.id === session.patronId ||
      (session.phone && normalizePhone(p.phone) === normalizePhone(session.phone))
  );

  if (!found) {
    return NextResponse.json({ authenticated: false, patron: null, orders: [] });
  }

  return NextResponse.json({
    authenticated: true,
    patron: stripSensitivePatronFields(found),
    orders: getOrdersForSinglePatron(found),
  });
}

// POST: Secure Patron Sign In / Register / Logout with PIN protection & rate limiting
export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isIpBlocked(ip)) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const rl = checkRateLimit(`patron_auth_${ip}`, 12, 10 * 60 * 1000);
  if (!rl.allowed) {
    logSecurityEvent({
      severity: 'warning',
      event: 'PATRON_AUTH_RATE_LIMIT',
      ip,
      path: 'POST /api/v1/patrons/auth',
      details: `Patron auth rate limit reached (${rl.retryAfterSeconds}s wait)`,
    });
    return NextResponse.json(
      {
        message: `Too many requests. Please wait ${rl.retryAfterSeconds} seconds.`,
        message_ar: `محاولات كثيرة متتالية. يرجى الانتظار ${rl.retryAfterSeconds} ثانية.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'logout') {
      const response = NextResponse.json({ authenticated: false, patron: null, orders: [] });
      response.cookies.set(PATRON_COOKIE_NAME, '', buildSecureCookieOptions(0, 'lax'));
      return response;
    }

    if (action === 'register') {
      const name = sanitizeText(body.name, 80);
      const rawPhone = sanitizeText(body.phone, 24);
      const email = sanitizeText(body.email, 120);
      const city = sanitizeText(body.city, 80);
      const address = sanitizeText(body.address, 250);
      const pin = typeof body.pin === 'string' ? body.pin.trim() : '';

      if (!name || name.length < 2) {
        return NextResponse.json(
          { message: 'Full name is required (min 2 characters)', message_ar: 'يرجى إدخال الاسم بالكامل' },
          { status: 422 }
        );
      }

      if (!isValidEgyptianPhone(rawPhone)) {
        return NextResponse.json(
          {
            message: 'Valid Egyptian mobile number is required (e.g. 01012345678)',
            message_ar: 'يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678)',
          },
          { status: 422 }
        );
      }

      if (email && !isValidEmail(email)) {
        return NextResponse.json(
          { message: 'Invalid email format', message_ar: 'صيغة البريد الإلكتروني غير صحيحة' },
          { status: 422 }
        );
      }

      if (pin.length < 4 || pin.length > 64) {
        return NextResponse.json(
          {
            message: 'Please choose a Security PIN / Password (at least 4 characters)',
            message_ar: 'يرجى اختيار كلمة سر / رمز أمان (4 أحرف أو أرقام على الأقل) لحماية حسابك',
          },
          { status: 422 }
        );
      }

      const normPhone = normalizePhone(rawPhone);
      const patrons = getServerPatrons();
      const existing = patrons.find((p) => normalizePhone(p.phone) === normPhone);

      if (existing) {
        return NextResponse.json(
          {
            alreadyRegistered: true,
            message: 'This mobile number is already registered. Please sign in instead.',
            message_ar: 'هذا الرقم مسجل بالفعل في سجلات الدار. لا يمكن إنشاء حسابين بنفس الرقم، يرجى تسجيل الدخول.',
          },
          { status: 409 }
        );
      }

      const newPatron: ServerPatronRecord = {
        id: `patron_${Date.now()}`,
        name,
        phone: normPhone,
        email,
        governorate: 'Cairo',
        city: city || 'Zamalek',
        address,
        registeredAt: new Date().getFullYear().toString(),
        passwordHash: hashSecret(pin),
      };

      saveServerPatron(newPatron);

      const token = createPatronSessionToken(newPatron.id, newPatron.phone);
      const response = NextResponse.json({
        success: true,
        patron: stripSensitivePatronFields(newPatron),
        orders: getOrdersForSinglePatron(newPatron),
      });
      response.cookies.set(PATRON_COOKIE_NAME, token, buildSecureCookieOptions(7 * 24 * 60 * 60, 'lax'));
      return response;
    }

    if (action === 'login') {
      const identifier = sanitizeText(body.identifier, 120);
      const pin = typeof body.pin === 'string' ? body.pin.trim() : '';

      if (!identifier || identifier.length < 3) {
        return NextResponse.json(
          {
            message: 'Please enter a valid mobile number or email',
            message_ar: 'يرجى إدخال رقم الموبايل أو البريد الإلكتروني',
          },
          { status: 422 }
        );
      }

      const isPhone = /\d/.test(identifier) && !identifier.includes('@');
      const norm = isPhone ? normalizePhone(identifier) : identifier.toLowerCase();

      const patrons = getServerPatrons();
      const found = patrons.find((p) =>
        isPhone ? normalizePhone(p.phone) === norm : p.email?.toLowerCase() === norm
      );

      if (!found) {
        return NextResponse.json(
          {
            message: 'No account found for these details. Please register as a New Member.',
            message_ar: 'لا يوجد حساب مسجل بهذه البيانات. يمكنك إنشاء عضوية جديدة خلال ثوانٍ.',
          },
          { status: 404 }
        );
      }

      // If account has a PIN/passwordHash, verify it strictly
      if (found.passwordHash) {
        if (!pin || !verifyHashedSecret(pin, found.passwordHash)) {
          logSecurityEvent({
            severity: 'warning',
            event: 'PATRON_LOGIN_FAILED',
            ip,
            path: 'POST /api/v1/patrons/auth',
            details: `Invalid PIN for patron identifier (${isPhone ? 'phone' : 'email'})`,
          });
          return NextResponse.json(
            {
              requiresPin: true,
              message: 'Incorrect Security PIN / Password',
              message_ar: 'كلمة السر / رمز الحماية غير صحيح',
            },
            { status: 401 }
          );
        }
      } else {
        // Legacy / guest-checkout patron without PIN yet: require verifying an order number OR setting a new PIN with matching order ref
        const patronOrders = getOrdersForSinglePatron(found);
        const orderRefInput = sanitizeText(body.orderRef, 30).toUpperCase();

        if (patronOrders.length > 0) {
          const hasMatchingOrder = patronOrders.some((o) => o.id.toUpperCase() === orderRefInput);
          if (!hasMatchingOrder) {
            return NextResponse.json(
              {
                needsActivation: true,
                message: 'Please verify your Order Reference (e.g. LV-xxxxxx) and set a Security PIN to activate account access.',
                message_ar: 'لتأمين حسابك قبل الدخول، أدخل رقم أحد طلباتك السابقة (مثال: LV-xxxxxx) مع كلمة سر جديدة.',
              },
              { status: 401 }
            );
          }
        }

        if (!pin || pin.length < 4) {
          return NextResponse.json(
            {
              needsActivation: true,
              message: 'Please choose a Security PIN (min 4 chars) to protect your account.',
              message_ar: 'يرجى تعيين رمز أمان / كلمة سر (4 أحرف أو أرقام على الأقل) لحماية حسابك عند الدخول.',
            },
            { status: 422 }
          );
        }

        // Bind PIN cleanly so future logins use PIN directly
        found.passwordHash = hashSecret(pin);
        saveServerPatron(found);
      }

      const token = createPatronSessionToken(found.id, found.phone);
      const response = NextResponse.json({
        success: true,
        patron: stripSensitivePatronFields(found),
        orders: getOrdersForSinglePatron(found),
      });
      response.cookies.set(PATRON_COOKIE_NAME, token, buildSecureCookieOptions(7 * 24 * 60 * 60, 'lax'));
      return response;
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ message: 'Authentication error' }, { status: 400 });
  }
}
