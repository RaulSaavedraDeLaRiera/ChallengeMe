//winston logger configuration for persistent logging
const winston = require('winston');
const path = require('path');
const fs = require('fs');

//determine if we should use file logging (local development) or console only (production/cloud)
const isProduction = process.env.NODE_ENV === 'production';
const useFileLogging = process.env.USE_FILE_LOGGING === 'true' || !isProduction;

//define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

//define console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

//create transports array
const transports = [];

//add file transports only in local development or if explicitly enabled
if (useFileLogging) {
  //create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  transports.push(
    //write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, //5MB
      maxFiles: 5
    }),
    //write errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, //5MB
      maxFiles: 5
    })
  );
}

//always add console transport (Render and other cloud services capture stdout/stderr)
transports.push(
  new winston.transports.Console({
    format: isProduction ? logFormat : consoleFormat
  })
);

//create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'challengeme-backend' },
  transports: transports
});

//handle uncaught exceptions and unhandled rejections
if (useFileLogging) {
  const logsDir = path.join(__dirname, '../logs');
  logger.exceptionHandlers = [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880, //5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: logFormat
    })
  ];
  logger.rejectionHandlers = [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880, //5MB
      maxFiles: 5
    }),
    new winston.transports.Console({
      format: logFormat
    })
  ];
} else {
  //in production, log exceptions/rejections to console (captured by Render)
  logger.exceptionHandlers = [
    new winston.transports.Console({
      format: logFormat
    })
  ];
  logger.rejectionHandlers = [
    new winston.transports.Console({
      format: logFormat
    })
  ];
}

module.exports = logger;


