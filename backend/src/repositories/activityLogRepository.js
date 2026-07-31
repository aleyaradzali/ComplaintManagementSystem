import { pool } from '../config/db.js';

export async function create(client, { complaint_id, action, description, performed_by }) {
  const { rows } = await client.query(
    `INSERT INTO activity_logs (complaint_id, action, description, performed_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, complaint_id, action, description, performed_by, created_at`,
    [complaint_id, action, description, performed_by]
  );
  return rows[0];
}

export async function findByComplaintId(complaintId) {
  const { rows } = await pool.query(
    `SELECT
       a.id, a.action, a.description, a.created_at,
       json_build_object('id', u.id, 'name', u.name) AS performed_by
     FROM activity_logs a
     JOIN users u ON u.id = a.performed_by
     WHERE a.complaint_id = $1
     ORDER BY a.created_at ASC`,
    [complaintId]
  );
  return rows;
}
