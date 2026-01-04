import { Pool } from 'pg';

console.log('DATABASE_URL:', process.env.DATABASE_URL); // cek apa yang terbaca

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
