import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin.js';

let ipCounter = 1;

export const testOrigin = 'http://localhost:5173';
export const freshIp = () => `198.51.100.${ipCounter++}`;

export async function createAdmin(email = 'owner@example.test', password = 'StrongTestPassword!1') {
  return Admin.create({
    email,
    passwordHash: await bcrypt.hash(password, 4),
    failedAttempts: 0,
    tokenVersion: 0,
  });
}

export function addClientHeaders(request, ip = freshIp()) {
  return request.set('Origin', testOrigin).set('X-Forwarded-For', ip);
}

export async function loginAdmin(app, email = 'owner@example.test', password = 'StrongTestPassword!1') {
  const { default: request } = await import('supertest');
  const response = await addClientHeaders(request(app).post('/api/auth/login')).send({ email, password });
  return { response, cookie: response.headers['set-cookie']?.[0]?.split(';')[0] };
}