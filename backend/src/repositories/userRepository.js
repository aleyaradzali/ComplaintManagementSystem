import { pool } from '../config/db.js';

const PUBLIC_COLUMNS = 'id, name, email, role, created_at';

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function findAllOfficers() {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE role = 'officer' ORDER BY name ASC`
  );
  return rows;
}
