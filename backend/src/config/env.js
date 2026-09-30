import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvKeys = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL'];
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

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_PATH: process.env.ADMIN_PATH || '/yakshit-portfolio_5518',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM: process.env.RESEND_FROM || '',
  INQUIRY_TO_EMAIL: process.env.INQUIRY_TO_EMAIL || process.env.ADMIN_EMAIL,
  AUTO_REPLY_ENABLED: process.env.AUTO_REPLY_ENABLED || 'false',
};

export default env;
