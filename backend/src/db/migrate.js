import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function schemaAlreadyExists(client) {
  const { rows } = await client.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = 'users'
    ) AS exists
  `);
  return rows[0].exists;
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const applied = await getAppliedMigrations(client);

    // Bootstrap: if the schema was already created outside of this tracker
    // (e.g. seeded manually before this script existed), mark existing
    // migration files as applied instead of re-running DDL that already ran.
    if (applied.size === 0 && (await schemaAlreadyExists(client))) {
      for (const file of files) {
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      }
      console.log(`Bootstrapped ${files.length} already-applied migration(s).`);
      return;
    }

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`Applying migration: ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log('Migrations up to date.');
  } finally {
    client.release();
  }
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Migration failed:', err.message);
      pool.end();
      process.exit(1);
    });
}
