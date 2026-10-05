import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Certificate from '../src/models/Certificate.js';
import Event from '../src/models/Event.js';
import Profile from '../src/models/Profile.js';
import Project from '../src/models/Project.js';
import { addClientHeaders, createAdmin, freshIp, loginAdmin, testOrigin } from './helpers.js';
import { importInitialCertificates } from '../scripts/import-initial-certificates.js';
import { importInitialProjects } from '../scripts/import-initial-projects.js';

describe('bonus portfolio APIs', () => {
  it('imports the four supplied certificates once without overwriting existing details', async () => {
    await Certificate.create({
      title: 'Full Stack Development Internship',
      issuer: 'TechnoHacks EduTech',
      credentialId: 'TH09595',
      description: 'Admin-edited certificate description',
      order: 0,
    });

    const firstImport = await importInitialCertificates();
    const secondImport = await importInitialCertificates();

    expect(firstImport.created).toHaveLength(3);
    expect(firstImport.skipped).toEqual(['Full Stack Development Internship']);
    expect(secondImport.created).toHaveLength(0);
    expect(secondImport.skipped).toHaveLength(4);
    expect(await Certificate.countDocuments()).toBe(4);
    expect((await Certificate.findOne({ credentialId: 'TH09595' })).description).toBe('Admin-edited certificate description');
    expect((await Certificate.findOne({ credentialId: 'NPTEL25CS23S434600237' })).description).toContain('top 5%');
  });

  it('imports the four starter projects once without overwriting existing project content', async () => {
    await Project.create({
      title: 'Aaditya Builders - Real Estate Business Platform',
      slug: 'aaditya-builders',
      description: 'Admin-edited description',
      order: 2,
    });

    const firstImport = await importInitialProjects();
    const secondImport = await importInitialProjects();

    expect(firstImport.created).toHaveLength(5);
    expect(firstImport.skipped).toEqual(['Aaditya Builders - Real Estate Business Platform']);
    expect(secondImport.created).toHaveLength(0);
    expect(secondImport.skipped).toHaveLength(6);
    expect(await Project.countDocuments()).toBe(6);
    expect((await Project.findOne({ slug: 'aaditya-builders' })).description).toBe('Admin-edited description');
    expect((await Project.findOne({ slug: 'campus-connect' })).liveUrl).toBe('https://campus-connect-ten-blond.vercel.app/');
  });

  it('returns visible credentials and omits hidden credentials from the public portfolio', async () => {
    await Certificate.create([
      { title: 'Public award', visible: true, credentialId: 'public-id' },
      { title: 'Private award', visible: false },
    ]);

    const response = await request(app).get('/api/public/portfolio');
    expect(response.status).toBe(200);
    expect(response.body.certificates.map((item) => item.title)).toEqual(['Public award']);
    expect(response.body.certificates[0]).not.toHaveProperty('_id');
  });

  it('normalizes a username-only GitHub profile into a usable public URL', async () => {
    await Profile.create({ fullName: 'Owner', socials: { github: 'yakshit0511' } });
    const response = await request(app).get('/api/public/portfolio');
    expect(response.body.profile.socials.github).toBe('https://github.com/yakshit0511');
  });

  it('serves case studies only for visible projects', async () => {
    await Project.create([
      { title: 'Public case', slug: 'public-case', visible: true, problem: 'A real problem', features: ['Fast search'] },
      { title: 'Private case', slug: 'private-case', visible: false },
    ]);

    const visible = await request(app).get('/api/public/projects/public-case');
    const hidden = await request(app).get('/api/public/projects/private-case');
    expect(visible.status).toBe(200);
    expect(visible.body.problem).toBe('A real problem');
    expect(visible.body).not.toHaveProperty('_id');
    expect(hidden.status).toBe(404);
  });

  it('stores only allowlisted, pseudonymized analytics and honors DNT', async () => {
    const denied = await request(app).post('/api/public/track')
      .set('User-Agent', 'Mozilla/5.0')
      .set('DNT', '1')
      .send({ type: 'pageview', device: 'desktop' });
    expect(denied.status).toBe(204);
    expect(await Event.countDocuments()).toBe(0);

    const recorded = await request(app).post('/api/public/track')
      .set('User-Agent', 'Mozilla/5.0')
      .set('X-Forwarded-For', '198.51.100.81')
      .set('Referer', 'https://source.example/path?secret=value')
      .send({ type: 'pageview', device: 'desktop', referrer: 'https://source.example/path?secret=value' });
    const event = await Event.findOne().lean();
    expect(recorded.status).toBe(204);
    expect(event.type).toBe('pageview');
    expect(event.visitorHash).not.toContain('198.51.100.81');
    expect(event.referrerHost).toBe('source.example');
    expect(event).not.toHaveProperty('referrer');
  });

  it('accepts new profile and project fields in the protected admin API', async () => {
    await createAdmin();
    const { cookie } = await loginAdmin(app);
    const headers = { Origin: testOrigin, Cookie: cookie, 'X-Forwarded-For': freshIp() };

    const profile = await addClientHeaders(request(app).put('/api/admin/profile'))
      .set('Cookie', cookie)
      .send({ availability: { status: 'limited', message: 'Available in summer' }, currentlyLearning: ['Rust'] });
    expect(profile.status).toBe(200);
    expect(profile.body.availability.status).toBe('limited');

    const project = await request(app).post('/api/admin/projects')
      .set(headers)
      .send({ title: 'Case study project', problem: 'Slow workflow', solution: 'Automated flow', features: ['Search'], status: 'completed' });
    expect(project.status).toBe(201);
    expect(project.body.problem).toBe('Slow workflow');
    expect(project.body.slug).toBe('case-study-project');
  });

  it('requires HTTPS for certificate credential URLs', async () => {
    await createAdmin();
    const { cookie } = await loginAdmin(app);
    const create = () => request(app).post('/api/admin/certificates')
      .set('Origin', testOrigin)
      .set('X-Forwarded-For', freshIp())
      .set('Cookie', cookie);

    const rejected = await create().send({ title: 'HTTP credential', credentialUrl: 'http://issuer.example.test/verify' });
    const accepted = await create().send({ title: 'HTTPS credential', credentialUrl: 'https://issuer.example.test/verify' });

    expect(rejected.status).toBe(400);
    expect(accepted.status).toBe(201);
    expect(await Certificate.countDocuments()).toBe(1);
  });
});