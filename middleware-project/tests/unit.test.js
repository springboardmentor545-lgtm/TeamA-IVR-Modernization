// Unit tests for the pure routing/detection logic. No server required.
const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { detectIntent } = require('../handlers/intentHandler');
const { detectLanguage, translate } = require('../services/i18nService');

describe('detectIntent', () => {
  test('maps core ACS queries', async () => {
    assert.equal(await detectIntent('what is my balance'), 'ACS_BALANCE');
    assert.equal(await detectIntent('I want to recharge'), 'ACS_RECHARGE');
    assert.equal(await detectIntent('activate my new card'), 'ACS_ACTIVATE_CARD');
    assert.equal(await detectIntent('update contact details'), 'ACS_UPDATE_CONTACT');
    assert.equal(await detectIntent('report a suspicious transaction'), 'ACS_REPORT_SUSPICIOUS');
  });

  test('maps core BAP queries', async () => {
    assert.equal(await detectIntent('show my mini statement'), 'BAP_GET_MINI_STATEMENT');
    assert.equal(await detectIntent('pay my utility bill'), 'BAP_PAY_UTILITY_BILL');
    assert.equal(await detectIntent('loan details'), 'BAP_GET_LOAN_DETAILS');
    assert.equal(await detectIntent('send my e-statement'), 'BAP_REQUEST_ESTATEMENT');
    assert.equal(await detectIntent('connect me to an agent'), 'BAP_AGENT');
  });

  // Regression: the lost-card regex allowed only one word between "lost" and
  // "card", so "lost my debit card" fell through to UNKNOWN.
  test('detects lost-card phrasings with longer card descriptions', async () => {
    for (const q of [
      'lost card',
      'I lost my card',
      'I lost my debit card',
      'I lost my credit card',
      'I lost my new credit card',
      'I want to report a lost card',
      'report lost card',
      'block card',
      'please block it'
    ]) {
      assert.equal(await detectIntent(q), 'ACS_REPORT_LOST_CARD', `expected lost-card intent for: ${q}`);
    }
  });

  // The widened regex must not start blocking cards for unrelated queries.
  test('does not over-match unrelated queries', async () => {
    for (const q of [
      'I lost the receipt for my card',
      'I lost my phone and need a new card someday',
      'I lost my wallet',
      'play music'
    ]) {
      assert.equal(await detectIntent(q), 'UNKNOWN', `expected UNKNOWN for: ${q}`);
    }
  });

  test('returns UNKNOWN for empty or non-string input', async () => {
    assert.equal(await detectIntent(''), 'UNKNOWN');
    assert.equal(await detectIntent(undefined), 'UNKNOWN');
    assert.equal(await detectIntent(42), 'UNKNOWN');
  });
});

describe('detectLanguage', () => {
  // Regression: the Hinglish hint list contained English words such as
  // "balance" and "loan", so plain English was classified as hi-latn and
  // pushed through the Hinglish translation mappings.
  test('classifies ordinary English as en', () => {
    for (const q of [
      'what is my balance',
      'tell me about my loan',
      'pay my utility bill',
      'send my e-statement',
      'connect me to an agent',
      'I want a mini statement'
    ]) {
      assert.equal(detectLanguage(q), 'en', `expected en for: ${q}`);
    }
  });

  test('classifies Hinglish as hi-latn', () => {
    for (const q of [
      'mera balance kitne hai',
      'paise kitne hai',
      'mujhe loan chahiye',
      'agent se baat karna hai'
    ]) {
      assert.equal(detectLanguage(q), 'hi-latn', `expected hi-latn for: ${q}`);
    }
  });

  test('word-boundary matching does not fire on substrings', () => {
    // "hai" must not match inside "hair" or "shanghai".
    assert.equal(detectLanguage('I lost my hair'), 'en');
    assert.equal(detectLanguage('flying to shanghai'), 'en');
  });

  test('detects non-Latin scripts', () => {
    assert.equal(detectLanguage('मेरा बैलेंस क्या है'), 'hi');
    assert.equal(detectLanguage('இந்த மின்'), 'ta');
    assert.equal(detectLanguage(''), 'en');
  });
});

describe('translate', () => {
  test('maps Hinglish to an English intent phrase', () => {
    assert.match(translate('mera balance kitne hai', 'hi-latn', 'en'), /balance/i);
    assert.match(translate('mujhe loan chahiye', 'hi-latn', 'en'), /loan/i);
  });

  test('passes text through when source and target match', () => {
    assert.equal(translate('what is my balance', 'en', 'en'), 'what is my balance');
  });

  // The pivot phrase has to be something detectIntent actually matches.
  // "Please block my card" and "update my contact information" did not, so
  // those two Hinglish phrasings reached the UNKNOWN fallback.
  test('pivot phrases round-trip through detectIntent', async () => {
    const cases = [
      ['mera card block karo', 'hi-latn', 'ACS_REPORT_LOST_CARD'],
      ['mera mobile number update karo', 'hi-latn', 'ACS_UPDATE_CONTACT']
    ];
    for (const [query, lang, want] of cases) {
      assert.equal(await detectIntent(translate(query, lang, 'en')), want, `failed for: ${query}`);
    }
  });
});

// Devanagari Hindi was detected correctly but then passed through a
// placeholder translation, so every Hindi query hit the UNKNOWN fallback.
describe('Devanagari Hindi end to end', () => {
  const cases = [
    ['मेरा बैलेंस क्या है', 'ACS_BALANCE'],
    ['मेरे खाते में कितने पैसे हैं', 'ACS_BALANCE'],
    ['मेरा कार्ड खो गया', 'ACS_REPORT_LOST_CARD'],
    ['मेरा कार्ड गुम हो गया है', 'ACS_REPORT_LOST_CARD'],
    ['कृपया मेरा कार्ड ब्लॉक करें', 'ACS_REPORT_LOST_CARD'],
    ['मेरा नया कार्ड एक्टिवेट करें', 'ACS_ACTIVATE_CARD'],
    ['मेरा अकाउंट रिचार्ज करें', 'ACS_RECHARGE'],
    ['मेरा मोबाइल नंबर अपडेट करें', 'ACS_UPDATE_CONTACT'],
    ['मेरा संपर्क विवरण बदलें', 'ACS_UPDATE_CONTACT'],
    ['मुझे मिनी स्टेटमेंट चाहिए', 'BAP_GET_MINI_STATEMENT'],
    ['मेरा बिजली बिल भुगतान करें', 'BAP_PAY_UTILITY_BILL'],
    ['मेरे लोन की जानकारी दें', 'BAP_GET_LOAN_DETAILS'],
    ['मुझे ई-स्टेटमेंट भेजें', 'BAP_REQUEST_ESTATEMENT'],
    ['मुझे एजेंट से बात करनी है', 'BAP_AGENT']
  ];

  test('detects Devanagari and routes each query to its intent', async () => {
    for (const [query, want] of cases) {
      assert.equal(detectLanguage(query), 'hi', `wrong language for: ${query}`);
      const intent = await detectIntent(translate(query, 'hi', 'en'));
      assert.equal(intent, want, `failed for: ${query}`);
    }
  });

  // Unrecognised Hindi must reach the polite fallback rather than be guessed
  // into an action the caller never asked for.
  test('unrecognised Hindi falls through to UNKNOWN', async () => {
    assert.equal(await detectIntent(translate('गाना बजाओ', 'hi', 'en')), 'UNKNOWN');
  });
});

describe('config', () => {
  const configPath = require.resolve('../config');

  // config reads process.env at require time, so each case needs a fresh load.
  const loadConfig = (env) => {
    const saved = {};
    for (const key of Object.keys(env)) {
      saved[key] = process.env[key];
      if (env[key] === undefined) delete process.env[key];
      else process.env[key] = env[key];
    }
    delete require.cache[configPath];
    try {
      return require('../config');
    } finally {
      for (const key of Object.keys(saved)) {
        if (saved[key] === undefined) delete process.env[key];
        else process.env[key] = saved[key];
      }
      delete require.cache[configPath];
    }
  };

  // Regression: `process.env.USE_BAP_MOCK || true` was always truthy, so the
  // flag could never be turned off.
  test('USE_BAP_MOCK is a real boolean that can be disabled', () => {
    assert.equal(loadConfig({ USE_BAP_MOCK: undefined }).USE_BAP_MOCK, false);
    assert.equal(loadConfig({ USE_BAP_MOCK: 'true' }).USE_BAP_MOCK, true);
    assert.equal(loadConfig({ USE_BAP_MOCK: 'false' }).USE_BAP_MOCK, false);
  });

  test('CORS_ORIGINS parses, trims and drops empties', () => {
    assert.deepEqual(loadConfig({ CORS_ORIGINS: undefined }).CORS_ORIGINS, []);
    assert.deepEqual(
      loadConfig({ CORS_ORIGINS: 'https://a.com, https://b.com ,' }).CORS_ORIGINS,
      ['https://a.com', 'https://b.com']
    );
  });

  test('PORT falls back to 3000', () => {
    assert.equal(loadConfig({ PORT: undefined }).PORT, 3000);
    assert.equal(loadConfig({ PORT: '8080' }).PORT, '8080');
  });
});
