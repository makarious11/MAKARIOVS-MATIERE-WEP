import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  buildSecureCookieOptions,
  checkAdminLoginLockout,
  checkRateLimit,
  clearAdminLoginFailures,
  createAdminSessionToken,
  getClientIp,
  isIpBlocked,
  logSecurityEvent,
  recordFailedAdminLogin,
  verifyAdminFromRequest,
  verifyAdminMasterKey,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

// GET: Verify whether caller holds a valid, unexpired, non-revoked HttpOnly Admin cookie
export async function GET(request: Request) {
  const auth = verifyAdminFromRequest(request);
  return NextResponse.json({
    authenticated: auth.authenticated,
  });
}

// POST: Authenticate Director using Master Key with brute-force lockout & HttpOnly signed cookie
export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isIpBlocked(ip)) {
    logSecurityEvent({
      severity: 'critical',
      event: 'BLOCKED_IP_LOGIN_ATTEMPT',
      ip,
      path: 'POST /api/v1/admin/auth',
      details: 'Login attempted from firewall-blocked IP address',
    });
    return NextResponse.json(
      {
        message: 'Access denied from this IP address. Contact Atelier Administrator.',
        message_ar: 'تم حظر الوصول من عنوان الشبكة هذا لأسباب أمنية.',
      },
      { status: 403 }
    );
  }

  // Per-minute burst rate limit (max 10 requests / minute / IP)
  const rl = checkRateLimit(`admin_login_${ip}`, 10, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        message: `Too many requests. Please wait ${rl.retryAfterSeconds} seconds.`,
        message_ar: `تم تجاوز الحد المسموح للمحاولات. يرجى الانتظار ${rl.retryAfterSeconds} ثانية.`,
        retryAfterSeconds: rl.retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  // Persistent brute-force lockout check (5 failed attempts -> 15-min lockout)
  const lockout = checkAdminLoginLockout(ip);
  if (lockout.locked) {
    const mins = Math.ceil(lockout.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        locked: true,
        retryAfterSeconds: lockout.retryAfterSeconds,
        message: `Account temporarily locked due to repeated failed attempts. Try again in ${mins} minute(s).`,
        message_ar: `تم إغلاق البوابة مؤقتاً لمدة ${mins} دقيقة بسبب محاولات دخول خاطئة متكررة.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const passcode = typeof body?.passcode === 'string' ? body.passcode : '';

    if (!passcode.trim()) {
      return NextResponse.json(
        {
          message: 'Master Key is required',
          message_ar: 'يرجى إدخال مفتاح المرور السري',
        },
        { status: 400 }
      );
    }

    const result = verifyAdminMasterKey(passcode);

    if (result.misconfigured) {
      return NextResponse.json(
        {
          misconfigured: true,
          message:
            'Admin security key is not configured on the server. Set ADMIN_ACCESS_KEY in environment variables.',
          message_ar:
            'مفتاح أمان الإدارة غير مضبوط على السيرفر. يرجى ضبط متغير ADMIN_ACCESS_KEY في إعدادات البيئة (.env.local).',
        },
        { status: 503 }
      );
    }

    if (!result.valid) {
      const failState = recordFailedAdminLogin(ip);
      if (failState.locked) {
        return NextResponse.json(
          {
            locked: true,
            retryAfterSeconds: failState.retryAfterSeconds,
            message: 'Too many failed attempts. Access locked for 15 minutes.',
            message_ar: 'تم حظر الدخول لمدة 15 دقيقة بعد 5 محاولات خاطئة متتالية لحماية لوحة التحكم.',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          attemptsRemaining: failState.attemptsRemaining,
          message: `Invalid Master Key (${failState.attemptsRemaining} attempts remaining before lockout)`,
          message_ar: `مفتاح المرور غير صحيح (متبقي ${failState.attemptsRemaining} محاولات قبل الإغلاق المؤقت)`,
        },
        { status: 401 }
      );
    }

    // Valid Master Key -> reset failures & issue signed HttpOnly cookie
    clearAdminLoginFailures(ip);
    const token = createAdminSessionToken(ip);

    logSecurityEvent({
      severity: 'info',
      event: 'ADMIN_LOGIN_SUCCESS',
      ip,
      path: 'POST /api/v1/admin/auth',
      details: 'Director authenticated successfully with signed HttpOnly session',
    });

    const response = NextResponse.json({
      authenticated: true,
    });
    response.cookies.set(ADMIN_COOKIE_NAME, token, buildSecureCookieOptions(8 * 60 * 60, 'strict'));
    return response;
  } catch {
    return NextResponse.json(
      { message: 'Malformed request', message_ar: 'صيغة الطلب غير صالحة' },
      { status: 400 }
    );
  }
}

// DELETE: Logout & clear HttpOnly session cookie
export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const auth = verifyAdminFromRequest(request);
  if (auth.authenticated) {
    logSecurityEvent({
      severity: 'info',
      event: 'ADMIN_LOGOUT',
      ip,
      path: 'DELETE /api/v1/admin/auth',
      details: 'Director logged out cleanly',
    });
  }

  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE_NAME, '', buildSecureCookieOptions(0, 'strict'));
  return response;
}
