//global error handling middleware
const { AppError } = require('../errors/AppError')
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  //known application errors: respond with their status and message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  //mongoose schema validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message)[0] || 'Validation error'
    return res.status(400).json({ message })
  }

  //mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Resource already exists' })
  }

  //unexpected errors: log and return generic message (don't leak internals)
  logger.error('Unhandled server error', { error: err.message, path: req.path, method: req.method })
  res.status(500).json({ message: 'Internal server error' })
}

module.exports = { errorHandler }
