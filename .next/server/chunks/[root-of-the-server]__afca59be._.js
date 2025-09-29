module.exports = [
"[project]/.next-internal/server/app/api/auth/check/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/simple-auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Stateless authentication - no database required
// Simple JWT-like token system for VanDelft Groep login
// Uses Web APIs only - compatible with Node.js ≥18 and Edge runtime
// Session secret with production safety check
__turbopack_context__.s([
    "cleanupExpiredSessions",
    ()=>cleanupExpiredSessions,
    "createSession",
    ()=>createSession,
    "decryptSessionId",
    ()=>decryptSessionId,
    "deleteSession",
    ()=>deleteSession,
    "encryptSessionId",
    ()=>encryptSessionId,
    "exchangeCodeForUser",
    ()=>exchangeCodeForUser,
    "generateAuthUrl",
    ()=>generateAuthUrl,
    "generateLogoutUrl",
    ()=>generateLogoutUrl,
    "getSession",
    ()=>getSession,
    "getUserFromSession",
    ()=>getUserFromSession,
    "handleCallback",
    ()=>handleCallback
]);
const SESSION_SECRET = process.env.SESSION_SECRET || "super-secure-session-secret-key-for-vandelft-groep-ai-notulist-2025-render-deployment";
// Warn in production if default secret is used
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
// Dual-runtime base64url encoding - works in both Edge and Node.js
function base64urlEncode(str) {
    let base64;
    if (typeof btoa !== 'undefined') {
        // Browser/Edge environment - use btoa
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        let binaryString = '';
        for(let i = 0; i < bytes.length; i++){
            binaryString += String.fromCharCode(bytes[i]);
        }
        base64 = btoa(binaryString);
    } else {
        // Node.js environment - use Buffer
        base64 = Buffer.from(str, 'utf8').toString('base64');
    }
    // Make URL-safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
// Dual-runtime base64url decoding - works in both Edge and Node.js
function base64urlDecode(str) {
    // Add padding back
    let padded = str;
    while(padded.length % 4){
        padded += '=';
    }
    // Make base64-safe
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    if (typeof atob !== 'undefined') {
        // Browser/Edge environment - use atob
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for(let i = 0; i < binaryString.length; i++){
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
async function createSignedToken(data) {
    const payload = JSON.stringify(data);
    const signature = await createSignature(payload);
    const combined = JSON.stringify({
        payload,
        signature
    });
    return base64urlEncode(combined);
}
async function verifySignedToken(token) {
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
    } catch  {
        return null;
    }
}
// Web Crypto API signature creation - works in both Node.js ≥18 and Edge
async function createSignature(payload) {
    if (!globalThis.crypto?.subtle) {
        throw new Error('Web Crypto API not available. Requires Node.js ≥18 or Edge runtime.');
    }
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SESSION_SECRET);
    const payloadData = encoder.encode(payload);
    // Import secret as HMAC key
    const cryptoKey = await globalThis.crypto.subtle.importKey('raw', keyData, {
        name: 'HMAC',
        hash: 'SHA-256'
    }, false, [
        'sign'
    ]);
    // Create signature
    const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, payloadData);
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
}
async function createSession(userId) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const sessionData = {
        userId,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
    };
    return createSignedToken(sessionData);
}
async function getSession(token) {
    if (!token) return null;
    const sessionData = await verifySignedToken(token);
    if (!sessionData || !sessionData.userId) {
        return null;
    }
    return {
        userId: sessionData.userId
    };
}
async function deleteSession(token) {
// With stateless tokens, we can't "delete" them server-side
// The client should just remove the cookie
// Tokens will automatically expire based on their expiration time
}
async function cleanupExpiredSessions() {
// Nothing to clean up with stateless tokens
}
function generateAuthUrl(redirectUri) {
    const state = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).substr(2, 9);
    const authUrl = new URL("https://replit.com/oauth/authorize");
    authUrl.searchParams.set("client_id", process.env.REPL_ID || "");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "user:email");
    authUrl.searchParams.set("state", state);
    return authUrl.toString();
}
async function exchangeCodeForUser(code) {
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
        firstName: 'Jody',
        lastName: 'Klimax',
        companyName: 'Klimax12',
        companyId: 'klimax12'
    }
};
async function getUserFromSession(token) {
    const session = await getSession(token);
    if (!session) return null;
    // Return static user based on userId from session
    const userConfig = COMPANY_USERS[session.userId];
    if (userConfig) {
        const user = {
            ...userConfig,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return {
            user
        };
    }
    return null;
}
function generateLogoutUrl() {
    return "/api/auth/logout";
}
async function encryptSessionId(sessionData) {
    return createSignedToken(sessionData);
}
async function decryptSessionId(token) {
    return verifySignedToken(token);
}
async function handleCallback(code) {
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
    return {
        sessionToken,
        user
    };
}
}),
"[project]/app/api/auth/check/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$simple$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/simple-auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
;
async function GET(req) {
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        const sessionToken = cookieStore.get('session-token')?.value;
        if (!sessionToken) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                authenticated: false
            }, {
                status: 401
            });
        }
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$simple$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])(sessionToken);
        if (!session) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                authenticated: false
            }, {
                status: 401
            });
        }
        // Get full user details for welcome message
        const userResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$simple$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUserFromSession"])(sessionToken);
        if (!userResult) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                authenticated: false
            }, {
                status: 401
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            authenticated: true,
            userId: session.userId,
            user: userResult.user
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            authenticated: false
        }, {
            status: 401
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__afca59be._.js.map