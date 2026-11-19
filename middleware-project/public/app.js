// --- Backend API layer ---
// All IVR logic lives in the middleware. The UI only transports the query
// and renders the response. Served same-origin, so a relative URL is correct.
// The i18n endpoint runs language detection and translation ahead of intent
// routing. English passes through it unchanged, so it is the right default for
// every query rather than a special case for non-English input.
const CONVERSATION_ENDPOINT = '/ivr/conversation-i18n';

// Language of the most recent reply, used to pick the speech-synthesis voice.
// The middleware answers in English today and reports that as responseLang.
let lastResponseLang = 'en';

// Quick-action buttons carry intent codes (data-intent). The middleware's
// intent detection works on natural language, so map each code to a phrase
// it recognises instead of sending the raw code.
const INTENT_QUERIES = {
  ACS_BALANCE: 'What is my balance?',
  ACS_RECHARGE: 'I want to recharge',
  ACS_REPORT_LOST_CARD: 'Report lost card',
  ACS_ACTIVATE_CARD: 'Activate my new card',
  ACS_UPDATE_CONTACT: 'Update contact details',
  ACS_REPORT_SUSPICIOUS: 'Report a suspicious transaction',
  ACS_MINI_STATEMENT: 'Show my mini statement',
  ACS_PAY_BILL: 'Pay my utility bill',
  ACS_LOAN_DETAILS: 'Loan details',
  ACS_ESTATEMENT: 'Send my e-statement',
  AGENT_CONNECT: 'Connect me to an agent'
};

/**
 * Sends a query to the middleware and normalises the reply into the shape the
 * UI renders: { success, sessionId, data: { message }, error: { message } }.
 */
async function handleQuery(sessionId, queryOrIntent) {
  if (!queryOrIntent) {
    return {
      success: false,
      sessionId,
      error: { message: 'Query or intent is required.' }
    };
  }

  // Resolve an intent code to its natural-language query; pass free text through.
  const query = INTENT_QUERIES[queryOrIntent] || queryOrIntent.toString();

  let res;
  let body;
  try {
    res = await fetch(CONVERSATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, query })
    });
    body = await res.json();
  } catch (err) {
    return {
      success: false,
      sessionId,
      error: { message: 'Could not reach the IVR service. Please try again.' }
    };
  }

  if (!res.ok) {
    return {
      success: false,
      sessionId,
      error: { message: body?.message || body?.error || 'The IVR service returned an error.' },
      requestId: body?.requestId
    };
  }

  // Remember what language the reply came back in so Read 🔊 uses a matching
  // voice. Falls back to English, which is what the service returns today.
  lastResponseLang = body?.data?.responseLang || 'en';

  return {
    success: body?.success !== false,
    sessionId: body?.data?.sessionId || sessionId,
    data: { message: body?.data?.response || 'No response from server.' },
    detectedLang: body?.data?.lang,
    responseLang: lastResponseLang,
    requestId: body?.requestId
  };
}

// Maps the service's language codes onto BCP-47 tags the speech APIs accept.
const SPEECH_LANG = { en: 'en-US', hi: 'hi-IN', 'hi-latn': 'hi-IN' };


    // --- Frontend Logic ---
    document.addEventListener('DOMContentLoaded', () => {
      // --- Element Selectors ---
      const nlpSessionInput = document.getElementById('nlp-session');
      const nlpQueryInput = document.getElementById('nlp-query');
      const nlpLangSelect = document.getElementById('nlp-lang');
      const nlpResultContainer = document.getElementById('nlp-result-container');
      const nlpResultEl = document.getElementById('nlp-result');

      // --- Helper Functions ---
      const displayResult = (element, data) => {
          const message = data?.data?.message || data?.error?.message || (typeof data.message === 'string' ? data.message : "I'm sorry, I encountered an issue. Please try again.");
          element.textContent = message;
          nlpResultContainer.classList.remove('hidden');
      };

      const getSessionId = () => {
          let id = nlpSessionInput.value.trim();
          if (!id) {
              id = `sess-${Math.floor(1000 + Math.random() * 9000)}`;
              nlpSessionInput.value = id;
          }
          return id;
      }
      
      const processQuery = async (queryOrIntent) => {
        const sessionId = getSessionId();
        if (!queryOrIntent) {
            displayResult(nlpResultEl, { error: { message: 'Query is required.' } });
            return;
        }
        nlpResultEl.textContent = 'Processing...';
        nlpResultContainer.classList.remove('hidden');
        const result = await handleQuery(sessionId, queryOrIntent);
        displayResult(nlpResultEl, result);
        
        // Add to chat history - only store user-friendly text, not intent codes
        let queryText;
        if (typeof queryOrIntent === 'string' && queryOrIntent.startsWith('ACS_')) {
          // If it's an intent code, get the button text instead
          const button = document.querySelector(`[data-intent="${queryOrIntent}"]`);
          queryText = button ? button.textContent.trim() : queryOrIntent;
        } else {
          // Use the actual query text
          queryText = queryOrIntent || nlpQueryInput.value.trim();
        }
        
        const responseText = result?.data?.message || result?.error?.message || 'No response';
        if (window.addToChatHistory) {
          window.addToChatHistory(queryText, responseText);
        }
      };

      // Make processQuery globally accessible
      window.processQuery = processQuery;

      // --- Event Listeners ---
      
      // NLP Controls
      document.getElementById('btn-nlp').addEventListener('click', () => {
        const query = nlpQueryInput.value.trim();
        processQuery(query);
      });
      
      nlpQueryInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = nlpQueryInput.value.trim();
            processQuery(query);
        }
      });
      
      document.querySelectorAll('.keypad-btn').forEach(button => {
        button.addEventListener('click', () => {
            const intent = button.dataset.intent;
            nlpQueryInput.value = button.textContent;
            processQuery(intent);
        });
      });

      // STT: Use Web Speech API
      //
      // The recogniser fires onresult repeatedly while it refines an utterance.
      // Submitting from inside onresult therefore sends one request per partial
      // transcript ("I", "I want", "I want to report", ...). Instead, collect
      // only final segments here and submit once from onend, so each press of
      // the button produces exactly one query.
      let recognition = null;
      let recognizing = false;
      let finalTranscript = '';

      document.getElementById('btn-stt').addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert('Speech recognition is not supported in this browser. Please use Chrome or Edge on a desktop.');
          return;
        }

        // A second press stops the current session rather than starting a
        // competing recogniser, which would double every event.
        if (recognizing) {
          recognition.stop();
          return;
        }

        if (!recognition) {
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            recognizing = true;
            finalTranscript = '';
            nlpQueryInput.placeholder = 'Listening...';
          };

          recognition.onresult = (event) => {
            // Start at resultIndex so already-seen segments are not re-appended.
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interim += transcript;
              }
            }
            // Show progress in the input, but do not send anything yet.
            nlpQueryInput.value = (finalTranscript + interim).trim();
          };

          recognition.onerror = (event) => {
            // "aborted" and "no-speech" are routine when the user stops early.
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
              alert('STT error: ' + event.error);
            }
          };

          recognition.onend = () => {
            recognizing = false;
            nlpQueryInput.placeholder = "e.g., What's my balance?";
            const query = finalTranscript.trim();
            finalTranscript = '';
            if (query) {
              nlpQueryInput.value = query;
              processQuery(query);
            }
          };
        }

        // Set on every start, not just at creation: the recogniser is reused
        // across presses, so a language change between them must take effect.
        recognition.lang = nlpLangSelect ? nlpLangSelect.value : 'en-US';
        recognition.start();
      });

      // Helper function for text-to-speech
const speakText = (text) => {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  // Match the voice to the language the reply actually came back in, rather
  // than assuming English.
  utterance.lang = SPEECH_LANG[lastResponseLang] || 'en-US';
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};


      // TTS: Read last conversation response
      document.getElementById('btn-tts').addEventListener('click', () => {
        const resultText = nlpResultEl.textContent.trim();
        if (!resultText || resultText === 'Processing...') {
          const fallback = nlpQueryInput.value || 'Please enter a query first, or ask a question.';
          speakText(fallback);
          return;
        }
        speakText(resultText);
      });

      // Initialize with a session ID
      getSessionId();
    });