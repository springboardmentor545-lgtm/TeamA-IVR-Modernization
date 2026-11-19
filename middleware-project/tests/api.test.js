// Integration tests. Boots the real server as a child process on a test port
// and exercises it over HTTP, so routing, validation, the error handler and
// CORS are all covered as they actually run.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = 3987;
const BASE = `http://localhost:${PORT}`;
const ROOT = path.join(__dirname, '..');

let server;

const post = (route, body, headers = {}) =>
  fetch(`${BASE}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

const ask = async (query, sessionId = 'test-session') => {
  const res = await post('/ivr/conversation', { sessionId, query });
  const json = await res.json();
  return json?.data?.response;
};

before(async () => {
  server = spawn(process.execPath, ['index.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development', CORS_ORIGINS: '' },
    stdio: 'ignore'
  });

  const deadline = Date.now() + 20000;
  for (;;) {
    try {
      const res = await fetch(`${BASE}/test`);
      if (res.ok) return;
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline) throw new Error('server did not start within 20s');
    await new Promise((r) => setTimeout(r, 200));
  }
});

after(() => {
  if (server) server.kill();
});

describe('health and static UI', () => {
  // Regression: a stray identifier at the end of index.js threw on every boot.
  // If that came back the server would not reach a serving state at all.
  test('starts on the injected PORT and answers /test', async () => {
    const res = await fetch(`${BASE}/test`);
    assert.equal(res.status, 200);
    assert.match((await res.json()).message, /connected/i);
  });

  test('serves the UI at /', async () => {
    const res = await fetch(`${BASE}/`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /Conversational IVR/i);
  });
});

describe('POST /ivr/conversation', () => {
  test('answers a balance query', async () => {
    assert.match(await ask('what is my balance'), /balance/i);
  });

  test('routes BAP intents', async () => {
    assert.match(await ask('show my mini statement'), /transactions/i);
    assert.match(await ask('loan details'), /loan|EMI/i);
    assert.match(await ask('pay my utility bill'), /customer ID|utility/i);
  });

  // Regression: bapService.agentConnect was not exported and intentHandler
  // called a handleAgentHandoff that never existed, so this silently returned
  // a hardcoded "please hold" string instead of the service response.
  test('agent handoff reaches the BAP service', async () => {
    assert.match(await ask('connect me to an agent'), /connected to a customer service agent/i);
  });

  // Regression: acsService required the contiguous string "lost card" while
  // detectIntent used a regex, so the intent was detected then rejected.
  test('handles lost-card phrasings end to end', async () => {
    for (const q of ['report lost card', 'I lost my card', 'I lost my debit card', 'please block it']) {
      assert.match(await ask(q), /blocked immediately/i, `failed for: ${q}`);
    }
  });

  test('falls back politely on an unknown query', async () => {
    assert.match(await ask('play music'), /didn't understand|rephrase/i);
  });

  // Regression: the error handler hardcoded status 500, so deliberate 400s
  // from the controller surfaced as 500s.
  test('missing fields return 400, not 500', async () => {
    for (const body of [{}, { sessionId: 's1' }, { query: 'balance' }]) {
      const res = await post('/ivr/conversation', body);
      assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
      const json = await res.json();
      assert.equal(json.error, 'validation_error');
      assert.ok(json.requestId, 'expected a requestId on the error');
    }
  });

  // Regression: no body at all left req.body undefined, and destructuring it
  // threw a TypeError that surfaced as a 500.
  test('an entirely empty body returns 400, not 500', async () => {
    assert.equal((await post('/ivr/conversation', undefined)).status, 400);
    assert.equal(
      (await fetch(`${BASE}/ivr/conversation`, { method: 'POST' })).status,
      400
    );
  });
});

describe('POST /ivr/conversation-i18n', () => {
  // Regression: lang was hardcoded to "en", discarding the detected value.
  test('reports the detected source language', async () => {
    const hinglish = await (await post('/ivr/conversation-i18n', {
      sessionId: 's1',
      query: 'mera balance kitne hai'
    })).json();
    assert.equal(hinglish.data.lang, 'hi-latn');
    assert.equal(hinglish.data.responseLang, 'en');
    assert.match(hinglish.data.response, /balance/i);

    const english = await (await post('/ivr/conversation-i18n', {
      sessionId: 's1',
      query: 'what is my balance'
    })).json();
    assert.equal(english.data.lang, 'en');
  });

  // Devanagari was detected but then passed through a placeholder
  // translation, so every Hindi query reached the UNKNOWN fallback.
  test('answers Devanagari Hindi queries', async () => {
    const cases = [
      ['मेरा बैलेंस क्या है', /balance/i],
      ['मेरा कार्ड खो गया', /blocked immediately/i],
      ['मेरे लोन की जानकारी दें', /loan|EMI/i],
      ['मुझे एजेंट से बात करनी है', /connected to a customer service agent/i]
    ];
    for (const [query, expected] of cases) {
      const body = await (await post('/ivr/conversation-i18n', { sessionId: 's1', query })).json();
      assert.equal(body.data.lang, 'hi', `wrong language for: ${query}`);
      assert.match(body.data.response, expected, `failed for: ${query}`);
    }
  });

  // This endpoint now serves every query from the UI, so English has to keep
  // working through it, not just non-English input.
  test('English passes through unchanged', async () => {
    const body = await (await post('/ivr/conversation-i18n', {
      sessionId: 's1',
      query: 'connect me to an agent'
    })).json();
    assert.equal(body.data.lang, 'en');
    assert.match(body.data.response, /connected to a customer service agent/i);
  });

  test('missing fields return 400', async () => {
    assert.equal((await post('/ivr/conversation-i18n', {})).status, 400);
    assert.equal((await post('/ivr/conversation-i18n', undefined)).status, 400);
  });
});

describe('POST /ivr/input', () => {
  test('accepts the handled DTMF digits', async () => {
    for (const digit of ['1', '2']) {
      const res = await post('/ivr/input', { sessionId: 's1', inputType: 'DTMF', inputValue: digit });
      assert.equal(res.status, 200);
      assert.ok((await res.json()).data.responseText);
    }
  });

  test('rejects an unhandled digit with 400', async () => {
    const res = await post('/ivr/input', { sessionId: 's1', inputType: 'DTMF', inputValue: '9' });
    assert.equal(res.status, 400);
  });

  test('reports missing fields via the Joi middleware', async () => {
    const res = await post('/ivr/input', {});
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error, 'missing_fields');
    assert.deepEqual(json.missing.sort(), ['inputType', 'inputValue', 'sessionId']);
  });
});

describe('ACS and BAP routes', () => {
  test('ACS call controls respond', async () => {
    assert.equal((await post('/acs/start', { sessionId: 's1' })).status, 200);
    assert.equal((await post('/acs/sendDTMF', { sessionId: 's1', digit: '1' })).status, 200);
    assert.equal((await post('/acs/stop', { sessionId: 's1' })).status, 200);
  });

  test('ACS validates required fields', async () => {
    assert.equal((await post('/acs/start', {})).status, 400);
    assert.equal((await post('/acs/sendDTMF', { sessionId: 's1' })).status, 400);
  });

  test('BAP process responds and validates', async () => {
    const ok = await post('/bap/process', { sessionId: 's1', action: 'GetBalance' });
    assert.equal(ok.status, 200);
    assert.equal((await post('/bap/process', { sessionId: 's1' })).status, 400);
  });
});

describe('CORS', () => {
  const acao = async (origin) => {
    const res = await fetch(`${BASE}/test`, { headers: { Origin: origin } });
    return res.headers.get('access-control-allow-origin');
  };

  // Regression: app.use(cors()) reflected any origin.
  test('blocks an origin that is not allowlisted', async () => {
    assert.equal(await acao('https://evil.example.com'), null);
  });

  test('allows localhost origins in development', async () => {
    assert.equal(await acao('http://localhost:5173'), 'http://localhost:5173');
  });

  test('requests without an Origin header are unaffected', async () => {
    assert.equal((await fetch(`${BASE}/test`)).status, 200);
  });
});
