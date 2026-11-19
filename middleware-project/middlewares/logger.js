const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('../config');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log(`✅ Created logs directory: ${logsDir}`);
}

// Create transports array
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  // Daily rotate file for all logs
  new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  // Daily rotate file for errors only
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  // Exit after logging an uncaught exception. Staying alive leaves the process
  // in an unknown state while health checks keep passing, so the platform never
  // restarts it — which is how a ReferenceError on startup went unnoticed for
  // weeks. Log it, exit, and let the supervisor restart a clean process.
  exitOnError: true
});

// Handle uncaught exceptions and unhandled rejections.
//
// winston's own exceptions.handle()/rejections.handle() wait for every
// attached transport to signal that it has flushed before they will exit, and
// winston-daily-rotate-file does not reliably emit that signal — so the
// process stayed alive in an unknown state while health checks kept passing.
// That is how a ReferenceError at startup went unnoticed. Handle both signals
// explicitly instead: log through the normal transports, allow a brief flush
// window, then exit non-zero so the supervisor restarts a clean process.
const FLUSH_MS = 1000;

const fatal = (kind) => (err) => {
  try {
    logger.error(`${kind}: ${err && err.message ? err.message : err}`, {
      kind,
      stack: err && err.stack
    });
  } catch (loggingError) {
    // Never let the handler itself be the reason we fail to report.
    console.error(`${kind}:`, err);
  }
  // Not unref'd: the timer must keep the process alive long enough to reach
  // the exit, so the code is always 1 rather than an incidental 0.
  setTimeout(() => process.exit(1), FLUSH_MS);
};

process.on('uncaughtException', fatal('uncaughtException'));
process.on('unhandledRejection', fatal('unhandledRejection'));

// Test the logger
logger.info('Logger initialized successfully');
logger.info(`Log level: ${config.LOG_LEVEL}`);
logger.info(`Logs directory: ${logsDir}`);

exports.logger = logger;

exports.requestLogger = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  
  req.log = logger.child({ 
    requestId, 
    route: req.originalUrl, 
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  req.log.info('Incoming request');

  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    req.log.info('Request completed', { 
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    });
  });

  next();
};
// Export base logger for global use (e.g., services)
exports.logger = logger;
