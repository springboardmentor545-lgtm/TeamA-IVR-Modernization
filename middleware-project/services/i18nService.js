// Lightweight i18n utilities (mock) to avoid external dependencies.
// Provides naive language detection and placeholder translation.

function detectLanguage(text = "") {
  if (!text) return "en";
  // Very naive script-based detection
  // Devanagari (Hindi/Marathi)
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  // Hinglish (Hindi in Latin script) heuristic: common Hindi words in Latin.
  // Only Hindi-specific markers belong here. English words like "balance",
  // "account" or "loan" would classify ordinary English queries as Hinglish
  // and send them through the Hinglish translation mappings. Matched on word
  // boundaries so "hai" does not match inside "hair" or "shanghai".
  const t = String(text).toLowerCase();
  const hinglishHints = ["paise", "kitne", "kitna", "mera", "mere", "meri", "mujhe", "chahiye", "bhugtan", "baat", "karna", "karo", "kya", "hai"];
  const hinglishPattern = new RegExp(`\\b(${hinglishHints.join("|")})\\b`);
  if (hinglishPattern.test(t)) return "hi-latn";
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  // Gurmukhi (Punjabi)
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa";
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  // Basic Latin -> assume English
  return "en";
}

function translate(text = "", from = "en", to = "en") {
  if (!text || from === to) return text;
  const src = String(from).toLowerCase();
  const dst = String(to).toLowerCase();

  // Heuristic mapping from Hinglish (hi-latn) to English intents
  if (src === "hi-latn" && dst === "en") {
    const q = String(text).toLowerCase();
    if (q.includes("paise") || q.includes("balance") || (q.includes("kitne") && q.includes("account"))) {
      return "Please check my balance";
    }
    if (q.includes("statement")) {
      return "Give me a mini statement";
    }
    if (q.includes("bill") || q.includes("bhugtan")) {
      return "Pay my electricity bill";
    }
    if (q.includes("loan")) {
      return "Tell me about my loan";
    }
    if (q.includes("e") && q.includes("statement")) {
      return "Send me my e-statement";
    }
    if (q.includes("agent") || q.includes("baat")) {
      return "I want to talk to an agent";
    }
    if (q.includes("agent") ) {
      return "I want to talk to an agent";
    }
    if (q.includes("lost") && q.includes("card")) {
      return "I lost my card";
    }
    if (q.includes("update") && q.includes("contact")) {
      return "I want to update contact details";
    }
    if (q.includes("block") && q.includes("card")) {
      return "Please report lost card";
    }
    if (q.includes("mobile") && (q.includes("number") || q.includes("no"))) {
      return "I want to update contact details";
    }
    if (q.includes("recharge") || (q.includes("add") && q.includes("money"))) {
      return "Recharge my account with 100 rupees";
    }
    if (q.includes("activate") && q.includes("card")) {
      return "Activate my card";
    }
    // Fallback
    return "I want to talk to an agent";
  }

  // Heuristic mapping from Devanagari Hindi to English intents. Same keyword
  // approach as the Hinglish branch above: the detected script tells us the
  // language, and these map the words that actually carry the intent onto the
  // English phrases detectIntent matches.
  //
  // Ordered most specific first — "कार्ड" appears in both the lost-card and
  // activate-card phrasings, so those are tested before anything broader.
  if (src === "hi" && dst === "en") {
    const q = String(text);
    const has = (...words) => words.some((w) => q.includes(w));

    // खो/गुम = lost, ब्लॉक/बंद = block
    if (has("खो", "गुम") && has("कार्ड")) return "I lost my card";
    if (has("ब्लॉक") && has("कार्ड")) return "Please report lost card";

    // एक्टिवेट/सक्रिय/चालू = activate
    if (has("एक्टिवेट", "सक्रिय", "चालू") && has("कार्ड")) return "Activate my card";

    if (has("रिचार्ज")) return "Recharge my account with 100 rupees";

    // संपर्क = contact, मोबाइल/नंबर = mobile/number, अपडेट/बदल = update/change
    if (has("संपर्क", "मोबाइल", "नंबर") && has("अपडेट", "बदल")) {
      return "I want to update contact details";
    }

    // Checked before the mini statement rule, which would otherwise swallow it.
    if (has("ई-स्टेटमेंट", "ईस्टेटमेंट", "ईमेल")) return "Send me my e-statement";

    // स्टेटमेंट/विवरण = statement, लेनदेन = transaction
    if (has("स्टेटमेंट", "विवरण", "लेनदेन")) return "Give me a mini statement";

    // बिल = bill, भुगतान = payment, बिजली = electricity
    if (has("बिल", "भुगतान", "बिजली")) return "Pay my electricity bill";

    // लोन/ऋण/कर्ज = loan
    if (has("लोन", "ऋण", "कर्ज")) return "Tell me about my loan";

    // एजेंट/प्रतिनिधि = agent/representative, बात = talk
    if (has("एजेंट", "प्रतिनिधि", "बात")) return "I want to talk to an agent";

    // बैलेंस/शेष/बकाया = balance, पैसे/राशि = money/amount, खाता = account
    if (has("बैलेंस", "शेष", "बकाया", "पैसे", "राशि", "खाता")) {
      return "Please check my balance";
    }

    // Deliberately returns the text unchanged rather than guessing. It then
    // reaches the polite fallback, which is safer than routing an
    // unrecognised banking request to an action the user did not ask for.
    return text;
  }

  // Placeholder translation: annotate for non-EN to non-EN for demo
  return `[${to}] ${text}`;
}

module.exports = { detectLanguage, translate };


