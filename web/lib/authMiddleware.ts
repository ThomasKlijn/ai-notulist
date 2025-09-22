import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromSession } from './simple-auth';

export async function getAuthenticatedUser(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth-session');
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionData = await getUserFromSession(sessionCookie.value);
    
    if (!sessionData) {
      return null;
    }
    
    return sessionData.user;
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