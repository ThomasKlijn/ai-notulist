import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '../../../../lib/simple-auth';
import { cookies } from 'next/headers';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

// Multi-company configuration
const COMPANY_ACCOUNTS = {
  'VanDelftGroep': {
    password: process.env.AUTH_PASSWORD_VANDELFT || 'JWVD12',
    user: {
      id: 'vandelftgroep-user',
      email: 'info@vandelftgroep.nl',
      firstName: 'Jordi',
      lastName: 'van Delft',
      companyName: 'Van Delft Groep',
      companyId: 'vandelftgroep'
    }
  },
  'Klimax12': {
    password: process.env.AUTH_PASSWORD_KLIMAX || 'KLIMAX2025',
    user: {
      id: 'klimax12-user',
      email: 'info@klimax12.nl',
      firstName: 'Klimax',
      lastName: 'Team',
      companyName: 'Klimax12',
      companyId: 'klimax12'
    }
  }
} as const;

type CompanyName = keyof typeof COMPANY_ACCOUNTS;

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Check credentials against company accounts
    const company = COMPANY_ACCOUNTS[username as CompanyName];
    if (!company || password !== company.password) {
      const errorResponse = NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    
      // Add aggressive cache prevention headers
      errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
      errorResponse.headers.set('Pragma', 'no-cache');
      errorResponse.headers.set('Expires', '0');
      
      return errorResponse;
    }

    // Get user object from company configuration
    const user = {
      ...company.user,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create stateless session (no database required)
    const sessionToken = await createSession(user.id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
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