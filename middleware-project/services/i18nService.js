// Lightweight i18n utilities (mock) to avoid external dependencies.
// Provides naive language detection and placeholder translation.

function detectLanguage(text = "") {
  if (!text) return "en";
  // Very naive script-based detection
  // Devanagari (Hindi/Marathi)
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  // Hinglish (Hindi in Latin script) heuristic: common Hindi words in Latin
  const t = String(text).toLowerCase();
  const hinglishHints = ["paise", "kitne", "hai", "mera", "account", "balance", "statement", "bill", "loan", "estatement", "bhugtan", "mobile", "number", "lost card", "block", "agent", "baat"]; 
  if (hinglishHints.some(w => t.includes(w))) return "hi-latn";
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
      return "I want to update my contact information";
    }
    if (q.includes("block") && q.includes("card")) {
      return "Please block my card";
    }
    if (q.includes("mobile") && (q.includes("number") || q.includes("no"))) {
      return "I want to update my mobile number";
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

  // Placeholder translation: annotate for non-EN to non-EN for demo
  return `[${to}] ${text}`;
}

module.exports = { detectLanguage, translate };


