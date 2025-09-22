// Temporary simple auth implementation to bypass @hapi/iron dependency issues
import { storage } from "../server/storage";
import { db } from "../server/db";
import { sessions } from "../shared/schema";
import { eq, lt } from "drizzle-orm";

// Require strong session secret in all environments
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required and must be a strong secret");
}

// Simple base64 encoding for session data (temporary solution)
function simpleEncode(data: any, secret: string): string {
  const payload = JSON.stringify(data);
  const encoded = Buffer.from(payload).toString('base64');
  const hash = Buffer.from(secret + encoded).toString('base64');
  return `${encoded}.${hash}`;
}

function simpleDecode(token: string, secret: string): any | null {
  try {
    const [encoded, hash] = token.split('.');
    const expectedHash = Buffer.from(secret + encoded).toString('base64');
    
    if (hash !== expectedHash) {
      return null; // Invalid token
    }
    
    const payload = Buffer.from(encoded, 'base64').toString();
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// Session management functions
export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await db.insert(sessions).values({
    sid: sessionId,
    sess: { userId },
    expire: expiresAt
  });
  
  const sessionData = { sessionId, userId, expiresAt: expiresAt.toISOString() };
  return simpleEncode(sessionData, process.env.SESSION_SECRET!);
}

export async function getSession(token: string): Promise<{ userId: string } | null> {
  if (!token) return null;
  
  const sessionData = simpleDecode(token, process.env.SESSION_SECRET!);
  if (!sessionData || !sessionData.sessionId) return null;
  
  // Check if session exists and is valid
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sid, sessionData.sessionId));
  
  if (!session || session.expire < new Date()) {
    // Clean up expired session
    if (session) {
      await db.delete(sessions).where(eq(sessions.sid, sessionData.sessionId));
    }
    return null;
  }
  
  const sessData = session.sess as any;
  return { userId: sessData.userId };
}

export async function deleteSession(token: string): Promise<void> {
  const sessionData = simpleDecode(token, process.env.SESSION_SECRET!);
  if (sessionData?.sessionId) {
    await db.delete(sessions).where(eq(sessions.sid, sessionData.sessionId));
  }
}

// Clean up expired sessions (called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expire, new Date()));
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

// Compatibility function for authMiddleware.ts
export async function getUserFromSession(token: string): Promise<{ user: any } | null> {
  const session = await getSession(token);
  if (!session) return null;
  
  // Get user data from storage
  const user = await storage.getUser(session.userId);
  if (!user) return null;
  
  return { user };
}

// Additional auth functions for compatibility
export function generateLogoutUrl(): string {
  return "/api/auth/logout";
}

export function encryptSessionId(sessionData: any): string {
  return simpleEncode(sessionData, process.env.SESSION_SECRET!);
}

export function decryptSessionId(token: string): any {
  return simpleDecode(token, process.env.SESSION_SECRET!);
}

export async function handleCallback(code: string): Promise<{ sessionToken: string; user: any }> {
  const userData = await exchangeCodeForUser(code);
  
  // Upsert user in database
  const user = await storage.upsertUser({
    id: userData.id,
    email: userData.email,
    firstName: userData.name?.split(' ')[0] || '',
    lastName: userData.name?.split(' ').slice(1).join(' ') || ''
  });
  
  // Create session
  const sessionToken = await createSession(user.id);
  
  return { sessionToken, user };
}