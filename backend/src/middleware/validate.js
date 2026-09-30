import { validationResult } from 'express-validator';

export const rejectUnknownFields = (allowedFields) => (req, res, next) => {
  const allowed = new Set(allowedFields);
  const entries = Array.isArray(req.body) ? req.body : [req.body];
  const unknownFields = entries.flatMap((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    return Object.keys(entry)
      .filter((field) => !allowed.has(field))
      .map((field) => (Array.isArray(req.body) ? `[${index}].${field}` : field));
  });
  if (unknownFields.length === 0) return next();

  return res.status(400).json({
    message: 'Validation failed',
    errors: Object.fromEntries(unknownFields.map((field) => [field, 'Unexpected field.'])),
  });
};

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  return next();
};
