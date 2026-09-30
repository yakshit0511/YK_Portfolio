import mongoose from 'mongoose';

import { env } from '../src/config/env.js';
import Project from '../src/models/Project.js';
import SectionSetting from '../src/models/SectionSetting.js';

const requiredSections = [
  { key: 'certificates', title: 'Certificates', visible: true, order: 6 },
  { key: 'github', title: 'GitHub', visible: true, order: 7 },
];

const createIndexes = async () => {
  const sectionSettings = mongoose.connection.collection('sectionsettings');
  const certificates = mongoose.connection.collection('certificates');
  const events = mongoose.connection.collection('events');

  await sectionSettings.createIndex({ key: 1 }, { unique: true }).catch(() => undefined);
  await certificates.createIndex({ visible: 1, order: 1, createdAt: -1 }).catch(() => undefined);
  await events.createIndex({ type: 1, day: 1 }).catch(() => undefined);
  await events.createIndex({ day: 1 }).catch(() => undefined);
  await events.createIndex({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 }).catch(() => undefined);
};

const backfillMissingProjectSlugs = async () => {
  const projects = await Project.find({ slug: { $in: [null, ''] } }).sort({ _id: 1 });
  let updated = 0;

  for (const project of projects) {
    const base = String(project.title || 'project')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'project';
    let slug = base;
    let suffix = 1;

    while (await Project.exists({ slug })) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    project.slug = slug;
    await project.save();
    updated += 1;
  }

  return updated;
};

const runMigration = async () => {
  const ownsConnection = mongoose.connection.readyState === 0;

  try {
    if (ownsConnection) {
      await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
    }

    let inserted = 0;
    for (const item of requiredSections) {
      const existing = await SectionSetting.findOne({ key: item.key }).lean();
      if (!existing) {
        await SectionSetting.create({ ...item, title: item.title || item.key });
        inserted += 1;
        console.log(`Inserted section setting: ${item.key}`);
      } else {
        console.log(`Section setting already exists: ${item.key}`);
      }
    }

    const slugCount = await backfillMissingProjectSlugs();
    await createIndexes();
    console.log(`Migration complete. Added ${inserted} section setting(s) and ${slugCount} missing project slug(s).`);
  } catch (error) {
    console.error('Bonus migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (ownsConnection) await mongoose.disconnect();
  }
};

await runMigration();
