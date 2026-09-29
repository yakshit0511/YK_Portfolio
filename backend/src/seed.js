import mongoose from 'mongoose';

import { env } from './config/env.js';
import Education from './models/Education.js';
import Profile from './models/Profile.js';
import SectionSetting from './models/SectionSetting.js';
import Skill from './models/Skill.js';

const profileData = {
  fullName: 'Yakshit Koshiya',
  siteName: 'Yakshit Portfolio',
  typingTitles: [
    'Full Stack MERN Developer',
    'React Developer',
    'Problem Solver',
  ],
  email: env.ADMIN_EMAIL,
  phone: '8780150610',
  showPhone: false,
  location: '',
  socials: {
    github: 'https://github.com/yakshit0511',
    linkedin: 'https://www.linkedin.com/in/yakshit-koshiya-b49a11296/',
    instagram: 'https://www.instagram.com/yakshit_0511',
  },
  seo: {
    title: 'Yakshit Portfolio | Full Stack MERN Developer',
    description: '',
  },
  about:
    "I'm Yakshit Koshiya, a B.Tech Information Technology student and Full Stack MERN Developer. I enjoy building modern, responsive, and user-friendly web applications using technologies like React, Node.js, Express.js, and MongoDB.\n\nI have hands-on experience developing real-world projects, including business websites, ERP systems, admin panels, REST APIs, and WhatsApp API integrations. I'm passionate about learning new technologies, solving problems, and turning ideas into practical digital solutions.\n\nCurrently, I'm looking for opportunities where I can apply my skills, gain industry experience, and grow as a professional software developer.",
  accentColor: '#2f7bff',
};

const skillData = [
  { name: 'HTML5', category: 'Frontend', level: 90, visible: true, order: 0 },
  { name: 'CSS3', category: 'Frontend', level: 88, visible: true, order: 1 },
  { name: 'JavaScript', category: 'Frontend', level: 90, visible: true, order: 2 },
  { name: 'React.js', category: 'Frontend', level: 91, visible: true, order: 3 },
  { name: 'TypeScript', category: 'Frontend', level: 82, visible: true, order: 4 },
  { name: 'Tailwind CSS', category: 'Frontend', level: 84, visible: true, order: 5 },
  { name: 'Bootstrap', category: 'Frontend', level: 86, visible: true, order: 6 },
  { name: 'Node.js', category: 'Backend', level: 88, visible: true, order: 0 },
  { name: 'Express.js', category: 'Backend', level: 88, visible: true, order: 1 },
  { name: 'REST APIs', category: 'Backend', level: 88, visible: true, order: 2 },
  { name: 'MongoDB', category: 'Database', level: 85, visible: true, order: 0 },
  { name: 'MongoDB Atlas', category: 'Database', level: 82, visible: true, order: 1 },
  { name: 'Supabase', category: 'Database', level: 74, visible: true, order: 2 },
  { name: 'Git & GitHub', category: 'Tools & Deployment', level: 90, visible: true, order: 0 },
  { name: 'Vercel', category: 'Tools & Deployment', level: 82, visible: true, order: 1 },
  { name: 'Render', category: 'Tools & Deployment', level: 80, visible: true, order: 2 },
  { name: 'Postman', category: 'Tools & Deployment', level: 84, visible: true, order: 3 },
  { name: 'MERN Stack Development', category: 'Other', level: 92, visible: true, order: 0 },
  { name: 'WhatsApp Cloud API', category: 'Other', level: 80, visible: true, order: 1 },
  { name: 'Cloudinary', category: 'Other', level: 80, visible: true, order: 2 },
  { name: 'Responsive Web Design', category: 'Other', level: 90, visible: true, order: 3 },
  { name: 'Admin Panel Development', category: 'Other', level: 88, visible: true, order: 4 },
  { name: 'API Integration', category: 'Other', level: 87, visible: true, order: 5 },
];

const educationData = [
  {
    institution: 'CHARUSAT University',
    degree: 'B.Tech',
    field: 'Information Technology',
    startYear: 2023,
    endYear: 2027,
    currentSemester: '7th Semester',
    grade: '9.25 CGPA',
    gradeNote: 'Up to 6th semester',
    description: '',
    visible: true,
    order: 0,
  },
  {
    institution: 'Ashadeep Science Bhavan, Surat',
    degree: '12th (Higher Secondary, Science)',
    field: '',
    startYear: 2021,
    endYear: 2023,
    currentSemester: '',
    grade: '79.23%',
    gradeNote: '',
    description: '',
    visible: true,
    order: 1,
  },
];

const sectionSettingData = [
  { key: 'about', title: 'About', visible: true, order: 0 },
  { key: 'skills', title: 'Skills', visible: true, order: 1 },
  { key: 'projects', title: 'Projects', visible: true, order: 2 },
  { key: 'education', title: 'Education', visible: true, order: 3 },
  { key: 'experience', title: 'Experience', visible: true, order: 4 },
  { key: 'contact', title: 'Contact', visible: true, order: 5 },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    await Profile.deleteMany({});
    await Skill.deleteMany({});
    await Education.deleteMany({});
    await SectionSetting.deleteMany({});

    await Profile.create(profileData);
    await Skill.insertMany(skillData);
    await Education.insertMany(educationData);
    await SectionSetting.insertMany(sectionSettingData);

    console.log('Seed completed successfully: profile, skills, education, and section settings were recreated.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
