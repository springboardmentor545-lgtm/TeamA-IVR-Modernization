const { logger } = require('./middlewares/logger');

console.log('Testing logger...');

// Test different log levels
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');

// Test with objects
logger.info('User action', { 
  userId: 123, 
  action: 'login', 
  timestamp: new Date().toISOString() 
});

// Test error with stack trace
logger.error('Database connection failed', new Error('Connection timeout'));

console.log('✅ Test logs written. Check logs/ directory for today\'s date');