import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from '../src/config/env.js';
import cloudinary from '../src/config/cloudinary.js';
import Project from '../src/models/Project.js';
import { uploadBuffer } from '../src/utils/cloudinaryUpload.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendImages = path.resolve(scriptDir, '../../frontend/public/images/projects');
const cloudinaryFolder = 'yakshit-portfolio/projects';
const covers = [
  { slug: 'aaditya-builders', fileName: 'aaditya-builders.png' },
  { slug: 'campus-connect', fileName: 'campus-connect.png' },
  { slug: 'momai-gems', fileName: 'momai-gems.png' },
  { slug: 'kolmeks', fileName: 'kolmeks.png' },
];

const getOrUploadCover = async ({ slug, fileName }) => {
  const publicId = `${cloudinaryFolder}/${slug}-cover`;
  try {
    const existing = await cloudinary.api.resource(publicId, { resource_type: 'image' });
    return { url: existing.secure_url, publicId: existing.public_id };
  } catch (error) {
    if ((error.http_code ?? error.error?.http_code) !== 404) throw error;
  }

  const source = await readFile(path.join(frontendImages, fileName));

  return uploadBuffer(source, {
    folder: cloudinaryFolder,
    publicId: `${slug}-cover`,
    format: 'webp',
  });
};

export async function attachProjectCovers() {
  const results = { attached: [], skipped: [] };

  for (const cover of covers) {
    const project = await Project.findOne({ slug: cover.slug });
    if (!project) {
      throw new Error(`Project not found for cover: ${cover.slug}`);
    }

    const marker = `${cloudinaryFolder}/${cover.slug}-cover`;
    const projectImages = project.images ?? [];
    if (projectImages.some((image) => image.publicId === marker)) {
      results.skipped.push(project.title);
      continue;
    }

    const image = await getOrUploadCover(cover);
    project.images = [
      { url: image.url, publicId: image.publicId },
      ...projectImages.filter((existing) => existing.publicId !== image.publicId),
    ];
    await project.save();
    results.attached.push(project.title);
  }

  return results;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (currentFile === invokedFile) {
  try {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const results = await attachProjectCovers();
    console.log(`Project covers complete. Attached ${results.attached.length}; skipped ${results.skipped.length}.`);
    results.attached.forEach((title) => console.log(`Attached cover: ${title}`));
    results.skipped.forEach((title) => console.log(`Skipped existing cover: ${title}`));
  } catch (error) {
    console.error('Project cover attachment failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}
