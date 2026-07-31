import { pool } from '../config/db.js';

export async function getCategoryBreakdown() {
  const { rows } = await pool.query(
    `SELECT category, COUNT(*)::int AS count
     FROM complaints
     WHERE created_at >= date_trunc('month', CURRENT_DATE)
     GROUP BY category`
  );
  return rows;
}

export async function getComplaintsOverTime() {
  const { rows } = await pool.query(
    `SELECT to_char(d, 'YYYY-MM-DD') AS date, COUNT(c.id)::int AS count
     FROM generate_series(date_trunc('month', CURRENT_DATE)::date, CURRENT_DATE, interval '1 day') AS d
     LEFT JOIN complaints c ON DATE(c.created_at) = d::date
     GROUP BY d
     ORDER BY d`
  );
  return rows;
}
