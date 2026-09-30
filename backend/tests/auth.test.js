import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Admin from '../src/models/Admin.js';
import { addClientHeaders, createAdmin, freshIp, testOrigin } from './helpers.js';

describe('authentication', () => {
  const password = 'StrongTestPassword!1';

  beforeEach(async () => {
    await createAdmin('owner@example.test', password);
  });

  it('sets an httpOnly cookie and never returns the JWT in the response body', async () => {
    const response = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password });

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
    expect(response.body).not.toHaveProperty('token');
    expect(response.body.admin.email).toBe('owner@example.test');
  });

  it('uses the same status and generic message for unknown email and wrong password', async () => {
    const wrongPassword = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password: 'wrong' });
    const unknownEmail = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'nobody@example.test', password: 'wrong' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it('locks the account after five failed password attempts', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await addClientHeaders(request(app).post('/api/auth/login'), freshIp())
        .send({ email: 'owner@example.test', password: 'wrong' });
      expect(response.status).toBe(401);
    }

    const admin = await Admin.findOne({ email: 'owner@example.test' });
    expect(admin.failedAttempts).toBe(5);
    expect(admin.lockUntil.getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects /me without the admin cookie', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('invalidates the old cookie when the password changes', async () => {
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password });
    const oldCookie = login.headers['set-cookie'][0].split(';')[0];

    const changed = await addClientHeaders(request(app).put('/api/auth/change-password'))
      .set('Cookie', oldCookie)
      .send({ currentPassword: password, newPassword: 'AnotherStrongPassword!2' });

    expect(changed.status).toBe(200);
    const oldSession = await request(app).get('/api/auth/me').set('Cookie', oldCookie);
    expect(oldSession.status).toBe(401);
  });

  it('clears the session cookie on logout', async () => {
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const logout = await request(app).post('/api/auth/logout')
      .set('Origin', testOrigin)
      .set('X-Forwarded-For', freshIp())
      .set('Cookie', cookie);

    expect(logout.status).toBe(200);
    expect(logout.headers['set-cookie'][0]).toMatch(/admin_token=;/);
  });
});