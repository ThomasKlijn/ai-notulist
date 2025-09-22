import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from './simple-auth';

export async function getAuthenticatedUser(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session-token');
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionData = await getSession(sessionCookie.value);
    
    if (!sessionData) {
      return null;
    }
    
    return { id: sessionData.userId };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}