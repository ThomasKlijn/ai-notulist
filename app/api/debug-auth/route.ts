import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../lib/simple-auth';

export async function GET(req: NextRequest) {
  try {
    // Debug cookie parsing
    const cookieHeader = req.headers.get('cookie');
    console.log('DEBUG: Cookie header:', cookieHeader);
    
    let sessionToken = req.cookies.get('session-token')?.value;
    console.log('DEBUG: Token from req.cookies:', sessionToken?.substring(0, 50) + '...');
    
    if (!sessionToken && cookieHeader) {
      const match = cookieHeader.match(/session-token=([^;]+)/);
      if (match) {
        sessionToken = decodeURIComponent(match[1]);
        console.log('DEBUG: Token from header match:', sessionToken?.substring(0, 50) + '...');
      }
    }
    
    if (!sessionToken) {
      return NextResponse.json({
        error: 'No session token found',
        cookieHeader,
        cookies: Object.fromEntries(req.cookies.getAll().map(c => [c.name, c.value?.substring(0, 50) + '...']))
      });
    }
    
    console.log('DEBUG: Validating session...');
    const sessionData = await getSession(sessionToken);
    console.log('DEBUG: Session validation result:', sessionData);
    
    return NextResponse.json({
      success: true,
      sessionValid: !!sessionData,
      sessionData,
      tokenLength: sessionToken.length
    });
    
  } catch (error) {
    console.error('DEBUG: Error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}