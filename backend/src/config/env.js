import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => value.trim().replace(/\/$/, ''))
  .filter(Boolean);

const requiredEnvKeys = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'CLIENT_URL'];
const missingEnvKeys = requiredEnvKeys.filter((key) => {
  const value = process.env[key];
  return !value || !String(value).trim();
});

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvKeys.join(', ')}. ` +
      'Please add them to your .env file before starting the server.'
  );
}

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET;
const cookieSameSite = String(process.env.COOKIE_SAMESITE || 'lax').toLowerCase();

if (!['lax', 'none', 'strict'].includes(cookieSameSite)) {
  throw new Error('COOKIE_SAMESITE must be lax, none, or strict.');
}

if (nodeEnv === 'production' && (jwtSecret.length < 32 || /change.?me|example|placeholder/i.test(jwtSecret))) {
  throw new Error('Production JWT_SECRET must be at least 32 characters and not a placeholder.');
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: nodeEnv,
  CLIENT_URL: clientUrls[0],
  CLIENT_URLS: clientUrls,
  MONGO_URI: process.env.MONGO_URI,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SAMESITE: cookieSameSite,
  TRUST_PROXY_HOPS: Number(process.env.TRUST_PROXY_HOPS) || 1,
  ADMIN_PATH: process.env.ADMIN_PATH || '/yakshit-portfolio_5518',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  RESEND_FROM: process.env.RESEND_FROM || '',
  INQUIRY_TO_EMAIL: process.env.INQUIRY_TO_EMAIL || process.env.ADMIN_EMAIL,
  AUTO_REPLY_ENABLED: process.env.AUTO_REPLY_ENABLED || 'false',
};

export default env;
