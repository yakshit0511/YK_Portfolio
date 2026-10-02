import crypto from 'node:crypto';

import Certificate from '../models/Certificate.js';
import Education from '../models/Education.js';
import Event from '../models/Event.js';
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
  { key: 'certificates', title: 'Certificates', visible: true, order: 3 },
  { key: 'github', title: 'GitHub', visible: true, order: 4 },
  { key: 'education', title: 'Education', visible: true, order: 5 },
  { key: 'experience', title: 'Experience', visible: true, order: 6 },
  { key: 'contact', title: 'Contact', visible: true, order: 7 },
];

const defaultGithubData = {
  available: true,
  user: {
    login: 'yakshit0511',
    publicRepos: 62,
    followers: 3,
    profileUrl: 'https://github.com/yakshit0511',
  },
  stats: {
    totalStars: 0,
    topLanguages: [
      { name: 'JavaScript', count: 29 },
      { name: 'TypeScript', count: 11 },
      { name: 'HTML', count: 8 },
      { name: 'Dart', count: 5 },
      { name: 'CSS', count: 4 },
    ],
  },
  repos: [
    {
      name: 'YK_Portfolio',
      description: 'Modern, high-performance portfolio website built with React, TypeScript, and Node.js.',
      url: 'https://github.com/yakshit0511/YK_Portfolio',
      language: 'TypeScript',
      stars: 0,
      forks: 0,
      topics: ['react', 'typescript', 'portfolio'],
    },
    {
      name: 'dz-infotech',
      description: 'Production web application with interactive features and responsive modern architecture.',
      url: 'https://github.com/yakshit0511/dz-infotech',
      language: 'TypeScript',
      stars: 0,
      forks: 0,
      topics: ['typescript', 'fullstack'],
    },
    {
      name: 'second-hand-car-dealer',
      description: 'Full-stack platform for vehicle browsing, filtering, and customer inquiries.',
      url: 'https://github.com/yakshit0511/second-hand-car-dealer',
      language: 'TypeScript',
      stars: 0,
      forks: 0,
      topics: ['typescript', 'react', 'mongodb'],
    },
    {
      name: 'Yakshit_Koshiya_Prodigy_Task-3',
      description: 'Interactive web application featuring responsive design and state management.',
      url: 'https://github.com/yakshit0511/Yakshit_Koshiya_Prodigy_Task-3',
      language: 'JavaScript',
      stars: 0,
      forks: 0,
      topics: ['javascript', 'frontend'],
    },
    {
      name: 'Yakshit_Koshiya_Prodigy_Task-2',
      description: 'Dynamic frontend application with real-time UI controls and modular components.',
      url: 'https://github.com/yakshit0511/Yakshit_Koshiya_Prodigy_Task-2',
      language: 'JavaScript',
      stars: 0,
      forks: 0,
      topics: ['javascript', 'web-development'],
    },
    {
      name: 'Yakshit_Koshiya_Prodigy_Task-1',
      description: 'Responsive user interface built with clean architecture and CSS layout systems.',
      url: 'https://github.com/yakshit0511/Yakshit_Koshiya_Prodigy_Task-1',
      language: 'JavaScript',
      stars: 0,
      forks: 0,
      topics: ['html5', 'css3', 'javascript'],
    },
  ],
};

const githubCache = { value: defaultGithubData, expiresAt: 0 };
const slugRegex = /^[a-z0-9-]{1,80}$/;

const stripSensitiveFields = (item) => {
  if (!item) return null;
  const sanitized = { ...item };
  delete sanitized._id;
  delete sanitized.__v;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  return sanitized;
};

const getDayKey = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date).replace(/\//g, '-');
};

const getVisitorHash = (req, day) => {
  const ip = req.ip || 'unknown';
  const ua = String(req.get('user-agent') || '');
  const salt = `portfolio-analytics:${env.JWT_SECRET}`;
  return crypto.createHmac('sha256', salt).update(`${day}|${ip}|${ua}`).digest('hex').slice(0, 16);
};

const normalizeReferrerHost = (referrer, req) => {
  if (!referrer || typeof referrer !== 'string') return null;
  let hostname = '';

  try {
    const parsed = new URL(referrer.includes('://') ? referrer : `https://${referrer}`);
    hostname = parsed.hostname;
  } catch {
    return null;
  }

  if (!hostname) return null;
  const ownHost = String(req.get('host') || '').split(':')[0].toLowerCase();
  if (hostname === ownHost) return null;
  return hostname.toLowerCase().slice(0, 100);
};

const isBotUa = (ua) => /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|curl|wget|python-requests/i.test(ua);

const parseGithubUsername = (value) => {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/github\.com\/?([A-Za-z0-9-]{1,39})/i);
  const username = match ? match[1] : value.trim();
  return /^[A-Za-z0-9-]{1,39}$/.test(username) ? username : null;
};

export const getPortfolio = async (req, res) => {
  try {
    const [profile, sections, skills, projects, education, experience, certificates] = await Promise.all([
      Profile.findOne().lean(),
      SectionSetting.find().sort({ order: 1, key: 1 }).lean(),
      Skill.find({ visible: true }).sort({ category: 1, order: 1, name: 1 }).lean(),
      Project.find({ visible: true }).sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
      Education.find({ visible: true }).sort({ order: 1, endYear: -1 }).lean(),
      Experience.find({ visible: true }).sort({ order: 1, startDate: -1 }).lean(),
      Certificate.find({ visible: true }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    const publicProfile = profile
      ? { ...profile, email: profile.email || env.INQUIRY_TO_EMAIL }
      : { email: env.INQUIRY_TO_EMAIL };

    if (publicProfile) {
      if (!publicProfile.showPhone) delete publicProfile.phone;
      const githubUsername = parseGithubUsername(publicProfile.socials?.github);
      if (githubUsername) {
        publicProfile.socials = { ...publicProfile.socials, github: `https://github.com/${githubUsername}` };
      }
      publicProfile.availability = publicProfile.availability || { status: 'open', message: 'Open to internships and full-time roles' };
      publicProfile.currentlyLearning = Array.isArray(publicProfile.currentlyLearning) ? publicProfile.currentlyLearning.slice(0, 5) : [];
      delete publicProfile.showPhone;
      delete publicProfile._id;
      delete publicProfile.__v;
      delete publicProfile.createdAt;
      delete publicProfile.updatedAt;
    }

    const visibleSections = sections.length ? sections.filter((section) => section.visible) : defaultSections;
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

    const publicCertificates = certificates.map((certificate) => stripSensitiveFields(certificate));
    const publicEducation = education.map((item) => stripSensitiveFields(item));
    const publicExperience = experience.map((item) => stripSensitiveFields(item));

    res.set('Cache-Control', 'public, max-age=60');

    return res.status(200).json({
      profile: publicProfile,
      sections: publicSections,
      skills: groupedSkills,
      projects: publicProjects,
      certificates: publicCertificates,
      education: publicEducation,
      experience: publicExperience,
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || '');
    if (!slugRegex.test(slug)) return res.status(404).json({ message: 'Project not found.' });

    const project = await Project.findOne({ slug, visible: true }).lean();
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const visibleProjects = await Project.find({ visible: true }).sort({ featured: -1, order: 1, createdAt: -1 }).select('slug title').lean();
    const currentIndex = visibleProjects.findIndex((item) => item.slug === slug);
    const prev = currentIndex > 0 ? visibleProjects[currentIndex - 1] : null;
    const next = currentIndex >= 0 && currentIndex < visibleProjects.length - 1 ? visibleProjects[currentIndex + 1] : null;

    const payload = { ...project, prev, next };
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getGithubActivity = async (req, res) => {
  try {
    const profile = await Profile.findOne().select('socials.github').lean();
    const username = parseGithubUsername(profile?.socials?.github || '') || 'yakshit0511';

    const now = Date.now();
    if (githubCache.value?.user?.login?.toLowerCase() === username.toLowerCase() && githubCache.expiresAt > now) {
      return res.set('Cache-Control', 'public, max-age=300').status(200).json({ ...githubCache.value, stale: false });
    }

    const headers = {
      'User-Agent': 'yakshit-portfolio',
      Accept: 'application/vnd.github+json',
    };

    if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const [userRes, repoRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers, signal: controller.signal }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers, signal: controller.signal }),
      ]);

      if (userRes.status === 403 || userRes.status === 429 || repoRes.status === 403 || repoRes.status === 429) {
        if (githubCache.value) {
          return res.set('Cache-Control', 'public, max-age=300').status(200).json({ ...githubCache.value, stale: true });
        }
        return res.set('Cache-Control', 'public, max-age=300').status(200).json({ available: false });
      }

      if (!userRes.ok || !repoRes.ok) {
        if (githubCache.value) {
          return res.set('Cache-Control', 'public, max-age=300').status(200).json({ ...githubCache.value, stale: true });
        }
        return res.set('Cache-Control', 'public, max-age=300').status(200).json({ available: false });
      }

      const user = await userRes.json();
      const repoPayload = await repoRes.json();
      const repos = (Array.isArray(repoPayload) ? repoPayload : [])
        .filter((repo) => !repo.fork && !repo.archived)
        .sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0))
        .slice(0, 6)
        .map((repo) => ({
          name: repo.name,
          description: String(repo.description || '').slice(0, 140),
          url: repo.html_url,
          language: repo.language || null,
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          pushedAt: repo.pushed_at,
          topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : [],
        }));

      const languageMap = new Map();
      (Array.isArray(repoPayload) ? repoPayload : [])
        .filter((repo) => !repo.fork && !repo.archived && repo.language)
        .forEach((repo) => {
          const existing = languageMap.get(repo.language) || 0;
          languageMap.set(repo.language, existing + 1);
        });

      const stats = {
        totalStars: (Array.isArray(repoPayload) ? repoPayload : []).filter((repo) => !repo.fork).reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0),
        topLanguages: [...languageMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
      };

      const result = {
        available: true,
        user: {
          login: user.login,
          publicRepos: user.public_repos || 0,
          followers: user.followers || 0,
          profileUrl: user.html_url,
        },
        stats,
        repos,
      };

      githubCache.value = result;
      githubCache.expiresAt = Date.now() + 60 * 60 * 1000;
      return res.set('Cache-Control', 'public, max-age=300').status(200).json(result);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (githubCache.value) {
      return res.set('Cache-Control', 'public, max-age=300').status(200).json({ ...githubCache.value, stale: true });
    }
    return res.set('Cache-Control', 'public, max-age=300').status(200).json({ available: false });
  }
};

export const trackEvent = async (req, res) => {
  try {
    if (req.get('dnt') === '1' || req.get('sec-gpc') === '1') return res.status(204).end();
    const ua = req.get('user-agent') || '';
    if (!ua || isBotUa(ua)) return res.status(204).end();
    if (req.cookies?.admin_token) return res.status(204).end();

    const body = req.body || {};
    const type = String(body.type || '');
    const allowedTypes = ['pageview', 'project_view', 'project_link', 'resume_download', 'social_click', 'contact_submit'];
    if (!allowedTypes.includes(type)) return res.status(204).end();

    const target = typeof body.target === 'string' ? body.target.trim() : '';
    const device = body.device === 'mobile' ? 'mobile' : body.device === 'desktop' ? 'desktop' : null;
    if (!device) return res.status(204).end();

    if (type === 'project_view' || type === 'project_link') {
      if (!slugRegex.test(target)) return res.status(204).end();
    }

    if (type === 'social_click' && !['github', 'linkedin', 'instagram', 'email', 'whatsapp'].includes(target)) return res.status(204).end();
    if (['pageview', 'resume_download', 'contact_submit'].includes(type) && target) return res.status(204).end();

    const referrerHost = normalizeReferrerHost(req.get('referer'), req);

    const day = getDayKey();
    const visitorHash = getVisitorHash(req, day);

    await Event.create({
      type,
      day,
      visitorHash,
      target: target || undefined,
      referrerHost: referrerHost || undefined,
      device,
      createdAt: new Date(),
    });

    return res.status(204).end();
  } catch (error) {
    return res.status(204).end();
  }
};

export const getResume = async (_req, res) => {
  try {
    const profile = await Profile.findOne().select('resume.url').lean();
    if (!profile?.resume?.url) return res.status(404).json({ message: 'No resume is available.' });

    const resumeUrl = new URL(profile.resume.url);
    if (resumeUrl.protocol !== 'https:' || resumeUrl.hostname !== 'res.cloudinary.com') {
      return res.status(502).json({ message: 'Resume storage URL is invalid.' });
    }

    const upstream = await fetch(resumeUrl, {
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    });
    if (!upstream.ok) return res.status(502).json({ message: 'Resume could not be loaded.' });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.set({
      'Cache-Control': 'public, max-age=60',
      'Content-Disposition': `${_req.query.download === '1' ? 'attachment' : 'inline'}; filename="resume.pdf"`,
      'Content-Length': String(buffer.length),
      'Content-Type': 'application/pdf',
      'X-Content-Type-Options': 'nosniff',
    });
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(502).json({
      message: process.env.NODE_ENV === 'production' ? 'Resume could not be loaded.' : error.message,
    });
  }
};
