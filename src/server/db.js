// src/server/db.js
import path from "path";
import { fileURLToPath } from "url";



import pkg from "pg";
const { Pool } = pkg;

import dotenv from "dotenv";

// Load local .env only in dev (Render uses dashboard env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, ".env") });
}

// Prefer single DATABASE_URL; fall back to individual vars if needed
const hasUrl = !!process.env.DATABASE_URL;

const baseConfig = hasUrl
  ? {
      connectionString: process.env.DATABASE_URL,
      // Supabase needs TLS; Render PG also supports TLS.
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 5432),
      ssl:
        process.env.PGSSLMODE === "require"
          ? { rejectUnauthorized: false }
          : undefined,
    };

// Reasonable pool tuning for serverless-ish platforms
const pool = new Pool({
  ...baseConfig,
  max: 10,                // max concurrent connections
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,

  
});

// Log unexpected pool errors
pool.on("error", (err) => {
  console.error("Unexpected PG pool error:", err);
});

export default pool;

// Optional helper you can import if you want a quick health check elsewhere
export async function dbHealth() {
  await pool.query("SELECT 1");
  return true;
}
