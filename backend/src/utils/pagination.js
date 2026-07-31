const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}
