import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Graceful error handling
pool.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Unexpected PG pool error:", err);
});

export const assertDbConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
};

export const db = drizzle(pool, { schema });
export { pool };