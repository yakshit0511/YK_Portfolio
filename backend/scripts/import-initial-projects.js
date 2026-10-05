import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from '../src/config/env.js';
import Project from '../src/models/Project.js';

export const initialProjects = [
  {
    title: 'Employee Promotion Prediction System',
    slug: 'employee-promotion-prediction-system',
    shortDescription: 'End-to-end ML web app predicting employee promotion eligibility from 54,808 HR records with 96.5% accuracy.',
    description: 'Built an end-to-end ML web app to predict employee promotion eligibility from 54,808 HR records with 96.5% accuracy. Trained XGBoost classifier with SMOTE oversampling to handle class imbalance, achieving 94% recall and 99% precision. Developed a Flask REST API and deployed on Render with Gunicorn; created a responsive UI with real-time prediction results. Performed exploratory data analysis (EDA) to identify key promotion drivers: training score, KPIs met, and performance rating.',
    role: 'Machine Learning & Full-Stack Developer',
    duration: 'May 2026',
    status: 'completed',
    problem: 'Organizations evaluate large volumes of employee records during appraisal cycles, where human bias, inconsistent evaluation metrics, and heavy class imbalance in promotion datasets make fair and timely promotion decisions challenging.',
    solution: 'Engineered a complete machine learning pipeline leveraging XGBoost and SMOTE oversampling to accurately predict promotion candidates from 54,808 HR records, exposed via a production Flask REST API with a responsive web interface.',
    features: [
      'Predicts employee promotion eligibility across 54,808 HR records with 96.5% accuracy.',
      'Trained XGBoost classifier with SMOTE oversampling, achieving 94% recall and 99% precision.',
      'Production Flask REST API deployed on Render with Gunicorn WSGI server.',
      'Responsive frontend UI delivering instant, real-time prediction results.',
      'Exploratory data analysis (EDA) identifying key drivers: training score, KPIs met >80%, and rating.',
    ],
    challenges: 'Overcame extreme class imbalance in HR promotion data using SMOTE techniques to achieve high recall (94%) and precision (99%) without overfitting.',
    techStack: ['Python', 'Flask', 'XGBoost', 'SMOTE', 'Scikit-learn', 'HTML/CSS/JS', 'Render'],
    liveUrl: 'https://employee-promotion-system.onrender.com/',
    images: [{ url: '/images/projects/employee-promotion-prediction.png' }],
    featured: true,
    visible: true,
  },
  {
    title: 'Thakkar Traders',
    slug: 'thakkar-traders',
    shortDescription: 'Full-stack MERN platform for a premium interior and building materials business, with customer showcase and admin CRM.',
    description: 'Developed a full-stack MERN platform for Thakkar Traders, a premium interior and building materials business. The project includes a modern customer-facing website for products, brands, projects, gallery, inspiration and services, along with a secure admin dashboard for managing business content and customer inquiries.',
    role: 'Full-Stack MERN Developer',
    duration: 'May 2026',
    status: 'completed',
    problem: 'Thakkar Traders needed a modern digital platform to showcase their premium interior and building materials catalog and a centralized CRM to track customer inquiries and lead pipelines efficiently.',
    solution: 'Engineered a full-stack MERN web application featuring a customer-facing showcase and an authenticated admin dashboard equipped with a Kanban/calendar CRM follow-up system and automated notifications.',
    features: [
      'Premium responsive business website with Products, Brands, Projects, Gallery, Inspiration, Services and Contact sections.',
      'Admin dashboard for managing products, projects, gallery items and customer inquiries.',
      'CRM Follow-Up system with List, Calendar and Kanban views, status/priority filters, overdue tracking, client/project information and pipeline value.',
      'Secure authentication and backend APIs with MongoDB Atlas, JWT, Cloudinary media management and Resend email notifications.',
      'Environment-based configuration using .env variables for database, authentication, email, Cloudinary and frontend/backend configuration.',
      'Deployed production website on Vercel.',
    ],
    challenges: 'Designed an interactive multi-view CRM (List, Calendar, Kanban) with overdue tracking and pipeline value metrics while orchestrating Cloudinary media workflows and Resend email notifications.',
    techStack: [
      'MongoDB Atlas',
      'Express.js',
      'React.js',
      'Node.js',
      'JWT',
      'Cloudinary',
      'Resend',
      'REST API',
      'Vercel',
    ],
    liveUrl: 'https://thakkar-traders-dz-infotech.vercel.app/',
    featured: true,
    visible: true,
  },
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
