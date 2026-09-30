import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Inquiry from '../src/models/Inquiry.js';
import { mocks } from './setup.js';
import { freshIp, testOrigin } from './helpers.js';

const inquiryPayload = (overrides = {}) => ({
  name: 'Visitor Example',
  email: 'visitor@example.test',
  subject: 'Portfolio inquiry',
  message: 'I would like to discuss a project opportunity.',
  website: '',
  startedAt: Date.now() - 5000,
  ...overrides,
});

const submit = (payload, ip = freshIp()) => request(app).post('/api/public/contact')
  .set('Origin', testOrigin)
  .set('X-Forwarded-For', ip)
  .send(payload);

describe('public contact API', () => {
  it('stores a valid inquiry and returns 201', async () => {
    const response = await submit(inquiryPayload());
    expect(response.status).toBe(201);
    expect(await Inquiry.countDocuments()).toBe(1);
  });

  it('returns per-field validation errors', async () => {
    const response = await submit(inquiryPayload({ name: 'x', email: 'bad', message: '' }));
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveProperty('name');
    expect(response.body.errors).toHaveProperty('email');
    expect(response.body.errors).toHaveProperty('message');
  });

  it('returns normal success for honeypot and too-fast submissions without saving', async () => {
    const honeypot = await submit(inquiryPayload({ website: 'https://bot.example' }));
    const tooFast = await submit(inquiryPayload({ startedAt: Date.now() - 100 }));
    expect(honeypot.status).toBe(201);
    expect(tooFast.status).toBe(201);
    expect(await Inquiry.countDocuments()).toBe(0);
  });

  it('deduplicates identical inquiries submitted within ten minutes', async () => {
    await submit(inquiryPayload());
    const duplicate = await submit(inquiryPayload());
    expect(duplicate.status).toBe(201);
    expect(await Inquiry.countDocuments()).toBe(1);
  });

  it('records mail delivery failure but still returns success', async () => {
    mocks.resendSend.mockResolvedValueOnce({ error: { message: 'Provider unavailable' } });
    const response = await submit(inquiryPayload());
    const saved = await Inquiry.findOne();
    expect(response.status).toBe(201);
    expect(saved.emailSent).toBe(false);
    expect(saved.emailError).toBe('Provider unavailable');
  });

  it('neutralizes CR/LF in the submitted subject before composing email content', async () => {
    await submit(inquiryPayload({ subject: 'Hello\r\nBcc: attacker@example.test' }));
    const mail = mocks.resendSend.mock.calls[0][0];
    expect(mail.text).toContain('Subject: HelloBcc: attacker@example.test');
    expect(mail.text).not.toContain('\r');
    expect(mail.subject).not.toMatch(/[\r\n]/);
  });

  it('limits the sixth inquiry from one visitor within the hour', async () => {
    const ip = freshIp();
    for (let count = 0; count < 5; count += 1) {
      expect((await submit(inquiryPayload({ email: `visitor${count}@example.test` }), ip)).status).toBe(201);
    }
    const sixth = await submit(inquiryPayload({ email: 'visitor6@example.test' }), ip);
    expect(sixth.status).toBe(429);
  });
});