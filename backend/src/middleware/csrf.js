import { env } from '../config/env.js';

const isAllowedOrigin = (value) => {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.origin === env.CLIENT_URL.replace(/\/$/, '');
  } catch (error) {
    return false;
  }
};

export const originCheck = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const originHeader = req.get('Origin');
  const refererHeader = req.get('Referer');
  const allowedOrigin = originHeader || refererHeader;

  if (!allowedOrigin || !isAllowedOrigin(allowedOrigin)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return next();
};
