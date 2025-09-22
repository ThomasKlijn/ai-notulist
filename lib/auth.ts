import { Issuer, Client, generators } from "openid-client";
import { seal, unseal } from "@hapi/iron";
import { storage } from "../server/storage";
import { db } from "../server/db";
import { sessions } from "../shared/schema";
import { eq, lt } from "drizzle-orm";
import memoize from "memoizee";

// Require strong session secret in all environments
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required and must be a strong secret");
}

const COOKIE_SECRET = process.env.SESSION_SECRET;

// Memoized OIDC Issuer discovery 
const getIssuer = memoize(
  async () => {
    return await Issuer.discover(process.env.ISSUER_URL ?? "https://replit.com/oidc");
  },
  { maxAge: 3600 * 1000 } // 1 hour cache
);

// Get OIDC Client
async function getClient(redirectUri: string): Promise<Client> {
  const issuer = await getIssuer();
  return new issuer.Client({
    client_id: process.env.REPL_ID!,
    redirect_uris: [redirectUri],
    response_types: ['code'],
    token_endpoint_auth_method: 'none' // PKCE without client secret
  });
}

// Generate secure auth URL with PKCE and state
export async function generateAuthUrl(domain: string): Promise<{ url: string; state: string; codeVerifier: string; nonce: string }> {
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${domain}/api/auth/callback`;
  
  const client = await getClient(redirectUri);
  const state = generators.state();
  const nonce = generators.nonce();
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  
  const authUrl = client.authorizationUrl({
    scope: 'openid email profile offline_access',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'login consent'
  });
  
  return { url: authUrl, state, codeVerifier, nonce };
}

// Handle OAuth callback with proper verification
export async function handleCallback(
  code: string, 
  state: string,
  domain: string,
  storedState: string,
  codeVerifier: string,
  nonce: string
) {
  // Verify state parameter
  if (state !== storedState) {
    throw new Error('Invalid state parameter');
  }
  
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${domain}/api/auth/callback`;
  
  const client = await getClient(redirectUri);
  
  // Exchange code for tokens with PKCE verification
  const tokenSet = await client.callback(redirectUri, { code, state }, { 
    nonce, 
    code_verifier: codeVerifier 
  });
  
  const claims = tokenSet.claims();
  
  // Create or update user in database with fallback claim mappings
  const user = await storage.upsertUser({
    id: claims.sub!,
    email: claims.email ?? null,
    firstName: claims.first_name ?? claims.given_name ?? null,
    lastName: claims.last_name ?? claims.family_name ?? null,
    profileImageUrl: claims.profile_image_url ?? claims.picture ?? null,
  });
  
  // Create secure session in database
  const sessionId = generators.random(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await db.insert(sessions).values({
    sid: sessionId,
    sess: {
      userId: user.id,
      user: user,
      expires_at: Math.floor(expiresAt.getTime() / 1000),
      access_token: tokenSet.access_token,
      refresh_token: tokenSet.refresh_token
    },
    expire: expiresAt
  });
  
  return { sessionId, user };
}

// Generate logout URL
export async function generateLogoutUrl(domain: string): Promise<string> {
  const issuer = await getIssuer();
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  
  return issuer.endSessionUrl({
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: `${protocol}://${domain}`
  });
}

// Encrypt session ID for cookie
export async function encryptSessionId(sessionId: string): Promise<string> {
  return await seal(sessionId, COOKIE_SECRET, {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Decrypt session ID from cookie
export async function decryptSessionId(encryptedSessionId: string): Promise<string> {
  return await unseal(encryptedSessionId, COOKIE_SECRET);
}

// Get user from session
export async function getUserFromSession(encryptedSessionId: string) {
  try {
    const sessionId = await decryptSessionId(encryptedSessionId);
    
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sid, sessionId));
    
    if (!session || new Date() > session.expire) {
      return null;
    }
    
    // Return user from session data
    return session.sess as any;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions() {
  const now = new Date();
  const result = await db
    .delete(sessions)
    .where(lt(sessions.expire, now));
  
  console.log(`Cleaned up expired sessions: ${result.rowCount || 0} sessions removed`);
  return result;
}

// Delete specific session (for logout)
export async function deleteSession(sessionId: string) {
  await db
    .delete(sessions)
    .where(eq(sessions.sid, sessionId));
}