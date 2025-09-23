import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '../../../../lib/simple-auth';
import { cookies } from 'next/headers';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

const VALID_CREDENTIALS = {
  username: process.env.AUTH_USERNAME || 'VanDelftGroep',
  password: process.env.AUTH_PASSWORD || 'JWVD12'
};

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Check credentials
    if (username !== VALID_CREDENTIALS.username || password !== VALID_CREDENTIALS.password) {
      const errorResponse = NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    
    // Add aggressive cache prevention headers
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
    }

    // Create or get user (with fallback if database fails)
    const userId = 'vandelftgroep-user';
    let user;
    try {
      // Lazy import storage to avoid crashing at startup
      const { storage } = await import('../../../../server/storage');
      user = await storage.upsertUser({
        id: userId,
        email: 'info@vandelftgroep.nl',
        firstName: 'Van Delft',
        lastName: 'Groep'
      });
    } catch (error) {
      console.warn('Database upsert failed, using fallback user:', error);
      // Fallback user object when database is unavailable
      user = {
        id: userId,
        email: 'info@vandelftgroep.nl',
        firstName: 'Van Delft',
        lastName: 'Groep',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Create session
    const sessionToken = await createSession(userId);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    const response = NextResponse.json({ success: true, user });
    
    // Add aggressive cache prevention headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Login error details:', error);
    const errorResponse = NextResponse.json({ 
      error: 'Login failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
    
    // Add aggressive cache prevention headers
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    
    return errorResponse;
  }
}