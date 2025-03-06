import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { performance } from 'perf_hooks';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const logQueryTime = (sql: string, timeMs: number) => {
  if (timeMs > 100) { // Log slow queries (>100ms)
    console.warn(`SLOW QUERY (${timeMs}ms): ${sql}`);
  } else {
    console.debug(`Query executed in ${timeMs}ms: ${sql.substring(0, 80)}${sql.length > 80 ? '...' : ''}`);
  }
};

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ 
  client: pool, 
  schema,
  logger: {
    logQuery: (query, params) => {
      const start = performance.now();
      pool.query(query, params)
        .then(() => {
          const duration = performance.now() - start;
          logQueryTime(query, duration);
        })
        .catch(error => {
          console.error("Query execution error:", error);
        });
    }
  } 
});