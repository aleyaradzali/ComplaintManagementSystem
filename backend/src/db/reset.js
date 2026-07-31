import 'dotenv/config';
import pg from 'pg';
import { runMigrations } from './migrate.js';
import { seed } from './seeds/seed.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function dropAll() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS complaints CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS schema_migrations CASCADE;
      DROP TYPE IF EXISTS user_role CASCADE;
      DROP TYPE IF EXISTS complaint_category CASCADE;
      DROP TYPE IF EXISTS complaint_status CASCADE;
      DROP TYPE IF EXISTS activity_action CASCADE;
    `);
    console.log('Dropped existing schema.');
  } finally {
    client.release();
  }
}

async function reset() {
  await dropAll();
  await runMigrations();
  await seed();
}

reset()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Reset failed:', err.message);
    pool.end();
    process.exit(1);
  });
