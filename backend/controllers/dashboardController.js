const pool = require('../config/db');

const getStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM admin) AS total_admins,
        (SELECT COUNT(*) FROM user) AS total_users,
        (SELECT COUNT(*) FROM user WHERE is_parlour = 1) AS total_parlours,
        (SELECT COUNT(*) FROM categories) AS total_categories,
        (SELECT COUNT(*) FROM services) AS total_services,
        (SELECT COUNT(*) FROM appointment) AS total_appointments,
        (
          SELECT COALESCE(SUM(ai.price), 0)
          FROM appointment_items ai
          INNER JOIN appointment ap ON ap.id = ai.appointment_id
          WHERE ap.status <> 'cancelled'
        ) AS total_revenue
    `);

    const [recentAppointments] = await pool.query(`
      SELECT
        ap.id,
        ap.name,
        ap.service,
        DATE_FORMAT(ap.appt_date, '%Y-%m-%d') AS appt_date,
        TIME_FORMAT(ap.appt_time, '%H:%i') AS appt_time,
        ap.status,
        u.name AS parlour_name,
        COALESCE(bill.total_bill, 0) AS total_bill
      FROM appointment ap
      LEFT JOIN user u ON u.id = ap.parlour
      LEFT JOIN (
        SELECT appointment_id, SUM(price) AS total_bill
        FROM appointment_items
        GROUP BY appointment_id
      ) bill ON bill.appointment_id = ap.id
      ORDER BY ap.id DESC
      LIMIT 5
    `);

    res.json({
      data: {
        stats: rows[0],
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
