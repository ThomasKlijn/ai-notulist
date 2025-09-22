import { NextRequest, NextResponse } from 'next/server';
import { handleCallback, encryptSessionId, decryptSessionId } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code || !state) {
      return NextResponse.json({ error: 'Missing authorization code or state' }, { status: 400 });
    }
    
    // Retrieve and verify PKCE parameters
    const cookieStore = await cookies();
    const pkceCookie = cookieStore.get('pkce-data');
    
    if (!pkceCookie) {
      return NextResponse.json({ error: 'Missing PKCE data' }, { status: 400 });
    }
    
    const pkceDataString = await decryptSessionId(pkceCookie.value);
    const { state: storedState, codeVerifier, nonce } = JSON.parse(pkceDataString);
    
    const hostname = req.headers.get('host') || 'localhost:5000';
    const result = await handleCallback(code, state, hostname, storedState, codeVerifier, nonce);
    
    // Set secure session cookie with encrypted session ID
    const encryptedSessionId = await encryptSessionId(result.sessionId);
    
    cookieStore.set('auth-session', encryptedSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 1 week
      path: '/',
    });
    
    // Clear PKCE cookie
    cookieStore.set('pkce-data', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    // Redirect to home page
    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}