import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema";

// WebSocket setup - compatible with serverless environments like Render
if (typeof WebSocket === 'undefined') {
  try {
    // @ts-ignore
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
  } catch (error) {
    console.log('WebSocket not available in this environment, using HTTP pooling');
    // neonConfig will fall back to HTTP pooling
  }
} else {
  // Use native WebSocket in browser/edge environments
  neonConfig.webSocketConstructor = WebSocket;
}

// Lazy database connection - doesn't crash at startup if DATABASE_URL is missing
let _db: any;
let _pool: any;

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

export function getPool() {
  if (!_pool) {
    getDb(); // Initialize both
  }
  return _pool;
}

// For backward compatibility
export const pool = new Proxy({} as any, {
  get(target, prop) {
    return getPool()[prop];
  }
});

export const db = new Proxy({} as any, {
  get(target, prop) {
    return getDb()[prop];
  }
});