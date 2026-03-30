const pool = require('../config/db');
const { normalizeNumber, normalizeString, validateRequired } = require('../config/modules');

const appointmentSelect = `
  ap.id,
  ap.service,
  DATE_FORMAT(ap.appt_date, '%Y-%m-%d') AS appt_date,
  TIME_FORMAT(ap.appt_time, '%H:%i') AS appt_time,
  ap.name,
  ap.email,
  ap.mobile,
  ap.address,
  ap.detail,
  ap.parlour,
  parlour_user.name AS parlour_name,
  ap.created_by,
  created_user.name AS created_by_name,
  ap.status,
  DATE_FORMAT(ap.date, '%Y-%m-%d %H:%i:%s') AS date,
  COALESCE(bill.total_bill, 0) AS total_bill
`;

const appointmentFrom = `
  appointment ap
  LEFT JOIN user parlour_user ON parlour_user.id = ap.parlour
  LEFT JOIN user created_user ON created_user.id = ap.created_by
  LEFT JOIN (
    SELECT appointment_id, SUM(price) AS total_bill
    FROM appointment_items
    GROUP BY appointment_id
  ) bill ON bill.appointment_id = ap.id
`;

const list = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const params = [];
    let whereClause = '';

    if (search) {
      whereClause = `
        WHERE CAST(ap.appt_date AS CHAR) LIKE ?
        OR ap.name LIKE ?
        OR ap.service LIKE ?
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(
      `
      SELECT ${appointmentSelect}
      FROM ${appointmentFrom}
      ${whereClause}
      ORDER BY ap.id ASC
      `,
      params
    );

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT ${appointmentSelect}
    FROM ${appointmentFrom}
    WHERE ap.id = ?
    `,
    [id]
  );

  return rows[0] || null;
};

const getOne = async (req, res, next) => {
  try {
    const appointment = await getById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.json({ data: appointment });
  } catch (error) {
    next(error);
  }
};

const getServicesForInvoice = async (connection, serviceIds) => {
  if (!serviceIds.length) {
    return [];
  }

  const placeholders = serviceIds.map(() => '?').join(', ');
  const [rows] = await connection.query(
    `
    SELECT id, title, price
    FROM services
    WHERE id IN (${placeholders}) AND status = 'active'
    ORDER BY id ASC
    `,
    serviceIds
  );

  return rows;
};

const parseAppointmentPayload = (body) => ({
  serviceIds: Array.isArray(body.serviceIds) ? body.serviceIds.map((value) => Number(value)).filter(Boolean) : [],
  appt_date: normalizeString(body.appt_date),
  appt_time: normalizeString(body.appt_time),
  name: normalizeString(body.name),
  email: normalizeString(body.email),
  mobile: normalizeString(body.mobile),
  address: normalizeString(body.address),
  detail: normalizeString(body.detail),
  parlour: normalizeNumber(body.parlour),
  created_by: normalizeNumber(body.created_by) || null,
  status: normalizeString(body.status) || 'booked',
  date: normalizeString(body.date),
});

const validateAppointment = (payload) => {
  const missing = validateRequired(payload, ['appt_date', 'appt_time', 'name', 'email', 'mobile', 'address', 'parlour', 'status']);

  if (!payload.serviceIds.length) {
    missing.push('serviceIds');
  }

  return missing;
};

const buildInvoice = (services) => {
  const items = services.map((service) => ({
    service_id: service.id,
    title: service.title,
    price: Number(service.price),
  }));

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    items,
    total,
  };
};

const create = async (req, res, next) => {
  const payload = parseAppointmentPayload(req.body);
  const missing = validateAppointment(payload);

  if (missing.length) {
    return res.status(400).json({ message: `Missing or invalid fields: ${missing.join(', ')}` });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const services = await getServicesForInvoice(connection, payload.serviceIds);

    if (services.length !== payload.serviceIds.length) {
      await connection.rollback();
      return res.status(400).json({ message: 'One or more selected services are invalid or inactive.' });
    }

    const invoice = buildInvoice(services);
    const serviceSummary = services.map((service) => service.title).join(', ');

    const [result] = await connection.query(
      `
      INSERT INTO appointment
      (service, appt_date, appt_time, name, email, mobile, address, detail, parlour, created_by, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
      `,
      [
        serviceSummary,
        payload.appt_date,
        payload.appt_time,
        payload.name,
        payload.email,
        payload.mobile,
        payload.address,
        payload.detail || null,
        payload.parlour,
        payload.created_by,
        payload.status,
        payload.date || null,
      ]
    );

    for (const item of invoice.items) {
      await connection.query(
        `
        INSERT INTO appointment_items (appointment_id, service_id, price)
        VALUES (?, ?, ?)
        `,
        [result.insertId, item.service_id, item.price]
      );
    }

    await connection.commit();
    const appointment = await getById(result.insertId);

    res.status(201).json({
      message: 'Appointment created successfully.',
      data: appointment,
      invoice: {
        appointmentId: result.insertId,
        serviceSummary,
        items: invoice.items,
        total: invoice.total,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const update = async (req, res, next) => {
  const payload = parseAppointmentPayload(req.body);
  const missing = validateAppointment(payload);

  if (missing.length) {
    return res.status(400).json({ message: `Missing or invalid fields: ${missing.join(', ')}` });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const existing = await getById(req.params.id);

    if (!existing) {
      await connection.rollback();
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const services = await getServicesForInvoice(connection, payload.serviceIds);

    if (services.length !== payload.serviceIds.length) {
      await connection.rollback();
      return res.status(400).json({ message: 'One or more selected services are invalid or inactive.' });
    }

    const invoice = buildInvoice(services);
    const serviceSummary = services.map((service) => service.title).join(', ');

    await connection.query(
      `
      UPDATE appointment
      SET service = ?, appt_date = ?, appt_time = ?, name = ?, email = ?, mobile = ?, address = ?, detail = ?, parlour = ?, created_by = ?, status = ?
      WHERE id = ?
      `,
      [
        serviceSummary,
        payload.appt_date,
        payload.appt_time,
        payload.name,
        payload.email,
        payload.mobile,
        payload.address,
        payload.detail || null,
        payload.parlour,
        payload.created_by,
        payload.status,
        req.params.id,
      ]
    );

    await connection.query('DELETE FROM appointment_items WHERE appointment_id = ?', [req.params.id]);

    for (const item of invoice.items) {
      await connection.query(
        'INSERT INTO appointment_items (appointment_id, service_id, price) VALUES (?, ?, ?)',
        [req.params.id, item.service_id, item.price]
      );
    }

    await connection.commit();
    const appointment = await getById(req.params.id);

    res.json({
      message: 'Appointment updated successfully.',
      data: appointment,
      invoice: {
        appointmentId: Number(req.params.id),
        serviceSummary,
        items: invoice.items,
        total: invoice.total,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const remove = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM appointment WHERE id = ?', [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.json({ message: 'Appointment deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const navigate = async (req, res, next) => {
  try {
    const direction = req.query.direction || 'first';
    const currentId = Number(req.query.currentId || 0);
    const queries = {
      first: `
        SELECT ${appointmentSelect}
        FROM ${appointmentFrom}
        ORDER BY ap.id ASC
        LIMIT 1
      `,
      last: `
        SELECT ${appointmentSelect}
        FROM ${appointmentFrom}
        ORDER BY ap.id DESC
        LIMIT 1
      `,
      next: `
        SELECT ${appointmentSelect}
        FROM ${appointmentFrom}
        WHERE ap.id > ?
        ORDER BY ap.id ASC
        LIMIT 1
      `,
      previous: `
        SELECT ${appointmentSelect}
        FROM ${appointmentFrom}
        WHERE ap.id < ?
        ORDER BY ap.id DESC
        LIMIT 1
      `,
    };

    const sql = queries[direction] || queries.first;
    const params = direction === 'next' || direction === 'previous' ? [currentId] : [];
    const [rows] = await pool.query(sql, params);

    if (!rows[0]) {
      return res.status(404).json({ message: 'No record found for this direction.' });
    }

    res.json({ data: rows[0] });
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const appointment = await getById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const [items] = await pool.query(
      `
      SELECT
        ai.id,
        ai.service_id,
        s.title AS service_name,
        ai.price
      FROM appointment_items ai
      INNER JOIN services s ON s.id = ai.service_id
      WHERE ai.appointment_id = ?
      ORDER BY ai.id ASC
      `,
      [req.params.id]
    );

    const total = items.reduce((sum, item) => sum + Number(item.price), 0);

    res.json({
      data: {
        appointment,
        items,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  navigate,
  getInvoice,
};
