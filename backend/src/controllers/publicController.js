import Education from '../models/Education.js';
import Experience from '../models/Experience.js';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import SectionSetting from '../models/SectionSetting.js';
import Skill from '../models/Skill.js';
import { env } from '../config/env.js';

const defaultSections = [
  { key: 'about', title: 'About', visible: true, order: 0 },
  { key: 'skills', title: 'Skills', visible: true, order: 1 },
  { key: 'projects', title: 'Projects', visible: true, order: 2 },
  { key: 'education', title: 'Education', visible: true, order: 3 },
  { key: 'experience', title: 'Experience', visible: true, order: 4 },
  { key: 'contact', title: 'Contact', visible: true, order: 5 },
];

const stripSensitiveFields = (item) => {
  if (!item) {
    return null;
  }

  const sanitized = { ...item };
  delete sanitized._id;
  delete sanitized.__v;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  return sanitized;
};

export const getPortfolio = async (req, res) => {
  try {
    const [profile, sections, skills, projects, education, experience] = await Promise.all([
      Profile.findOne().lean(),
      SectionSetting.find().sort({ order: 1, key: 1 }).lean(),
      Skill.find({ visible: true }).sort({ category: 1, order: 1, name: 1 }).lean(),
      Project.find({ visible: true }).sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
      Education.find({ visible: true }).sort({ order: 1, endYear: -1 }).lean(),
      Experience.find({ visible: true }).sort({ order: 1, startDate: -1 }).lean(),
    ]);

    const publicProfile = profile
      ? { ...profile, email: profile.email || env.INQUIRY_TO_EMAIL }
      : { email: env.INQUIRY_TO_EMAIL };

    if (publicProfile) {
      if (!publicProfile.showPhone) {
        delete publicProfile.phone;
      }

      delete publicProfile.showPhone;
      delete publicProfile._id;
      delete publicProfile.__v;
      delete publicProfile.createdAt;
      delete publicProfile.updatedAt;
    }

    const visibleSections = sections.length
      ? sections.filter((section) => section.visible)
      : defaultSections;
    const publicSections = visibleSections.map((section) => stripSensitiveFields(section));

    const groupedSkills = [];
    const skillMap = new Map();

    for (const skill of skills) {
      const item = stripSensitiveFields(skill);
      const category = item.category || 'Other';

      if (!skillMap.has(category)) {
        skillMap.set(category, []);
        groupedSkills.push({ category, items: [] });
      }

      skillMap.get(category).push(item);
    }

    for (const group of groupedSkills) {
      group.items = skillMap.get(group.category).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    const publicProjects = projects.map((project) => {
      const item = stripSensitiveFields(project);
      delete item.visible;
      return item;
    });

    const publicEducation = education.map((item) => stripSensitiveFields(item));
    const publicExperience = experience.map((item) => stripSensitiveFields(item));

    res.set('Cache-Control', 'public, max-age=60');

    return res.status(200).json({
      profile: publicProfile,
      sections: publicSections,
      skills: groupedSkills,
      projects: publicProjects,
      education: publicEducation,
      experience: publicExperience,
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};
