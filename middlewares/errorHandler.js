function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const payload = { success: false, message };
  if (err.details) payload.details = err.details;

  console.error('ErrorHandler:', err);
  res.status(status).json(payload);
}

export { errorHandler, asyncHandler };