// Stateless authentication - no database required
// Simple JWT-like token system for VanDelft Groep login
// Uses Web APIs only - compatible with Node.js ≥18 and Edge runtime

// Session secret with production safety check
const SESSION_SECRET = process.env.SESSION_SECRET || "super-secure-session-secret-key-for-vandelft-groep-ai-notulist-2025-render-deployment";

// Warn in production if default secret is used
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error('🚨 SECURITY WARNING: Using default SESSION_SECRET in production! Set SESSION_SECRET environment variable.');
}

// Dual-runtime base64url encoding - works in both Edge and Node.js
function base64urlEncode(str: string): string {
  let base64: string;
  
  if (typeof btoa !== 'undefined') {
    // Browser/Edge environment - use btoa
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binaryString);
  } else {
    // Node.js environment - use Buffer
    base64 = Buffer.from(str, 'utf8').toString('base64');
  }
  
  // Make URL-safe
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Dual-runtime base64url decoding - works in both Edge and Node.js
function base64urlDecode(str: string): string {
  // Add padding back
  let padded = str;
  while (padded.length % 4) {
    padded += '=';
  }
  
  // Make base64-safe
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  
  if (typeof atob !== 'undefined') {
    // Browser/Edge environment - use atob
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } else {
    // Node.js environment - use Buffer
    return Buffer.from(base64, 'base64').toString('utf8');
  }
}

// Simple token creation with signature (JWT-like but simplified) - Edge compatible
async function createSignedToken(data: any): Promise<string> {
  const payload = JSON.stringify(data);
  const signature = await createSignature(payload);
  const combined = JSON.stringify({ payload, signature });
  return base64urlEncode(combined);
}

async function verifySignedToken(token: string): Promise<any | null> {
  try {
    const combined = base64urlDecode(token);
    const { payload, signature } = JSON.parse(combined);
    
    // Verify signature
    const expectedSignature = await createSignature(payload);
    if (signature !== expectedSignature) {
      return null;
    }
    
    const data = JSON.parse(payload);
    
    // Check expiration
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

// Web Crypto API signature creation - works in both Node.js ≥18 and Edge
async function createSignature(payload: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API not available. Requires Node.js ≥18 or Edge runtime.');
  }
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  const payloadData = encoder.encode(payload);
  
  // Import secret as HMAC key
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Create signature
  const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, payloadData);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Stateless session management - no database required
export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const sessionData = { 
    userId, 
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  };
  return createSignedToken(sessionData);
}

export async function getSession(token: string): Promise<{ userId: string } | null> {
  if (!token) return null;
  
  const sessionData = await verifySignedToken(token);
  if (!sessionData || !sessionData.userId) {
    return null;
  }
  
  return { userId: sessionData.userId };
}

export async function deleteSession(token: string): Promise<void> {
  // With stateless tokens, we can't "delete" them server-side
  // The client should just remove the cookie
  // Tokens will automatically expire based on their expiration time
}

// No cleanup needed for stateless sessions
export async function cleanupExpiredSessions(): Promise<void> {
  // Nothing to clean up with stateless tokens
}

// Generate auth URL for Replit OAuth (simplified)
export function generateAuthUrl(redirectUri: string): string {
  const state = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).substr(2, 9);
  const authUrl = new URL("https://replit.com/oauth/authorize");
  authUrl.searchParams.set("client_id", process.env.REPL_ID || "");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "user:email");
  authUrl.searchParams.set("state", state);
  
  return authUrl.toString();
}

// Exchange code for user info (simplified - would need full OAuth implementation)
export async function exchangeCodeForUser(code: string): Promise<any> {
  // This is a simplified version - in production you'd need full OAuth flow
  // For now, return a mock user for testing
  console.log("Auth code received:", code);
  return {
    id: "temp-user-" + Math.random().toString(36).substr(2, 9),
    email: "test@example.com",
    name: "Test User"
  };
}

// Multi-company user configurations
const COMPANY_USERS = {
  'vandelftgroep-user': {
    id: 'vandelftgroep-user',
    email: 'info@vandelftgroep.nl',
    firstName: 'Jordi',
    lastName: 'van Delft',
    companyName: 'Van Delft Groep',
    companyId: 'vandelftgroep'
  },
  'klimax12-user': {
    id: 'klimax12-user',
    email: 'info@klimax12.nl',
    firstName: 'Klimax',
    lastName: 'Team',
    companyName: 'Klimax12',
    companyId: 'klimax12'
  }
} as const;

// Compatibility function for authMiddleware.ts - no database required
export async function getUserFromSession(token: string): Promise<{ user: any } | null> {
  const session = await getSession(token);
  if (!session) return null;
  
  // Return static user based on userId from session
  const userConfig = COMPANY_USERS[session.userId as keyof typeof COMPANY_USERS];
  if (userConfig) {
    const user = {
      ...userConfig,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return { user };
  }
  
  return null;
}

// Additional auth functions for compatibility
export function generateLogoutUrl(): string {
  return "/api/auth/logout";
}

export async function encryptSessionId(sessionData: any): Promise<string> {
  return createSignedToken(sessionData);
}

export async function decryptSessionId(token: string): Promise<any> {
  return verifySignedToken(token);
}

export async function handleCallback(code: string): Promise<{ sessionToken: string; user: any }> {
  const userData = await exchangeCodeForUser(code);
  
  // Static user - no database required
  const user = {
    id: userData.id,
    email: userData.email,
    firstName: userData.name?.split(' ')[0] || '',
    lastName: userData.name?.split(' ').slice(1).join(' ') || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Create stateless session
  const sessionToken = await createSession(user.id);
  
  return { sessionToken, user };
}