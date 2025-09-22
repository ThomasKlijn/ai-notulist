import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromSession } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const sessionData = await getUserFromSession(sessionCookie.value);
    
    if (!sessionData) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    
    return NextResponse.json(sessionData.user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
  }
}