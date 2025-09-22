import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '../../../../lib/simple-auth';
import { storage } from '../../../../server/storage';
import { cookies } from 'next/headers';

const VALID_CREDENTIALS = {
  username: 'VanDelftGroep',
  password: 'JWVD12'
};

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Check credentials
    if (username !== VALID_CREDENTIALS.username || password !== VALID_CREDENTIALS.password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Create or get user
    const userId = 'vandelftgroep-user';
    const user = await storage.upsertUser({
      id: userId,
      email: 'info@vandelftgroep.nl',
      firstName: 'Van Delft',
      lastName: 'Groep'
    });

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

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login error details:', error);
    return NextResponse.json({ 
      error: 'Login failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}