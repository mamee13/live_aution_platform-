import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/auction_db';

export const db = new Pool({
  connectionString: DATABASE_URL,
});

db.on('connect', () => {
  console.log('Worker connected to PostgreSQL');
});

db.on('error', err => {
  console.error('Worker database connection error:', err);
});
