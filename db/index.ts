import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';
import * as fs from 'fs';
import * as path from 'path';

// Read the Supabase configuration from the JSON file
const configPath = path.join(__dirname, '..', 'supabase-config.json');
const configData = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configData);

// Construct the connection string
const connectionString = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

// Create a pool with your Supabase database connection details
const pool = new Pool({ connectionString });

// Connect to the database using drizzle
export const db = drizzle(pool, { schema: schema });