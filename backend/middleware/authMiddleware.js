const requireAuth = (req, res, next) => {
  if (!req.session.admin) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  return next();
};

module.exports = requireAuth;
