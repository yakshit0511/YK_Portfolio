import { afterAll, beforeAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import './mocks.js';

export const mocks = globalThis.__portfolioTestMocks;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'portfolio-test-secret-that-is-at-least-thirty-two-characters';
process.env.ADMIN_EMAIL = 'owner@example.test';
process.env.CLIENT_URL = 'http://localhost:5173,https://portfolio.example.test';
process.env.COOKIE_SAMESITE = 'lax';
process.env.RESEND_API_KEY = 're_test_placeholder_key';
process.env.RESEND_FROM = 'onboarding@resend.dev';
process.env.INQUIRY_TO_EMAIL = 'owner@example.test';
process.env.AUTO_REPLY_ENABLED = 'false';

const mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.24' } });
process.env.MONGO_URI = mongoServer.getUri('portfolio_test');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
  mocks.resendSend.mockReset().mockResolvedValue({ data: { id: 'test-email' } });
  mocks.uploadBuffer.mockReset().mockImplementation(async (_buffer, options = {}) => ({
    url: 'https://res.cloudinary.com/test/image/upload/v1/resume.pdf',
    publicId: options.publicId || 'test-resume',
  }));
  mocks.deleteAsset.mockReset().mockResolvedValue({ result: 'ok' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});