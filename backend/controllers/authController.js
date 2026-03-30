const pool = require('../config/db');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, type, status FROM admin WHERE email = ? AND password = ? AND status = "active" LIMIT 1',
      [email, password]
    );

    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    req.session.admin = admin;
    res.json({ message: 'Login successful.', data: admin });
  } catch (error) {
    next(error);
  }
};

const getSession = (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  return res.json({ data: req.session.admin });
};

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.json({ message: 'Logged out successfully.' });
  });
};

module.exports = {
  login,
  getSession,
  logout,
};
