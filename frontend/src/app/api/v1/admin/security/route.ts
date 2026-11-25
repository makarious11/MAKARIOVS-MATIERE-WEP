import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  blockIpAddress,
  buildSecureCookieOptions,
  clearSecurityLogs,
  createAdminSessionToken,
  getClientIp,
  getSecurityOverviewForAdmin,
  logSecurityEvent,
  requireAdmin,
  revokeAllAdminSessions,
  rotateAdminMasterKey,
  unblockIpAddress,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = requireAdmin(request, 'Security Center Overview');
  if (denied) return denied;

  const overview = getSecurityOverviewForAdmin();
  return NextResponse.json({
    success: true,
    data: overview,
  });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request, 'Security Center Mutation');
  if (denied) return denied;

  const ip = getClientIp(request);

  try {
    const body = await request.json();
    const action = body?.action;

    if (action === 'rotate_key') {
      const currentKey = typeof body.currentKey === 'string' ? body.currentKey : '';
      const newKey = typeof body.newKey === 'string' ? body.newKey : '';

      const res = rotateAdminMasterKey(currentKey, newKey);
      if (!res.ok) {
        logSecurityEvent({
          severity: 'warning',
          event: 'ADMIN_KEY_ROTATION_FAILED',
          ip,
          path: 'POST /api/v1/admin/security',
          details: res.error || 'Failed attempt to rotate Master Key',
        });
        return NextResponse.json({ message: res.error }, { status: 422 });
      }

      logSecurityEvent({
        severity: 'critical',
        event: 'ADMIN_KEY_ROTATED',
        ip,
        path: 'POST /api/v1/admin/security',
        details: 'Admin Master Key was rotated using salted scrypt hash; all old sessions invalidated',
      });

      // Re-issue cookie for the active admin session at the new epoch
      const newToken = createAdminSessionToken(ip);
      const response = NextResponse.json({
        success: true,
        message: 'Master Key updated and all other sessions invalidated',
        data: getSecurityOverviewForAdmin(),
      });
      response.cookies.set(ADMIN_COOKIE_NAME, newToken, buildSecureCookieOptions(8 * 60 * 60, 'strict'));
      return response;
    }

    if (action === 'revoke_sessions') {
      const newEpoch = revokeAllAdminSessions();
      logSecurityEvent({
        severity: 'critical',
        event: 'ALL_SESSIONS_REVOKED',
        ip,
        path: 'POST /api/v1/admin/security',
        details: `Panic session reset triggered (new epoch #${newEpoch})`,
      });

      const newToken = createAdminSessionToken(ip);
      const response = NextResponse.json({
        success: true,
        message: 'All other admin sessions invalidated immediately',
        data: getSecurityOverviewForAdmin(),
      });
      response.cookies.set(ADMIN_COOKIE_NAME, newToken, buildSecureCookieOptions(8 * 60 * 60, 'strict'));
      return response;
    }

    if (action === 'block_ip') {
      const targetIp = typeof body.ip === 'string' ? body.ip.trim() : '';
      if (!/^[0-9a-fA-F.:]+$/.test(targetIp)) {
        return NextResponse.json({ message: 'Invalid IP address format' }, { status: 422 });
      }
      if (targetIp === ip) {
        return NextResponse.json({ message: 'Cannot block your own current IP address' }, { status: 422 });
      }
      blockIpAddress(targetIp);
      return NextResponse.json({
        success: true,
        data: getSecurityOverviewForAdmin(),
      });
    }

    if (action === 'unblock_ip') {
      const targetIp = typeof body.ip === 'string' ? body.ip.trim() : '';
      unblockIpAddress(targetIp);
      logSecurityEvent({
        severity: 'info',
        event: 'IP_UNBLOCKED',
        ip,
        path: 'POST /api/v1/admin/security',
        details: `IP ${targetIp} removed from blocklist`,
      });
      return NextResponse.json({
        success: true,
        data: getSecurityOverviewForAdmin(),
      });
    }

    if (action === 'clear_logs') {
      clearSecurityLogs(ip);
      return NextResponse.json({
        success: true,
        data: getSecurityOverviewForAdmin(),
      });
    }

    return NextResponse.json({ message: 'Unknown security action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ message: 'Security operation failed', error: String(err) }, { status: 500 });
  }
}
