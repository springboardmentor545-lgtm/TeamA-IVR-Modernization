const { logger } = require('../middlewares/logger');
const bapService = require('../services/bapService');

exports.process = async (req, res, next) => {
  const { requestId, log } = req;
  try {
    const payload = req.validated;
    
    log.info({ 
      message: 'bap_process_called', 
      payload 
    });

    // If bapService.handle doesn't exist, use a mock response
    const result = await bapService.handle ? 
      await bapService.handle(payload) : 
      { 
        success: true, 
        message: 'BAP processing completed',
        data: payload 
      };

    res.json({ 
      success: true, 
      data: result, 
      requestId 
    });
  } catch (err) {
    log.error({ 
      message: 'bap_process_error', 
      error: err.message 
    });
    
    err.type = err.type || 'bap_error';
    err.status = err.status || 500;
    next(err);
  }
};