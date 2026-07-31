import { pool } from '../config/db.js';

const SORT_COLUMNS = new Set(['created_at', 'updated_at', 'title', 'status', 'category', 'complainant_name']);

const LIST_SELECT = `
  SELECT
    c.id, c.title, c.category, c.status, c.complainant_name,
    c.created_at, c.updated_at,
    CASE WHEN u.id IS NULL THEN NULL
         ELSE json_build_object('id', u.id, 'name', u.name)
    END AS assigned_to
  FROM complaints c
  LEFT JOIN users u ON u.id = c.assigned_to
`;

const DETAIL_SELECT = `
  SELECT
    c.id, c.title, c.description, c.category, c.status,
    c.complainant_name, c.complainant_phone, c.complainant_email,
    c.created_at, c.updated_at,
    CASE WHEN u.id IS NULL THEN NULL
         ELSE json_build_object('id', u.id, 'name', u.name)
    END AS assigned_to
  FROM complaints c
  LEFT JOIN users u ON u.id = c.assigned_to
`;

export async function create(client, data) {
  const { rows } = await client.query(
    `INSERT INTO complaints
       (title, description, category, complainant_name, complainant_phone, complainant_email)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, description, category, status, complainant_name,
               complainant_phone, complainant_email, assigned_to, created_at, updated_at`,
    [
      data.title,
      data.description,
      data.category,
      data.complainant_name,
      data.complainant_phone ?? null,
      data.complainant_email ?? null,
    ]
  );
  return rows[0];
}

export async function findPaginated({
  status,
  category,
  sort,
  order,
  assignedTo,
  search,
  limit,
  offset,
}) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`c.status = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`c.category = $${params.length}`);
  }
  if (assignedTo !== undefined) {
    params.push(assignedTo);
    conditions.push(`c.assigned_to = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    const searchParam = `$${params.length}`;
    conditions.push(`(c.title ILIKE ${searchParam} OR c.complainant_name ILIKE ${searchParam})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortColumn = SORT_COLUMNS.has(sort) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const itemsQuery = `
    ${LIST_SELECT}
    ${where}
    ORDER BY c.${sortColumn} ${sortOrder}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;
  const countQuery = `SELECT COUNT(*)::int AS total FROM complaints c ${where}`;

  const [itemsResult, countResult] = await Promise.all([
    pool.query(itemsQuery, params),
    pool.query(countQuery, params.slice(0, conditions.length)),
  ]);

  return { items: itemsResult.rows, total: countResult.rows[0].total };
}

export async function findById(id) {
  const { rows } = await pool.query(`${DETAIL_SELECT} WHERE c.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function updateStatus(client, id, status) {
  const { rows } = await client.query(
    `UPDATE complaints SET status = $1 WHERE id = $2
     RETURNING id, title, description, category, status, complainant_name,
               complainant_phone, complainant_email, assigned_to, created_at, updated_at`,
    [status, id]
  );
  return rows[0] ?? null;
}

export async function updateAssignment(client, id, assignedTo) {
  const { rows } = await client.query(
    `UPDATE complaints SET assigned_to = $1 WHERE id = $2
     RETURNING id, title, description, category, status, complainant_name,
               complainant_phone, complainant_email, assigned_to, created_at, updated_at`,
    [assignedTo, id]
  );
  return rows[0] ?? null;
}
