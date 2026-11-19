// index.js
const express = require('express');
const path = require('path');
const cors = require('cors');

console.log('1. Starting server initialization...');

let requestLogger;
try {
  ({ requestLogger } = require('./middlewares/logger'));
  console.log('2. Logger loaded successfully');
} catch (err) {
  console.log('❌ Logger load failed:', err.message);
  process.exit(1);
}

let config;
try {
  config = require('./config');
  console.log('3. Config loaded successfully');
} catch (err) {
  console.log('❌ Config load failed:', err.message);
  process.exit(1);
}

// Initialize Express
const app = express();
const PORT = config.PORT;

// Restrict cross-origin access to an allowlist. Requests with no Origin header
// (same-origin browser requests, curl, Postman) are unaffected by CORS and pass
// through untouched. A disallowed origin gets no CORS headers rather than an
// error, which is what the browser needs to block the response.
const allowLocalhostOrigins = config.NODE_ENV !== 'production';
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.CORS_ORIGINS.includes(origin)) return callback(null, true);
    if (allowLocalhostOrigins && LOCALHOST_ORIGIN.test(origin)) return callback(null, true);
    return callback(null, false);
  }
}));
console.log(
  config.CORS_ORIGINS.length
    ? `3b. CORS allowlist: ${config.CORS_ORIGINS.join(', ')}`
    : '3b. CORS: same-origin only' + (allowLocalhostOrigins ? ' (plus localhost in development)' : '')
);

app.use(express.json());

// ✅ Serve static frontend (index.html, app.js, etc.)
app.use(express.static(path.join(__dirname, 'public')));
console.log('4. Static frontend served from /public');

// ✅ Request logger middleware
app.use(requestLogger);
console.log('5. Request logger middleware added');

// ✅ Health/test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend connected successfully!', timestamp: new Date().toISOString() });
});
console.log('6. Test route added');

// ✅ Load routes with safe error handling
try {
  const ivrRoutes = require('./routes/ivrRoutes');
  app.use('/ivr', ivrRoutes);
  console.log('7. IVR routes loaded');
} catch (err) {
  console.log('❌ IVR routes failed:', err.message);
}

try {
  const acsRoutes = require('./routes/acsRoutes');
  app.use('/acs', acsRoutes);
  console.log('8. ACS routes loaded');
} catch (err) {
  console.log('❌ ACS routes failed:', err.message);
}

try {
  const bapRoutes = require('./routes/bapRoutes');
  app.use('/bap', bapRoutes);
  console.log('9. BAP routes loaded');
} catch (err) {
  console.log('❌ BAP routes failed:', err.message);
}

// ✅ Error handler (keep at the end) — preserves err.status/err.type and requestId
app.use(require('./middlewares/errorHandler'));

// ✅ Start the server (single instance only)
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Test it with: curl http://localhost:${PORT}/test`);
});

// ✅ Print available routes
setTimeout(() => {
  console.log('\nAvailable routes:');
  console.log('GET   /');
  console.log('GET   /test');
  console.log('POST  /ivr/input');
  console.log('POST  /ivr/conversation');
  console.log('POST  /ivr/conversation-i18n');
  console.log('POST  /acs/start');
  console.log('POST  /acs/stop');
  console.log('POST  /acs/sendDTMF');
  console.log('POST  /bap/process');
}, 500);
console.log('10. Server initialization complete.');
