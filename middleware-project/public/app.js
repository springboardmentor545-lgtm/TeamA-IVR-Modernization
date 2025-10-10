 const delay = ms => new Promise(res => setTimeout(res, ms));

async function getBalance(sessionId) {
      await delay(50);
      return {
        success: true,
        sessionId,
        message: `Your account balance is $1,234.56. (Mock Data)`
      };
    }

    async function recharge(sessionId, amount = 100) {
      await delay(50);
      return {
        success: true,
        sessionId,
        message: `Recharge successful for ₹${amount}.`
      };
    }

    async function reportLostCard(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: `Thank you. Your card has been blocked immediately. A customer service agent will call you shortly to confirm.`
      };



    }

    async function activateNewCard(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: `To activate your new card, please enter the 16-digit card number followed by the hash key.`
      };
    }

    async function updateContactDetails(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: `A secure link to update your contact details has been sent to your registered mobile number.`
      };
    }

    async function reportSuspiciousTransaction(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: `Thank you for reporting this. A temporary hold has been placed on your account. Our fraud protection team will contact you within the next hour.`
      };
    }

    async function getMiniStatement(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: "Your last five transactions are: a debit of $50, a credit of $200, a debit of $25, a debit of $10, and a credit of $500.",
      };
    }

    async function payUtilityBill(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: "Please say or enter your 10-digit customer ID for your utility provider.",
      };
    }

    async function getLoanDetails(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: "For your personal loan, your next EMI of $350 is due on the 15th of this month. Your outstanding balance is $8,500.",
      };
    }

    async function requestEStatement(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: "Your e-statement for the last 3 months has been sent to your registered email address. Please check your inbox.",
      };
    }

async function agentConnect(sessionId) {
      await delay(70);
      return {
        success: true,
        sessionId,
        message: "You are now connected to a customer service agent.",
      };
    }

    async function handleQuery(sessionId, queryOrIntent) {
      if (!queryOrIntent) {
        return {
          success: false,
          sessionId,
          error: {
            message: "Query or intent is required."
          }
        };
      }

      const q = queryOrIntent.toString().toLowerCase();

      // First: check if it's an explicit intent string
      switch (queryOrIntent) {
        case "ACS_BALANCE":
          {
            const r = await getBalance(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_RECHARGE":
          {
            const r = await recharge(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_REPORT_LOST_CARD":
          {
            const r = await reportLostCard(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_ACTIVATE_CARD":
          {
            const r = await activateNewCard(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_UPDATE_CONTACT":
          {
            const r = await updateContactDetails(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_REPORT_SUSPICIOUS":
          {
            const r = await reportSuspiciousTransaction(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_MINI_STATEMENT":
          {
            const r = await getMiniStatement(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_PAY_BILL":
          {
            const r = await payUtilityBill(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_LOAN_DETAILS":
          {
            const r = await getLoanDetails(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }
        case "ACS_ESTATEMENT":
          {
            const r = await requestEStatement(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          }

        case "AGENT_CONNECT":
          {
            const r = await agentConnect(sessionId);
            return {
              success: true,
              sessionId,
              data: {
                message: r.message
              }
            };
          } 
      }

      // Fallback: free-text matching (for robustness)
      if (q.includes("balance")) {
        const r = await getBalance(sessionId);
        return {
          success: r.success,
          sessionId,
          data: {
            message: r.message
          }
        };
      }

      if (q.includes("recharge")) {
        const amountMatch = q.match(/(\d+)/);
        const amount = amountMatch ? Number(amountMatch[1]) : 100;
        const r = await recharge(sessionId, amount);
        return {
          success: r.success,
          sessionId,
          data: {
            message: r.message
          }
        };
      }

      if (q.includes("lost card") || q.includes("report lost") || q.includes("block card")) {
        const r = await reportLostCard(sessionId);
        return {
          success: r.success,
          sessionId,
          data: {
            message: r.message
          }
        };
      }

      if (q.includes("activate") && q.includes("card")) {
        const r = await activateNewCard(sessionId);
        return {
          success: r.success,
          sessionId,
          data: {
            message: r.message
          }
        };
      }

      if (q.includes("update contact") || q.includes("contact") ||q.includes("update") || q.includes("change contact") || q.includes("update mobile")) {
        const r = await updateContactDetails(sessionId);
        return {
          success: r.success,
          sessionId,
          data: {
            message: r.message
          }
        };
      }

      if (q.includes("suspicious") || q.includes("fraud") || q.includes("transaction")) {
        const r = await reportSuspiciousTransaction(sessionId);
        return {
          success: r.success,
          sessionId,
          data: {
            message: r.message
          }
        };
      }
      
      if (q.includes("mini statement") || q.includes("last transaction")) {
        const r = await getMiniStatement(sessionId);
        return { success: r.success, sessionId, data: { message: r.message } };
      }
      
      if (q.includes("pay bill") || q.includes("utility")) {
        const r = await payUtilityBill(sessionId);
        return { success: r.success, sessionId, data: { message: r.message } };
      }
      
      if (q.includes("loan")) {
        const r = await getLoanDetails(sessionId);
        return { success: r.success, sessionId, data: { message: r.message } };
      }
      
      if (q.includes("statement") && (q.includes("email") || q.includes("e-statement"))) {
        const r = await requestEStatement(sessionId);
        return { success: r.success, sessionId, data: { message: r.message } };
      }
      if ( q.includes("call") || q.includes("connect") || q.includes("support") || q.includes("representative") || q.includes("agent")) {
        const r = await agentConnect(sessionId);
        return { success: r.success, sessionId, data: { message: r.message } };
      }

      return {
        success: false,
        sessionId,
        error: {
          message: "Unable to map query to an action."
        }
      };
    }

    // --- Frontend Logic ---
    document.addEventListener('DOMContentLoaded', () => {
      // --- Element Selectors ---
      const nlpSessionInput = document.getElementById('nlp-session');
      const nlpQueryInput = document.getElementById('nlp-query');
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
      document.getElementById('btn-stt').addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert('Speech recognition is not supported in this browser. Please use Chrome or Edge on a desktop.');
          return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
            nlpQueryInput.placeholder = "Listening...";
        };
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          nlpQueryInput.value = transcript;
          // Automatically send the query after successful speech recognition
          processQuery(transcript);
        };
        recognition.onerror = (event) => {
          alert('STT error: ' + event.error);
        };
         recognition.onend = () => {
            nlpQueryInput.placeholder = "e.g., What's my balance?";
        };
        recognition.start();
      });

      // Helper function for text-to-speech
const speakText = (text) => {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
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