// middlewares/validateFields.js
const Joi = require('joi');

// Define validation schemas for each route
const schemas = {
  ivrInput: Joi.object({
    sessionId: Joi.string().required(),
    inputType: Joi.string().valid('DTMF', 'SPEECH').required(),
    inputValue: Joi.string().required()
  }),
  acsProcess: Joi.object({
    sessionId: Joi.string().required(),
    digits: Joi.string().required()
  }),
  bapProcess: Joi.object({
    sessionId: Joi.string().required(),
    action: Joi.string().required(),
    params: Joi.object().optional()
  }),
  acsStart: Joi.object({
    sessionId: Joi.string().required()
  }),
  acsStop: Joi.object({
    sessionId: Joi.string().required()
  }),
  acsSendDTMF: Joi.object({
    sessionId: Joi.string().required(),
    digit: Joi.string().required()
  })
};

// Generic middleware
exports.schemas = schemas;

exports.validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const missing = [...new Set(error.details.map(d => d.context && d.context.key).filter(Boolean))];
    return res.status(400).json({ error: 'missing_fields', missing });
  }
  req.validated = value;
  next();
};

// Export all schemas for use in routes
exports.schemas = schemas;
