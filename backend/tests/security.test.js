import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';
import { addClientHeaders, createAdmin, freshIp, testOrigin } from './helpers.js';

describe('API security', () => {
  it('keeps shallow health checks database-free and answers deep checks with database status', async () => {
    const shallow = await request(app).get('/api/health');
    const deep = await request(app).get('/api/health?deep=1');

    expect(shallow.status).toBe(200);
    expect(shallow.body.status).toBe('ok');
    expect(shallow.body.uptime).toEqual(expect.any(Number));
    expect(shallow.body).not.toHaveProperty('db');
    expect(deep.status).toBe(200);
    expect(deep.body.db).toBe('up');
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('accepts each exact configured origin and reports the visitor IP behind two proxies', async () => {
    for (const origin of ['http://localhost:5173', 'https://portfolio.example.test']) {
      const response = await request(app).get('/api/health').set('Origin', origin);
      expect(response.headers['access-control-allow-origin']).toBe(origin);
    }

    await createAdmin();
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password: 'StrongTestPassword!1' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const originalTrustProxy = app.get('trust proxy');
    app.set('trust proxy', 2);
    try {
      const diagnostic = await request(app).get('/api/admin/debug/ip')
        .set('Origin', testOrigin)
        .set('X-Forwarded-For', '198.51.100.77, 10.0.0.2')
        .set('Cookie', cookie);
      expect(diagnostic.status).toBe(200);
      expect(diagnostic.body.ip).toBe('198.51.100.77');
      expect(diagnostic.body.forwardedFor).toBe('198.51.100.77, 10.0.0.2');
    } finally {
      app.set('trust proxy', originalTrustProxy);
    }
  });

  it('requires authentication across admin route groups', async () => {
    const routes = [
      ['get', '/api/admin/profile'], ['get', '/api/admin/dashboard'],
      ['get', '/api/admin/projects'], ['get', '/api/admin/skills'],
      ['get', '/api/admin/education'], ['get', '/api/admin/experience'],
      ['get', '/api/admin/sections'], ['get', '/api/admin/inquiries'],
      ['post', '/api/admin/profile/resume'], ['post', '/api/admin/projects'],
      ['put', '/api/admin/profile'], ['patch', '/api/admin/skills/reorder'],
      ['delete', '/api/admin/profile/resume'],
    ];

    for (const [method, path] of routes) {
      const response = await request(app)[method](path);
      expect(response.status, `${method.toUpperCase()} ${path}`).toBe(401);
    }
  });

  it('rejects a state-changing admin request from an unapproved origin', async () => {
    await createAdmin();
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password: 'StrongTestPassword!1' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const response = await request(app).put('/api/admin/profile')
      .set('Origin', 'https://attacker.example')
      .set('X-Forwarded-For', freshIp())
      .set('Cookie', cookie)
      .send({ fullName: 'Updated' });

    expect(response.status).toBe(403);
  });

  it('rejects NoSQL-shaped login fields and unknown admin create/update fields', async () => {
    const injection = await request(app).post('/api/auth/login')
      .set('Origin', testOrigin)
      .set('X-Forwarded-For', freshIp())
      .send({ email: { $gt: '' }, password: 'x' });
    expect(injection.status).toBe(400);

    await createAdmin();
    const login = await addClientHeaders(request(app).post('/api/auth/login'))
      .send({ email: 'owner@example.test', password: 'StrongTestPassword!1' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const create = await request(app).post('/api/admin/projects')
      .set('Origin', testOrigin).set('X-Forwarded-For', freshIp()).set('Cookie', cookie)
      .send({ title: 'Test project', unexpected: true });
    const update = await request(app).put('/api/admin/profile')
      .set('Origin', testOrigin).set('X-Forwarded-For', freshIp()).set('Cookie', cookie)
      .send({ fullName: 'Yakshit', unexpected: true });

    expect(create.status).toBe(400);
    expect(update.status).toBe(400);
  });
});