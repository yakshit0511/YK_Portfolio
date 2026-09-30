import { env } from '../config/env.js';

const getOrigin = (value) => {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

export const originCheck = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const originHeader = req.get('Origin');
  const refererHeader = req.get('Referer');
  const requestOrigin = originHeader ? getOrigin(originHeader) : getOrigin(refererHeader);

  if (!requestOrigin || !env.CLIENT_URLS.includes(requestOrigin)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return next();
};
