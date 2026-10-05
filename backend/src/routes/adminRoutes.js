import { Router } from 'express';
import { body, param } from 'express-validator';

import {
  createEducation,
  createCertificate,
  createExperience,
  createProject,
  createSkill,
  deleteCertificate,
  deleteEducation,
  deleteExperience,
  deleteInquiry,
  deleteProfileResume,
  deleteProject,
  deleteProjectImage,
  deleteSkill,
  getDashboardStats,
  getCertificates,
  getEducation,
  getExperience,
  getInsights,
  getInquiries,
  getInquiryById,
  getProfile,
  getProjects,
  getSections,
  getSkills,
  reorderEducation,
  reorderCertificates,
  reorderExperience,
  reorderProjects,
  reorderSkills,
  resendInquiryEmail,
  updateCertificate,
  updateEducation,
  updateExperience,
  updateInquiryStatus,
  updateProfile,
  updateProject,
  uploadCertificateImage,
  updateSections,
  updateSkill,
  uploadProfileAvatar,
  uploadProfileResume,
  uploadProjectImages,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { originCheck } from '../middleware/csrf.js';
import { rejectUnknownFields, validate } from '../middleware/validate.js';
import { uploadImage, uploadResume } from '../middleware/upload.js';
import { env } from '../config/env.js';

const router = Router();

router.use(protect, originCheck);

if (env.NODE_ENV !== 'production') {
  router.get('/debug/ip', (req, res) => res.status(200).json({
    ip: req.ip,
    forwardedFor: req.get('x-forwarded-for') || null,
  }));
}

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    rejectUnknownFields(['fullName', 'siteName', 'typingTitles', 'about', 'email', 'phone', 'showPhone', 'location', 'socials', 'seo', 'availability', 'currentlyLearning', 'accentColor']),
    body('fullName').optional().isString(),
    body('siteName').optional().isString(),
    body('typingTitles').optional().isArray(),
    body('about').optional().isString(),
    body('email').optional().isEmail(),
    body('phone').optional().isString(),
    body('showPhone').optional().isBoolean(),
    body('location').optional().isString(),
    body('socials').optional().isObject(),
    body('seo').optional().isObject(),
    body('availability').optional().isObject(),
    body('availability.status').optional().isIn(['open', 'limited', 'closed']),
    body('availability.message').optional().isString().isLength({ max: 100 }),
    body('currentlyLearning').optional().isArray({ max: 5 }),
    body('currentlyLearning.*').optional().isString().isLength({ max: 40 }),
    body('accentColor').optional().isString(),
  ],
  validate,
  updateProfile
);
router.post('/profile/avatar', uploadImage.single('image'), uploadProfileAvatar);
router.post('/profile/resume', uploadResume.single('resume'), uploadProfileResume);
router.delete('/profile/resume', deleteProfileResume);

router.get('/projects', getProjects);
router.post(
  '/projects',
  [
    rejectUnknownFields(['title', 'shortDescription', 'description', 'role', 'duration', 'status', 'problem', 'solution', 'features', 'challenges', 'techStack', 'liveUrl', 'githubUrl', 'featured', 'visible', 'order']),
    body('title').notEmpty().withMessage('Project title is required.'),
    body('status').optional().isIn(['completed', 'in-progress', 'planned']),
    body('features').optional().isArray({ max: 10 }),
    body('features.*').optional().isString().isLength({ max: 250 }),
    body('liveUrl').optional({ checkFalsy: true }).isURL().withMessage('liveUrl must be a valid URL.'),
    body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('githubUrl must be a valid URL.'),
  ],
  validate,
  createProject
);
router.put(
  '/projects/:id',
  [
    param('id').isMongoId().withMessage('Invalid project ID.'),
    rejectUnknownFields(['title', 'shortDescription', 'description', 'role', 'duration', 'status', 'problem', 'solution', 'features', 'challenges', 'techStack', 'liveUrl', 'githubUrl', 'featured', 'visible', 'order']),
    body('title').optional().notEmpty().withMessage('Project title cannot be empty.'),
    body('status').optional().isIn(['completed', 'in-progress', 'planned']),
    body('features').optional().isArray({ max: 10 }),
    body('features.*').optional().isString().isLength({ max: 250 }),
    body('liveUrl').optional({ checkFalsy: true }).isURL().withMessage('liveUrl must be a valid URL.'),
    body('githubUrl').optional({ checkFalsy: true }).isURL().withMessage('githubUrl must be a valid URL.'),
  ],
  validate,
  updateProject
);
router.delete('/projects/:id', [param('id').isMongoId().withMessage('Invalid project ID.')], validate, deleteProject);
router.post('/projects/:id/images', uploadImage.array('images', 5), uploadProjectImages);
router.delete('/projects/:id/images/:publicId', deleteProjectImage);
router.patch('/projects/reorder', reorderProjects);

router.get('/skills', getSkills);
router.post(
  '/skills',
  [
    rejectUnknownFields(['name', 'category', 'level', 'icon', 'visible', 'order']),
    body('name').notEmpty().withMessage('Skill name is required.'),
    body('category').isIn(['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other']),
  ],
  validate,
  createSkill
);
router.put(
  '/skills/:id',
  [
    param('id').isMongoId().withMessage('Invalid skill ID.'),
    rejectUnknownFields(['name', 'category', 'level', 'icon', 'visible', 'order']),
    body('category').optional().isIn(['Frontend', 'Backend', 'Database', 'Tools & Deployment', 'Other']),
  ],
  validate,
  updateSkill
);
router.delete('/skills/:id', [param('id').isMongoId().withMessage('Invalid skill ID.')], validate, deleteSkill);
router.patch('/skills/reorder', reorderSkills);

router.get('/education', getEducation);
router.post(
  '/education',
  [
    rejectUnknownFields(['institution', 'degree', 'field', 'startYear', 'endYear', 'currentSemester', 'grade', 'gradeNote', 'description', 'visible', 'order']),
    body('institution').notEmpty().withMessage('Institution is required.'),
  ],
  validate,
  createEducation
);
router.put('/education/:id', [param('id').isMongoId().withMessage('Invalid education ID.'), rejectUnknownFields(['institution', 'degree', 'field', 'startYear', 'endYear', 'currentSemester', 'grade', 'gradeNote', 'description', 'visible', 'order'])], validate, updateEducation);
router.delete('/education/:id', [param('id').isMongoId().withMessage('Invalid education ID.')], validate, deleteEducation);
router.patch('/education/reorder', reorderEducation);

router.get('/experience', getExperience);
router.post(
  '/experience',
  [
    rejectUnknownFields(['role', 'company', 'startDate', 'endDate', 'current', 'description', 'techStack', 'visible', 'order']),
    body('role').notEmpty().withMessage('Experience role is required.'),
  ],
  validate,
  createExperience
);
router.put('/experience/:id', [param('id').isMongoId().withMessage('Invalid experience ID.'), rejectUnknownFields(['role', 'company', 'startDate', 'endDate', 'current', 'description', 'techStack', 'visible', 'order'])], validate, updateExperience);
router.delete('/experience/:id', [param('id').isMongoId().withMessage('Invalid experience ID.')], validate, deleteExperience);
router.patch('/experience/reorder', reorderExperience);

router.get('/sections', getSections);
router.put('/sections', rejectUnknownFields(['key', 'title', 'visible', 'order']), updateSections);

router.get('/certificates', getCertificates);
router.post(
  '/certificates',
  [
    rejectUnknownFields(['title', 'issuer', 'type', 'issueDate', 'credentialId', 'credentialUrl', 'image', 'description', 'visible', 'order']),
    body('title').notEmpty().withMessage('Certificate title is required.'),
    body('type').optional().isIn(['certificate', 'achievement', 'award']).withMessage('Certificate type is invalid.'),
    body('credentialUrl').optional({ checkFalsy: true }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('credentialUrl must be a valid https URL.'),
  ],
  validate,
  createCertificate
);
router.put(
  '/certificates/:id',
  [
    param('id').isMongoId().withMessage('Invalid certificate ID.'),
    rejectUnknownFields(['title', 'issuer', 'type', 'issueDate', 'credentialId', 'credentialUrl', 'image', 'description', 'visible', 'order']),
    body('type').optional().isIn(['certificate', 'achievement', 'award']).withMessage('Certificate type is invalid.'),
    body('credentialUrl').optional({ checkFalsy: true }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('credentialUrl must be a valid https URL.'),
  ],
  validate,
  updateCertificate
);
router.delete('/certificates/:id', [param('id').isMongoId().withMessage('Invalid certificate ID.')], validate, deleteCertificate);
router.patch('/certificates/reorder', reorderCertificates);
router.post('/certificates/:id/image', uploadImage.single('image'), uploadCertificateImage);

router.get('/insights', getInsights);

router.get('/inquiries', getInquiries);
router.post('/inquiries/:id/resend-email', [param('id').isMongoId().withMessage('Invalid inquiry ID.')], validate, resendInquiryEmail);
router.get('/inquiries/:id', [param('id').isMongoId().withMessage('Invalid inquiry ID.')], validate, getInquiryById);
router.patch('/inquiries/:id/status', [param('id').isMongoId().withMessage('Invalid inquiry ID.'), rejectUnknownFields(['status'])], updateInquiryStatus);
router.delete('/inquiries/:id', [param('id').isMongoId().withMessage('Invalid inquiry ID.')], validate, deleteInquiry);

router.get('/dashboard', getDashboardStats);

export default router;
