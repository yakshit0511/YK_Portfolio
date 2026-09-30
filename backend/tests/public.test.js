import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Education from '../src/models/Education.js';
import Experience from '../src/models/Experience.js';
import Profile from '../src/models/Profile.js';
import Project from '../src/models/Project.js';
import SectionSetting from '../src/models/SectionSetting.js';
import Skill from '../src/models/Skill.js';

describe('public portfolio API', () => {
  it('omits hidden data and internal fields, orders sections, and honors phone visibility', async () => {
    await Profile.create({
      fullName: 'Public Owner', email: 'owner@example.test', phone: '+15551234567',
      showPhone: false, socials: { github: 'https://github.com/example' },
    });
    await SectionSetting.insertMany([
      { key: 'projects', title: 'Projects', visible: true, order: 2 },
      { key: 'about', title: 'About', visible: true, order: 0 },
      { key: 'skills', title: 'Hidden skills', visible: false, order: 1 },
    ]);
    await Skill.create({ name: 'Visible skill', category: 'Frontend', visible: true, order: 0 });
    await Skill.create({ name: 'Hidden skill', category: 'Frontend', visible: false, order: 1 });
    await Project.create({ title: 'Visible project', visible: true });
    await Project.create({ title: 'Hidden project', visible: false });
    await Education.create({ institution: 'Visible school', visible: true, order: 1 });
    await Education.create({ institution: 'Hidden school', visible: false });
    await Experience.create({ role: 'Visible role', visible: true });
    await Experience.create({ role: 'Hidden role', visible: false });

    const response = await request(app).get('/api/public/portfolio');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('public, max-age=60');
    expect(response.body.profile).not.toHaveProperty('phone');
    expect(response.body.profile).not.toHaveProperty('_id');
    expect(response.body.profile).not.toHaveProperty('__v');
    expect(response.body).not.toHaveProperty('admin');
    expect(response.body.sections.map((section) => section.key)).toEqual(['about', 'projects']);
    expect(response.body.skills.flatMap((group) => group.items).map((skill) => skill.name)).toEqual(['Visible skill']);
    expect(response.body.projects.map((project) => project.title)).toEqual(['Visible project']);
    expect(response.body.education.map((item) => item.institution)).toEqual(['Visible school']);
    expect(response.body.experience.map((item) => item.role)).toEqual(['Visible role']);
    expect(response.body.skills[0].items[0]).not.toHaveProperty('_id');

    await Profile.updateOne({}, { $set: { showPhone: true } });
    const withPhone = await request(app).get('/api/public/portfolio');
    expect(withPhone.body.profile.phone).toBe('+15551234567');
  });
});