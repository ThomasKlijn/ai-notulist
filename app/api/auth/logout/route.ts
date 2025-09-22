import { NextRequest, NextResponse } from 'next/server';
import { generateLogoutUrl, decryptSessionId, deleteSession } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');
    
    // Delete database session if present
    if (sessionCookie) {
      try {
        const sessionId = await decryptSessionId(sessionCookie.value);
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session from database:', error);
        // Continue with logout even if session deletion fails
      }
    }
    
    // Clear session cookie
    cookieStore.set('auth-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    const hostname = req.headers.get('host') || 'localhost:5000';
    const logoutUrl = await generateLogoutUrl(hostname);
    
    return NextResponse.redirect(logoutUrl);
  } catch (error) {
    console.error('Error handling logout:', error);
    // Fallback to just clearing cookie and redirecting home
    return NextResponse.redirect(new URL('/', req.url));
  }
}