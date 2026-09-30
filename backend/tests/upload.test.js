import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Profile from '../src/models/Profile.js';
import { addClientHeaders, createAdmin, freshIp } from './helpers.js';

describe('resume upload validation', () => {
  it('accepts a PDF resume and persists its Cloudinary reference', async () => {
    await createAdmin();
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password: 'StrongTestPassword!1' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const response = await request(app).post('/api/admin/profile/resume')
      .set('Origin', 'http://localhost:5173')
      .set('X-Forwarded-For', freshIp())
      .set('Cookie', cookie)
      .attach('resume', Buffer.from('%PDF-1.4 test'), { filename: 'resume.pdf', contentType: 'application/pdf' });

    expect(response.status).toBe(200);
    expect(response.body.url).toContain('res.cloudinary.com');
    expect((await Profile.findOne()).resume.url).toBe(response.body.url);
  });

  it('rejects a non-PDF renamed with a misleading image extension', async () => {
    await createAdmin();
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password: 'StrongTestPassword!1' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const response = await request(app).post('/api/admin/profile/resume')
      .set('Origin', 'http://localhost:5173').set('X-Forwarded-For', freshIp()).set('Cookie', cookie)
      .attach('resume', Buffer.from('not a pdf'), { filename: 'malware.png', contentType: 'image/png' });
    expect(response.status).toBe(400);
  });

  it('rejects an upload larger than five megabytes', async () => {
    await createAdmin();
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password: 'StrongTestPassword!1' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const response = await request(app).post('/api/admin/profile/resume')
      .set('Origin', 'http://localhost:5173').set('X-Forwarded-For', freshIp()).set('Cookie', cookie)
      .attach('resume', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'large.pdf', contentType: 'application/pdf' });
    expect(response.status).toBe(400);
  });
});