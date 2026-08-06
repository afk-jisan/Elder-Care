export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
}
