import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from './simple-auth';

export async function getAuthenticatedUser(req: NextRequest) {
  try {
    // TEMPORARY BYPASS: Just check if session token exists (for testing)
    let sessionToken = req.cookies.get('session-token')?.value;
    
    // Fallback to headers if not in cookies
    if (!sessionToken) {
      const authHeader = req.headers.get('cookie');
      if (authHeader) {
        const match = authHeader.match(/session-token=([^;]+)/);
        if (match) {
          sessionToken = decodeURIComponent(match[1]);
        }
      }
    }
    
    if (!sessionToken) {
      return null;
    }
    
    // TEMPORARY: Just return authenticated user if token exists
    // TODO: Fix proper session validation later
    return { id: "vandelftgroep-user" };
    
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