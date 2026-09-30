import Certificate from '../models/Certificate.js';
import Education from '../models/Education.js';
import Event from '../models/Event.js';
import Experience from '../models/Experience.js';
import Inquiry from '../models/Inquiry.js';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import SectionSetting from '../models/SectionSetting.js';
import Skill from '../models/Skill.js';
import { deleteAsset, extractPublicIdFromUrl, uploadBuffer } from '../utils/cloudinaryUpload.js';
import { sendInquiryNotification } from '../utils/mailer.js';

const allowedProfileFields = [
  'fullName',
  'siteName',
  'typingTitles',
  'about',
  'email',
  'phone',
  'showPhone',
  'location',
  'socials',
  'seo',
  'availability',
  'currentlyLearning',
  'accentColor',
];

const allowedProjectFields = [
  'title',
  'shortDescription',
  'description',
  'role',
  'duration',
  'status',
  'problem',
  'solution',
  'features',
  'challenges',
  'techStack',
  'liveUrl',
  'githubUrl',
  'featured',
  'visible',
  'order',
];

const allowedSkillFields = ['name', 'category', 'level', 'icon', 'visible', 'order'];
const allowedEducationFields = [
  'institution',
  'degree',
  'field',
  'startYear',
  'endYear',
  'currentSemester',
  'grade',
  'gradeNote',
  'description',
  'visible',
  'order',
];
const allowedExperienceFields = ['role', 'company', 'startDate', 'endDate', 'current', 'description', 'techStack', 'visible', 'order'];

const pickAllowedFields = (source, allowedFields) => {
  const picked = {};

  for (const field of allowedFields) {
    if (source && Object.prototype.hasOwnProperty.call(source, field)) {
      picked[field] = source[field];
    }
  }

  return picked;
};

const isValidUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (error) {
    return false;
  }
};

const isValidHttpsUrl = (value) => {
  if (!value) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';

const makeUniqueSlug = async (title, currentId = null) => {
  const base = slugify(title);
  let slug = base;
  let counter = 1;

  while (true) {
    const query = { slug };

    if (currentId) {
      query._id = { $ne: currentId };
    }

    const existing = await Project.findOne(query);

    if (!existing) {
      return slug;
    }

    slug = `${base}-${counter}`;
    counter += 1;
  }
};

const ensureProfile = async () => {
  let profile = await Profile.findOne();

  if (!profile) {
    profile = await Profile.create({
      fullName: 'Yakshit Koshiya',
      siteName: 'Yakshit Portfolio',
      typingTitles: ['Full Stack MERN Developer'],
      accentColor: '#2f7bff',
    });
  }

  return profile;
};

export const getProfile = async (req, res) => {
  try {
    const profile = await ensureProfile();
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const payload = pickAllowedFields(req.body, allowedProfileFields);

    if (payload.email) {
      payload.email = String(payload.email).trim().toLowerCase();
    }

    if (payload.typingTitles && Array.isArray(payload.typingTitles)) {
      payload.typingTitles = payload.typingTitles.map((title) => String(title).trim()).filter(Boolean);
    }

    if (payload.currentlyLearning && Array.isArray(payload.currentlyLearning)) {
      payload.currentlyLearning = payload.currentlyLearning
        .slice(0, 5)
        .map((value) => String(value).trim())
        .filter(Boolean)
        .map((value) => value.slice(0, 40));
    }

    if (payload.availability && typeof payload.availability === 'object') {
      const status = ['open', 'limited', 'closed'].includes(payload.availability.status)
        ? payload.availability.status
        : 'open';
      payload.availability = {
        status,
        message: String(payload.availability.message || '').slice(0, 100),
      };
    }

    if (payload.socials && typeof payload.socials === 'object') {
      payload.socials = {
        github: payload.socials.github || '',
        linkedin: payload.socials.linkedin || '',
        instagram: payload.socials.instagram || '',
      };
    }

    if (payload.seo && typeof payload.seo === 'object') {
      payload.seo = {
        title: payload.seo.title || '',
        description: payload.seo.description || '',
      };
    }

    const profile = await ensureProfile();
    Object.assign(profile, payload);
    await profile.save();

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const uploadProfileAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const profile = await ensureProfile();
    const existingPublicId = extractPublicIdFromUrl(profile.avatarUrl);

    const result = await uploadBuffer(req.file.buffer, {
      folder: 'yakshit-portfolio/profile',
      resourceType: 'image',
    });

    if (existingPublicId) {
      await deleteAsset(existingPublicId, 'image');
    }

    profile.avatarUrl = result.url;
    await profile.save();

    return res.status(200).json({
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const uploadProfileResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required.' });
    }

    const profile = await ensureProfile();

    if (profile.resume?.publicId) {
      await deleteAsset(profile.resume.publicId, profile.resume.resourceType || 'raw');
    }

    const result = await uploadBuffer(req.file.buffer, {
      folder: 'yakshit-portfolio/resume',
      resourceType: 'raw',
      publicId: `resume-${Date.now()}.pdf`,
    });

    profile.resume = {
      url: result.url,
      publicId: result.publicId,
      resourceType: 'raw',
    };

    await profile.save();

    return res.status(200).json({
      url: result.url,
      publicId: result.publicId,
      resourceType: 'raw',
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteProfileResume = async (req, res) => {
  try {
    const profile = await ensureProfile();

    if (profile.resume?.publicId) {
      await deleteAsset(profile.resume.publicId, profile.resume.resourceType || 'raw');
    }

    profile.resume = undefined;
    await profile.save();

    return res.status(200).json({ message: 'Resume deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ featured: -1, order: 1, createdAt: -1 }).lean();
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const payload = pickAllowedFields(req.body, allowedProjectFields);

    if (!payload.title || !String(payload.title).trim()) {
      return res.status(400).json({ message: 'Project title is required.' });
    }

    if (payload.liveUrl && !isValidUrl(payload.liveUrl)) {
      return res.status(400).json({ message: 'liveUrl must be a valid URL.' });
    }

    if (payload.githubUrl && !isValidUrl(payload.githubUrl)) {
      return res.status(400).json({ message: 'githubUrl must be a valid URL.' });
    }

    if (payload.status && !['completed', 'in-progress', 'planned'].includes(payload.status)) {
      return res.status(400).json({ message: 'status must be one of completed, in-progress, or planned.' });
    }

    if (payload.features && Array.isArray(payload.features)) {
      payload.features = payload.features.slice(0, 10).map((value) => String(value).slice(0, 120));
    }

    const slug = await makeUniqueSlug(payload.title);
    const project = await Project.create({
      ...payload,
      slug,
      techStack: Array.isArray(payload.techStack) ? payload.techStack : [],
      images: [],
    });

    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const payload = pickAllowedFields(req.body, allowedProjectFields);

    if (payload.title && String(payload.title).trim()) {
      const slug = await makeUniqueSlug(payload.title, project._id);
      payload.slug = slug;
    }

    if (payload.liveUrl && !isValidUrl(payload.liveUrl)) {
      return res.status(400).json({ message: 'liveUrl must be a valid URL.' });
    }

    if (payload.githubUrl && !isValidUrl(payload.githubUrl)) {
      return res.status(400).json({ message: 'githubUrl must be a valid URL.' });
    }

    if (payload.status && !['completed', 'in-progress', 'planned'].includes(payload.status)) {
      return res.status(400).json({ message: 'status must be one of completed, in-progress, or planned.' });
    }

    if (payload.features && Array.isArray(payload.features)) {
      payload.features = payload.features.slice(0, 10).map((value) => String(value).slice(0, 120));
    }

    Object.assign(project, payload);
    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (Array.isArray(project.images)) {
      await Promise.all(
        project.images.map(async (image) => {
          if (image.publicId) {
            await deleteAsset(image.publicId, 'image');
          }
        })
      );
    }

    await project.deleteOne();

    return res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const uploadProjectImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.images.length + req.files.length > 10) {
      return res.status(400).json({ message: 'A project can have at most 10 images.' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadBuffer(file.buffer, {
        folder: 'yakshit-portfolio/projects',
        resourceType: 'image',
      });

      uploadedImages.push({
        url: result.url,
        publicId: result.publicId,
      });
    }

    project.images.push(...uploadedImages);
    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteProjectImage = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const publicId = decodeURIComponent(req.params.publicId);
    const imageExists = project.images.some((image) => image.publicId === publicId);

    if (!imageExists) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    await deleteAsset(publicId, 'image');

    project.images = project.images.filter((image) => image.publicId !== publicId);
    await project.save();

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const reorderProjects = async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];

    if (!updates.length) {
      return res.status(400).json({ message: 'A reorder list is required.' });
    }

    const operations = updates.map(async (item) => {
      const project = await Project.findById(item.id);

      if (!project) {
        return null;
      }

      project.order = Number(item.order) || 0;
      await project.save();
      return project;
    });

    await Promise.all(operations);

    const refreshed = await Project.find().sort({ featured: -1, order: 1, createdAt: -1 });
    return res.status(200).json(refreshed);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1, name: 1 }).lean();
    return res.status(200).json(skills);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const createSkill = async (req, res) => {
  try {
    const payload = pickAllowedFields(req.body, allowedSkillFields);

    if (!payload.name || !String(payload.name).trim()) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    if (!['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other'].includes(payload.category)) {
      return res.status(400).json({ message: 'Skill category is invalid.' });
    }

    const skill = await Skill.create(payload);
    return res.status(201).json(skill);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    const payload = pickAllowedFields(req.body, allowedSkillFields);

    if (payload.category && !['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other'].includes(payload.category)) {
      return res.status(400).json({ message: 'Skill category is invalid.' });
    }

    Object.assign(skill, payload);
    await skill.save();

    return res.status(200).json(skill);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    await skill.deleteOne();
    return res.status(200).json({ message: 'Skill deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const reorderSkills = async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];

    await Promise.all(
      updates.map(async (item) => {
        const skill = await Skill.findById(item.id);

        if (skill) {
          skill.order = Number(item.order) || 0;
          await skill.save();
        }
      })
    );

    const skills = await Skill.find().sort({ category: 1, order: 1, name: 1 });
    return res.status(200).json(skills);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getEducation = async (req, res) => {
  try {
    const list = await Education.find().sort({ order: 1, endYear: -1 }).lean();
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const createEducation = async (req, res) => {
  try {
    const payload = pickAllowedFields(req.body, allowedEducationFields);

    if (!payload.institution || !String(payload.institution).trim()) {
      return res.status(400).json({ message: 'Institution is required.' });
    }

    const education = await Education.create(payload);
    return res.status(201).json(education);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ message: 'Education item not found.' });
    }

    Object.assign(education, pickAllowedFields(req.body, allowedEducationFields));
    await education.save();

    return res.status(200).json(education);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const education = await Education.findById(req.params.id);

    if (!education) {
      return res.status(404).json({ message: 'Education item not found.' });
    }

    await education.deleteOne();
    return res.status(200).json({ message: 'Education item deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const reorderEducation = async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];

    await Promise.all(
      updates.map(async (item) => {
        const education = await Education.findById(item.id);

        if (education) {
          education.order = Number(item.order) || 0;
          await education.save();
        }
      })
    );

    const list = await Education.find().sort({ order: 1, endYear: -1 });
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getExperience = async (req, res) => {
  try {
    const list = await Experience.find().sort({ order: 1, startDate: -1 }).lean();
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const createExperience = async (req, res) => {
  try {
    const payload = pickAllowedFields(req.body, allowedExperienceFields);

    if (!payload.role || !String(payload.role).trim()) {
      return res.status(400).json({ message: 'Experience role is required.' });
    }

    const item = await Experience.create(payload);
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const item = await Experience.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Experience item not found.' });
    }

    Object.assign(item, pickAllowedFields(req.body, allowedExperienceFields));
    await item.save();

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const item = await Experience.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Experience item not found.' });
    }

    await item.deleteOne();
    return res.status(200).json({ message: 'Experience item deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const reorderExperience = async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];

    await Promise.all(
      updates.map(async (item) => {
        const record = await Experience.findById(item.id);

        if (record) {
          record.order = Number(item.order) || 0;
          await record.save();
        }
      })
    );

    const list = await Experience.find().sort({ order: 1, startDate: -1 });
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getSections = async (req, res) => {
  try {
    const sections = await SectionSetting.find().sort({ order: 1, key: 1 });
    return res.status(200).json(sections);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateSections = async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [];
    const allowedKeys = ['about', 'skills', 'projects', 'certificates', 'github', 'education', 'experience', 'contact'];

    const updates = await Promise.all(
      payload.map(async (item) => {
        if (!item || !allowedKeys.includes(item.key)) {
          return null;
        }

        const sanitized = {
          key: item.key,
          title: item.title || '',
          visible: Boolean(item.visible),
          order: Number(item.order) || 0,
        };

        return SectionSetting.findOneAndUpdate(
          { key: item.key },
          { $set: sanitized },
          { upsert: true, new: true }
        );
      })
    );

    const finalSections = updates.filter(Boolean).sort((a, b) => a.order - b.order);

    for (const key of allowedKeys) {
      const exists = finalSections.some((item) => item.key === key);

      if (!exists) {
        finalSections.push(
          await SectionSetting.findOneAndUpdate(
            { key },
            { $set: { key, title: key, visible: true, order: 0 } },
            { upsert: true, new: true }
          )
        );
      }
    }

    finalSections.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));

    return res.status(200).json(finalSections);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const filter = {
      ...(status ? { status } : {}),
      ...(req.query.emailFailed === 'true' ? { emailSent: false } : {}),
    };

    const [items, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Inquiry.countDocuments(filter),
    ]);

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const resendInquiryEmail = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });
    if (inquiry.emailSent) return res.status(200).json({ emailSent: true, emailError: null });

    const result = await sendInquiryNotification(inquiry);
    if (result.ok) {
      inquiry.emailSent = true;
      inquiry.emailedAt = new Date();
      inquiry.emailError = undefined;
    } else {
      inquiry.emailSent = false;
      inquiry.emailError = String(result.error || 'Email delivery failed.').slice(0, 300);
      console.error('Admin inquiry email retry failed.');
    }

    await inquiry.save();
    return res.status(200).json({
      emailSent: inquiry.emailSent,
      emailError: inquiry.emailError || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    if (inquiry.status === 'new') {
      inquiry.status = 'read';
      await inquiry.save();
    }

    return res.status(200).json(inquiry);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    const nextStatus = req.body.status;

    if (!['new', 'read', 'replied'].includes(nextStatus)) {
      return res.status(400).json({ message: 'Status must be one of: new, read, replied.' });
    }

    inquiry.status = nextStatus;
    await inquiry.save();

    return res.status(200).json(inquiry);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    await inquiry.deleteOne();
    return res.status(200).json({ message: 'Inquiry deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ order: 1, createdAt: -1 }).lean();
    return res.status(200).json(certificates);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const createCertificate = async (req, res) => {
  try {
    const payload = pickAllowedFields(req.body, ['title', 'issuer', 'type', 'issueDate', 'credentialId', 'credentialUrl', 'image', 'description', 'visible', 'order']);

    if (!payload.title || !String(payload.title).trim()) {
      return res.status(400).json({ message: 'Certificate title is required.' });
    }

    if (payload.type && !['certificate', 'achievement', 'award'].includes(payload.type)) {
      return res.status(400).json({ message: 'Certificate type is invalid.' });
    }

    if (payload.credentialUrl && !isValidHttpsUrl(payload.credentialUrl)) {
      return res.status(400).json({ message: 'credentialUrl must be a valid https URL.' });
    }

    const certificate = await Certificate.create({
      ...payload,
      visible: payload.visible !== false,
      order: Number(payload.order) || 0,
    });

    return res.status(201).json(certificate);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    const payload = pickAllowedFields(req.body, ['title', 'issuer', 'type', 'issueDate', 'credentialId', 'credentialUrl', 'image', 'description', 'visible', 'order']);

    if (payload.type && !['certificate', 'achievement', 'award'].includes(payload.type)) {
      return res.status(400).json({ message: 'Certificate type is invalid.' });
    }

    if (payload.credentialUrl && !isValidHttpsUrl(payload.credentialUrl)) {
      return res.status(400).json({ message: 'credentialUrl must be a valid https URL.' });
    }

    Object.assign(certificate, payload);
    await certificate.save();
    return res.status(200).json(certificate);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    if (certificate.image?.publicId) {
      await deleteAsset(certificate.image.publicId, 'image');
    }

    await certificate.deleteOne();
    return res.status(200).json({ message: 'Certificate deleted successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const reorderCertificates = async (req, res) => {
  try {
    const updates = Array.isArray(req.body) ? req.body : [];

    await Promise.all(
      updates.map(async (item) => {
        const certificate = await Certificate.findById(item.id);
        if (certificate) {
          certificate.order = Number(item.order) || 0;
          await certificate.save();
        }
      })
    );

    const list = await Certificate.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const uploadCertificateImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }

    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    if (certificate.image?.publicId) {
      await deleteAsset(certificate.image.publicId, 'image');
    }

    const result = await uploadBuffer(req.file.buffer, {
      folder: 'yakshit-portfolio/certificates',
      resourceType: 'image',
    });

    certificate.image = {
      url: result.url,
      publicId: result.publicId,
    };

    await certificate.save();
    return res.status(200).json(certificate);
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const getInsights = async (req, res) => {
  try {
    const rawRange = String(req.query.range || '30');
    const range = ['7', '30', '90'].includes(rawRange) ? Number(rawRange) : 30;
    const { startDay, endDay } = getDayRange(range);
    const events = await Event.find({ day: { $gte: startDay, $lte: endDay } }).lean();

    const dailyMap = new Map();
    const [startYear, startMonth, startDate] = startDay.split('-').map(Number);
    const dayValues = Array.from({ length: range }, (_value, index) => {
      const date = new Date(Date.UTC(startYear, startMonth - 1, startDate + index, 6));
      return formatDayLocal(date);
    });
    for (const day of dayValues) {
      dailyMap.set(day, { day, views: 0, unique: 0, uniqueSet: new Set() });
    }

    const uniqueVisitors = new Set();
    for (const event of events) {
      const day = dailyMap.get(event.day);
      if (!day) continue;
      day.views += event.type === 'pageview' ? 1 : 0;
      day.uniqueSet.add(event.visitorHash);
      uniqueVisitors.add(event.visitorHash);
    }

    const daily = dayValues.map((day) => {
      const entry = dailyMap.get(day);
      const unique = entry ? entry.uniqueSet.size : 0;
      return {
        day,
        views: entry ? entry.views : 0,
        unique,
      };
    });

    const totals = {
      views: daily.reduce((sum, item) => sum + item.views, 0),
      uniqueVisitors: daily.reduce((sum, item) => sum + item.unique, 0),
      projectViews: events.filter((event) => event.type === 'project_view').length,
      projectLinkClicks: events.filter((event) => event.type === 'project_link').length,
      resumeDownloads: events.filter((event) => event.type === 'resume_download').length,
      socialClicks: events.filter((event) => event.type === 'social_click').length,
      contactSubmits: events.filter((event) => event.type === 'contact_submit').length,
    };

    const projectGroups = new Map();
    for (const event of events) {
      if (!event.target || !['project_view', 'project_link'].includes(event.type)) continue;
      const key = event.target;
      const project = projectGroups.get(key) || { slug: key, views: 0, linkClicks: 0 };
      if (event.type === 'project_view') project.views += 1;
      if (event.type === 'project_link') project.linkClicks += 1;
      projectGroups.set(key, project);
    }

    const projectList = await Promise.all(
      [...projectGroups.entries()]
        .sort((a, b) => (b[1].views + b[1].linkClicks) - (a[1].views + a[1].linkClicks))
        .slice(0, 5)
        .map(async ([slug, data]) => {
          const project = await Project.findOne({ slug }).select('title slug').lean();
          return {
            slug,
            title: project?.title || slug,
            views: data.views,
            linkClicks: data.linkClicks,
          };
        })
    );

    const referrerGroups = new Map();
    for (const event of events) {
      if (!event.referrerHost) continue;
      referrerGroups.set(event.referrerHost, (referrerGroups.get(event.referrerHost) || 0) + 1);
    }

    const topReferrers = [...referrerGroups.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([host, count]) => ({ host, count }));

    const devices = { mobile: 0, desktop: 0 };
    for (const event of events) {
      if (event.device === 'mobile') devices.mobile += 1;
      if (event.device === 'desktop') devices.desktop += 1;
    }

    return res.status(200).json({
      range,
      totals,
      daily,
      topProjects: projectList,
      topReferrers,
      devices,
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

const formatDayLocal = (date) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date).replace(/\//g, '-');
};

const getDayRange = (range) => {
  const endDay = formatDayLocal(new Date());
  const [year, month, day] = endDay.split('-').map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, day - range + 1, 6));
  return {
    startDay: formatDayLocal(startDate),
    endDay,
  };
};

export const getDashboardStats = async (req, res) => {
  try {
    const [projects, skills, unreadInquiries, totalInquiries, failedEmails, recentInquiries] = await Promise.all([
      Project.countDocuments(),
      Skill.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ emailSent: false }),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return res.status(200).json({
      projects,
      skills,
      unreadInquiries,
      totalInquiries,
      failedEmails,
      recentInquiries,
    });
  } catch (error) {
    return res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};
