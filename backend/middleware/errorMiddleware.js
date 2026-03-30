const errorMiddleware = (error, req, res, next) => {
  const mysqlConflictCodes = ['ER_DUP_ENTRY', 'ER_NO_REFERENCED_ROW_2', 'ER_ROW_IS_REFERENCED_2'];

  if (mysqlConflictCodes.includes(error.code)) {
    return res.status(400).json({ message: error.sqlMessage || error.message });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || 'Internal server error.',
  });
};

module.exports = errorMiddleware;
