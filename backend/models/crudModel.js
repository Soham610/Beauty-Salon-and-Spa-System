const pool = require('../config/db');

const buildSearch = (config, search) => {
  if (!search || !config.searchColumns || !config.searchColumns.length) {
    return { clause: '', params: [] };
  }

  const where = config.searchColumns.map((column) => `${column} LIKE ?`).join(' OR ');
  return {
    clause: `WHERE ${where}`,
    params: config.searchColumns.map(() => `%${search}%`),
  };
};

const filterPayload = (payload, allowedFields) => {
  const result = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      result[field] = payload[field];
    }
  });

  return result;
};

const list = async (config, search) => {
  const { clause, params } = buildSearch(config, search);
  const sql = `
    SELECT ${config.select}
    FROM ${config.from}
    ${clause}
    ORDER BY ${config.orderBy} ASC
  `;
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getById = async (config, id) => {
  const sql = `
    SELECT ${config.select}
    FROM ${config.from}
    WHERE ${config.idExpression} = ?
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};

const create = async (config, payload) => {
  const filtered = filterPayload(payload, config.allowedFields);
  const fields = Object.keys(filtered);
  const values = Object.values(filtered);

  const sql = `
    INSERT INTO ${config.table} (${fields.join(', ')})
    VALUES (${fields.map(() => '?').join(', ')})
  `;
  const [result] = await pool.query(sql, values);
  return getById(config, result.insertId);
};

const update = async (config, id, payload) => {
  const filtered = filterPayload(payload, config.allowedFields);
  const fields = Object.keys(filtered);

  if (!fields.length) {
    return getById(config, id);
  }

  const sql = `
    UPDATE ${config.table}
    SET ${fields.map((field) => `${field} = ?`).join(', ')}
    WHERE id = ?
  `;

  await pool.query(sql, [...fields.map((field) => filtered[field]), id]);
  return getById(config, id);
};

const remove = async (config, id) => {
  const [result] = await pool.query(`DELETE FROM ${config.table} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

const navigate = async (config, direction, currentId) => {
  const queries = {
    first: `
      SELECT ${config.select}
      FROM ${config.from}
      ORDER BY ${config.orderBy} ASC
      LIMIT 1
    `,
    last: `
      SELECT ${config.select}
      FROM ${config.from}
      ORDER BY ${config.orderBy} DESC
      LIMIT 1
    `,
    next: `
      SELECT ${config.select}
      FROM ${config.from}
      WHERE ${config.idExpression} > ?
      ORDER BY ${config.orderBy} ASC
      LIMIT 1
    `,
    previous: `
      SELECT ${config.select}
      FROM ${config.from}
      WHERE ${config.idExpression} < ?
      ORDER BY ${config.orderBy} DESC
      LIMIT 1
    `,
  };

  const sql = queries[direction] || queries.first;
  const params = direction === 'next' || direction === 'previous' ? [currentId || 0] : [];
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  navigate,
};
