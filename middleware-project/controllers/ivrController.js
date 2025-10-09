const bapService = require("../services/bapService");
const acsService = require("../services/acsService");
const { handleIntent } = require("../handlers/intentHandler");
const { detectLanguage, translate } = require("../services/i18nService");

module.exports = {
  /**
   * Handle DTMF inputs (1 or 2) - Updated for validation middleware
   */
  async handleInput(req, res, next) {
    const { log } = req;
    try {
      const { sessionId, inputType, inputValue } = req.validated;
      
      log.info({ 
        message: 'ivr_input_received', 
        sessionId, 
        inputType, 
        inputValue 
      });

      // Create a new variable instead of reassigning const
      const stringInputValue = String(inputValue);

      if (stringInputValue === "1") {
        // Directly get balance from BAP service
        const result = await bapService.getBalance(sessionId);
        return res.json({
          success: true,
          data: {
            sessionId,
            responseText: result.responseText || "Your balance is not available right now.",
          },
          requestId: req.requestId
        });
      }

      if (stringInputValue === "2") {
        // Start ACS call
        const result = await acsService.startCall(sessionId);
        return res.json({
          success: true,
          data: {
            sessionId,
            responseText: result.message || "Call started.",
          },
          requestId: req.requestId
        });
      }

      // Invalid input
      const err = new Error("Invalid input. Please try again.");
      err.type = 'validation_error';
      err.status = 400;
      throw err;

    } catch (err) {
      log.error({ 
        message: 'ivr_input_error', 
        error: err.message,
        sessionId: req.validated?.sessionId 
      });
      
      err.type = err.type || 'ivr_error';
      err.status = err.status || 500;
      next(err);
    }
  },

  /**
   * Handle free-text conversation queries - Updated for validation middleware
   */
  async conversation(req, res, next) {
    const { log } = req;
    try {
      const { sessionId, query } = req.body;

      // Manual validation for now (can be moved to Joi schema later)
      if (!sessionId || !query) {
        const err = new Error("sessionId and query are required");
        err.type = 'validation_error';
        err.status = 400;
        throw err;
      }

      log.info({ 
        message: 'conversation_request', 
        sessionId, 
        query 
      });

      const result = await handleIntent(sessionId, query);

      if (!result || result.success === false) {
        return res.json({
          success: true,
          data: {
            sessionId,
            response: result?.response || result?.error || "Sorry, an error occurred while processing your request.",
          },
          requestId: req.requestId
        });
      }

      return res.json({
        success: true,
        data: {
          sessionId,
          response: result.response,
        },
        requestId: req.requestId
      });

    } catch (err) {
      log.error({ 
        message: 'conversation_error', 
        error: err.message,
        sessionId: req.body?.sessionId 
      });
      
      err.type = err.type || 'conversation_error';
      err.status = err.status || 500;
      next(err);
    }
  },

  /**
   * Multilingual pipeline - Updated for validation middleware
   */
  async conversationI18n(req, res, next) {
    const { log } = req;
    try {
      const { sessionId, query } = req.body;

      // Manual validation for now (can be moved to Joi schema later)
      if (!sessionId || !query) {
        const err = new Error("sessionId and query are required");
        err.type = 'validation_error';
        err.status = 400;
        throw err;
      }

      log.info({ 
        message: 'conversation_i18n_request', 
        sessionId, 
        query 
      });

      const srcLang = detectLanguage(query);
      const queryEn = translate(query, srcLang, "en");
      const result = await handleIntent(sessionId, queryEn);
      const responseEn = result?.response || result?.error || "Sorry, I didn't understand that.";
      
      return res.json({ 
        success: true,
        data: { 
          sessionId, 
          lang: "en", 
          response: responseEn 
        },
        requestId: req.requestId
      });

    } catch (err) {
      log.error({ 
        message: 'conversation_i18n_error', 
        error: err.message,
        sessionId: req.body?.sessionId 
      });
      
      err.type = err.type || 'conversation_i18n_error';
      err.status = err.status || 500;
      next(err);
    }
  },
};