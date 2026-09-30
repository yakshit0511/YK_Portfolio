import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from '../src/config/env.js';
import Certificate from '../src/models/Certificate.js';

export const initialCertificates = [
  {
    title: 'Full Stack Development Internship',
    issuer: 'TechnoHacks EduTech',
    type: 'certificate',
    issueDate: 'Jun 2025',
    credentialId: 'TH09595',
    description: 'Completed a full stack development internship from May 8 to June 7, 2025.',
    visible: true,
  },
  {
    title: 'Design and Analysis of Algorithms',
    issuer: 'NPTEL - IIT Madras',
    type: 'certificate',
    issueDate: 'Jan-Mar 2025',
    credentialId: 'NPTEL25CS23S434600237',
    description: 'Elite certificate with a 75% consolidated score; ranked in the top 5%.',
    visible: true,
  },
  {
    title: 'Data Structures and Algorithms using Java',
    issuer: 'NPTEL - IIT Kharagpur',
    type: 'certificate',
    issueDate: 'Jul-Oct 2024',
    credentialId: 'NPTEL24CS96S452700364',
    description: 'Elite certificate with Silver distinction and a 76% consolidated score.',
    visible: true,
  },
  {
    title: 'Full Stack Development Internship',
    issuer: 'DZ Infotech',
    type: 'certificate',
    issueDate: 'Jul 2026',
    credentialId: 'DZ-INT-2026-19',
    description: 'Completed the internship from May 28 to July 10, 2026; performance rated Excellent.',
    visible: true,
  },
];

export async function importInitialCertificates() {
  let nextOrder = (await Certificate.findOne().sort({ order: -1 }).select('order').lean())?.order ?? -1;
  const results = { created: [], skipped: [] };

  for (const certificateData of initialCertificates) {
    const existing = await Certificate.findOne({
      $or: [
        { credentialId: certificateData.credentialId },
        { title: certificateData.title, issuer: certificateData.issuer },
      ],
    }).select('_id title issuer credentialId').lean();

    if (existing) {
      results.skipped.push(existing.title);
      continue;
    }

    nextOrder += 1;
    await Certificate.create({ ...certificateData, order: nextOrder });
    results.created.push(certificateData.title);
  }

  return results;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (currentFile === invokedFile) {
  try {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const results = await importInitialCertificates();
    console.log(`Certificate import complete. Added ${results.created.length}; skipped ${results.skipped.length} existing.`);
    results.created.forEach((title) => console.log(`Added: ${title}`));
    results.skipped.forEach((title) => console.log(`Skipped existing: ${title}`));
  } catch (error) {
    console.error('Certificate import failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}
