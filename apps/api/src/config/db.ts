import { Pool } from 'pg';
import { env } from './env';

export const db = new Pool({
  connectionString: env.DATABASE_URL,
});

db.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

db.on('error', err => {
  console.error('Database connection error:', err);
});
