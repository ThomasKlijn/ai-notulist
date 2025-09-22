import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from './simple-auth';

export async function getAuthenticatedUser(req: NextRequest) {
  try {
    // Try to get from cookies first
    let sessionToken = req.cookies.get('session-token')?.value;
    
    // Fallback to headers if not in cookies
    if (!sessionToken) {
      const authHeader = req.headers.get('cookie');
      console.log('Cookie header:', authHeader);
      if (authHeader) {
        const match = authHeader.match(/session-token=([^;]+)/);
        if (match) {
          sessionToken = decodeURIComponent(match[1]);
          console.log('Extracted token from header:', sessionToken?.substring(0, 50) + '...');
        }
      }
    } else {
      console.log('Token from cookies:', sessionToken?.substring(0, 50) + '...');
    }
    
    if (!sessionToken) {
      console.log('No session token found in cookies or headers');
      return null;
    }
    
    console.log('Found session token, validating...');
    const sessionData = await getSession(sessionToken);
    
    if (!sessionData) {
      console.log('Session validation failed');
      return null;
    }
    
    console.log('Session valid for user:', sessionData.userId);
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