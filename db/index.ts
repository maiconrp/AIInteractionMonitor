import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import * as dotenv from 'dotenv'

dotenv.config();

// Create a pool with your Supabase database connection details
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Connect to the database using drizzle
export const db = drizzle(pool, { schema: schema });