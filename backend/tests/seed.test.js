import { describe, expect, it } from 'vitest';
import { seedDatabase } from '../src/seed.js';
import Education from '../src/models/Education.js';
import Profile from '../src/models/Profile.js';
import SectionSetting from '../src/models/SectionSetting.js';
import Skill from '../src/models/Skill.js';

describe('seed data safety', () => {
  it('skips without deleting data when a profile already exists', async () => {
    await Profile.create({ fullName: 'Owner edited profile' });
    await Skill.create({ name: 'Owner skill', category: 'Frontend' });
    await Education.create({ institution: 'Owner school' });
    await SectionSetting.create({ key: 'about', title: 'Owner section' });

    await seedDatabase();

    expect((await Profile.findOne()).fullName).toBe('Owner edited profile');
    expect(await Skill.countDocuments({ name: 'Owner skill' })).toBe(1);
    expect(await Education.countDocuments({ institution: 'Owner school' })).toBe(1);
    expect((await SectionSetting.findOne({ key: 'about' })).title).toBe('Owner section');
  });

  it('only replaces existing seed collections when force is explicit', async () => {
    await Profile.create({ fullName: 'Owner edited profile' });
    await seedDatabase({ force: true });

    expect((await Profile.findOne()).fullName).toBe('Yakshit Koshiya');
    expect(await Skill.countDocuments()).toBeGreaterThan(0);
    expect(await Education.countDocuments()).toBeGreaterThan(0);
  });
});