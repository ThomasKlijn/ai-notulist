// Stateless authentication - no database required
// Simple JWT-like token system for VanDelft Groep login

// Use a secure default secret (in production, set SESSION_SECRET env var)
const SESSION_SECRET = process.env.SESSION_SECRET || "super-secure-session-secret-key-for-vandelft-groep-ai-notulist-2025-render-deployment";

// Simple token creation with signature (JWT-like but simplified)
function createSignedToken(data: any): string {
  const payload = JSON.stringify(data);
  const signature = createSignature(payload);
  const combined = JSON.stringify({ payload, signature });
  return Buffer.from(combined).toString('base64url');
}

function verifySignedToken(token: string): any | null {
  try {
    const combined = Buffer.from(token, 'base64url').toString();
    const { payload, signature } = JSON.parse(combined);
    
    // Verify signature
    const expectedSignature = createSignature(payload);
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

// Simple signature creation using session secret
function createSignature(payload: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
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
  
  const sessionData = verifySignedToken(token);
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
  const state = crypto.randomUUID();
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

// Compatibility function for authMiddleware.ts - no database required
export async function getUserFromSession(token: string): Promise<{ user: any } | null> {
  const session = await getSession(token);
  if (!session) return null;
  
  // Return static user for VanDelft Groep login
  if (session.userId === 'vandelftgroep-user') {
    const user = {
      id: 'vandelftgroep-user',
      email: 'info@vandelftgroep.nl',
      firstName: 'Van Delft',
      lastName: 'Groep',
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

export function encryptSessionId(sessionData: any): string {
  return createSignedToken(sessionData);
}

export function decryptSessionId(token: string): any {
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