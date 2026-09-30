import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resendSend: vi.fn(),
  uploadBuffer: vi.fn(),
  deleteAsset: vi.fn(),
}));

globalThis.__portfolioTestMocks = mocks;

vi.mock('resend', () => ({
  Resend: class ResendMock {
    constructor() {
      this.emails = { send: mocks.resendSend };
    }
  },
}));

vi.mock('../src/utils/cloudinaryUpload.js', () => ({
  uploadBuffer: mocks.uploadBuffer,
  deleteAsset: mocks.deleteAsset,
  extractPublicIdFromUrl: vi.fn(() => null),
}));