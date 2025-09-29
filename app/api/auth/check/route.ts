import { NextRequest, NextResponse } from 'next/server';
import { getSession, getUserFromSession } from '../../../../lib/simple-auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Get full user details for welcome message
    const userResult = await getUserFromSession(sessionToken);
    if (!userResult) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      userId: session.userId,
      user: userResult.user
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}