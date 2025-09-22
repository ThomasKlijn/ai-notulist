import { NextRequest, NextResponse } from 'next/server';
import { generateAuthUrl, encryptSessionId } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const hostname = req.headers.get('host') || 'localhost:5000';
    const { url, state, codeVerifier, nonce } = await generateAuthUrl(hostname);
    
    // Store PKCE parameters securely in encrypted cookie
    const pkceData = JSON.stringify({ state, codeVerifier, nonce });
    const encryptedPkce = await encryptSessionId(pkceData);
    
    const cookieStore = await cookies();
    cookieStore.set('pkce-data', encryptedPkce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });
    
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}