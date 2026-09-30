import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from '../src/config/env.js';
import Project from '../src/models/Project.js';

export const initialProjects = [
  {
    title: 'Aaditya Builders - Real Estate Business Platform',
    slug: 'aaditya-builders',
    shortDescription: 'Real estate platform for project discovery, lead capture, appointment booking, and customer communication.',
    description: 'Developed a full-stack real estate platform with dynamic project listings, an EMI calculator, lead capture, appointment booking, and photo attachments. Built a JWT-secured admin CRM with REST APIs and MongoDB/Mongoose for managing projects, leads, testimonials, and galleries.',
    role: 'Full-Stack Developer',
    duration: 'May 2026',
    status: 'completed',
    problem: 'The real estate business needed one platform to showcase properties and manage prospective buyers, enquiries, and appointments.',
    solution: 'Built a public real estate experience backed by a protected CRM, with automated communication and real-time chat integrated into the lead workflow.',
    features: [
      'Dynamic property projects and photo galleries',
      'EMI calculator and appointment booking',
      'Lead capture with photo attachments',
      'JWT-secured CRM for leads, testimonials, and projects',
      'Automated email, WhatsApp, and real-time chat',
    ],
    challenges: 'Integrated Meta WhatsApp Cloud API, Socket.IO, Cloudinary, and Resend for messaging, real-time chat, media uploads, and email notifications.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Tailwind CSS', 'JWT', 'Cloudinary', 'Resend', 'Socket.IO', 'Meta WhatsApp Cloud API', 'Vercel', 'Render'],
    liveUrl: 'https://www.aadityareality.in/',
    featured: false,
    visible: true,
  },
  {
    title: 'Campus Connect - Internship & Placement Platform',
    slug: 'campus-connect',
    shortDescription: 'Role-based internship and placement platform connecting students, mentors, companies, and placement coordinators.',
    description: 'Developed a role-based platform connecting Students, Mentors, Companies, and Placement Cell coordinators. Implemented candidate screening, mentor approvals, application tracking, job recommendations, and placement analytics.',
    role: 'Full-Stack Developer',
    duration: 'Jan 2026',
    status: 'completed',
    problem: 'Internship and placement workflows needed a shared system for candidate discovery, screening, mentoring, and application tracking.',
    solution: 'Built a multi-role platform with secure authentication, candidate tools, approval workflows, and dashboards for placement activity.',
    features: [
      'Role-based access for students, mentors, companies, and placement coordinators',
      'JWT authentication and Cloudinary resume uploads',
      'Skill and CGPA-based candidate filtering',
      'Domain-specific quizzes and mentor approval workflows',
      'Application tracking, job recommendations, and analytics',
    ],
    challenges: 'Connected distinct user roles and approval stages into a consistent screening workflow, including resume uploads and status updates.',
    techStack: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'JWT', 'Cloudinary', 'Vercel'],
    liveUrl: 'https://campus-connect-ten-blond.vercel.app/',
    featured: false,
    visible: true,
  },
  {
    title: 'Momai Gems - Jewellery Website',
    slug: 'momai-gems',
    shortDescription: 'Responsive jewellery storefront with an admin panel for product, category, and image management.',
    description: 'Developed a responsive jewellery website with a dedicated admin panel. Implemented product and category CRUD, REST APIs, MongoDB integration, protected admin routes, image management, and responsive product listing and detail pages.',
    role: 'Full-Stack MERN Developer',
    duration: 'June 2026',
    status: 'completed',
    problem: 'The jewellery business needed a responsive catalog and a straightforward way to manage products, categories, and product photography.',
    solution: 'Built a customer-facing product browsing experience and a protected admin panel backed by REST APIs and MongoDB.',
    features: [
      'Responsive jewellery product listings and detail pages',
      'Admin CRUD for products and categories',
      'Protected routes and admin authentication',
      'Product image management',
    ],
    challenges: 'Kept product and category management simple for administrators while making product browsing usable across screen sizes.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST API'],
    liveUrl: 'https://www.momaigems.com/',
    featured: false,
    visible: true,
  },
  {
    title: 'Kolmeks - Manufacturing Website & Enterprise ERP Platform',
    slug: 'kolmeks',
    shortDescription: 'Manufacturing website and enterprise ERP platform with more than 40 modules across core business operations.',
    description: 'Architected a manufacturing ERP and public website with 40+ modules across Sales, Procurement, Production, Inventory, Quality, HR, and Finance. Implemented Supabase Auth, RBAC, and RLS for protected role-based access.',
    role: 'ERP Platform Architect',
    duration: 'Sep 2026',
    status: 'completed',
    problem: 'Manufacturing operations needed a unified website and ERP covering multiple departments with secure, role-specific access.',
    solution: 'Designed a modular ERP with shared workflow, document, and notification capabilities, using Supabase authentication and database security controls.',
    features: [
      '40+ modules across Sales, Procurement, Production, Inventory, Quality, HR, and Finance',
      'Supabase Auth with role-based access control',
      'Row Level Security across ERP modules',
      'Workflow and approval engine',
      'Document management and notification center',
      'Transactions, audit trails, security hardening, and testing',
    ],
    challenges: 'Maintained secure, reliable workflows across a broad ERP surface using transactions, audit trails, RBAC, and Row Level Security.',
    techStack: ['React.js', 'Node.js', 'Express.js', 'Supabase PostgreSQL', 'Supabase Auth'],
    liveUrl: 'https://kolmeks-manufacturing-erp.vercel.app/',
    featured: false,
    visible: true,
  },
];

export async function importInitialProjects() {
  let nextOrder = (await Project.findOne().sort({ order: -1 }).select('order').lean())?.order ?? -1;
  const results = { created: [], skipped: [] };

  for (const projectData of initialProjects) {
    const existing = await Project.findOne({
      $or: [{ slug: projectData.slug }, { title: projectData.title }],
    }).select('_id title slug').lean();

    if (existing) {
      results.skipped.push(existing.title);
      continue;
    }

    nextOrder += 1;
    await Project.create({ ...projectData, order: nextOrder, images: [] });
    results.created.push(projectData.title);
  }

  return results;
}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (currentFile === invokedFile) {
  try {
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const results = await importInitialProjects();
    console.log(`Project import complete. Added ${results.created.length}; skipped ${results.skipped.length} existing.`);
    results.created.forEach((title) => console.log(`Added: ${title}`));
    results.skipped.forEach((title) => console.log(`Skipped existing: ${title}`));
  } catch (error) {
    console.error('Project import failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}
