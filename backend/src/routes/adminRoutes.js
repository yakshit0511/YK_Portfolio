import { Router } from 'express';
import { body, param } from 'express-validator';

import {
  createEducation,
  createExperience,
  createProject,
  createSkill,
  deleteEducation,
  deleteExperience,
  deleteInquiry,
  deleteProfileResume,
  deleteProject,
  deleteProjectImage,
  deleteSkill,
  getDashboardStats,
  getEducation,
  getExperience,
  getInquiries,
  getInquiryById,
  getProfile,
  getProjects,
  getSections,
  getSkills,
  reorderEducation,
  reorderExperience,
  reorderProjects,
  reorderSkills,
  updateEducation,
  updateExperience,
  updateInquiryStatus,
  updateProfile,
  updateProject,
  updateSections,
  updateSkill,
  uploadProfileAvatar,
  uploadProfileResume,
  uploadProjectImages,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { originCheck } from '../middleware/csrf.js';
import { validate } from '../middleware/validate.js';
import { uploadImage, uploadResume } from '../middleware/upload.js';

const router = Router();

router.use(protect, originCheck);

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
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
    body('title').notEmpty().withMessage('Project title is required.'),
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
    body('title').optional().notEmpty().withMessage('Project title cannot be empty.'),
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
  [body('institution').notEmpty().withMessage('Institution is required.')],
  validate,
  createEducation
);
router.put('/education/:id', [param('id').isMongoId().withMessage('Invalid education ID.')], validate, updateEducation);
router.delete('/education/:id', [param('id').isMongoId().withMessage('Invalid education ID.')], validate, deleteEducation);
router.patch('/education/reorder', reorderEducation);

router.get('/experience', getExperience);
router.post(
  '/experience',
  [body('role').notEmpty().withMessage('Experience role is required.')],
  validate,
  createExperience
);
router.put('/experience/:id', [param('id').isMongoId().withMessage('Invalid experience ID.')], validate, updateExperience);
router.delete('/experience/:id', [param('id').isMongoId().withMessage('Invalid experience ID.')], validate, deleteExperience);
router.patch('/experience/reorder', reorderExperience);

router.get('/sections', getSections);
router.put('/sections', updateSections);

router.get('/inquiries', getInquiries);
router.get('/inquiries/:id', [param('id').isMongoId().withMessage('Invalid inquiry ID.')], validate, getInquiryById);
router.patch('/inquiries/:id/status', [param('id').isMongoId().withMessage('Invalid inquiry ID.')], updateInquiryStatus);
router.delete('/inquiries/:id', [param('id').isMongoId().withMessage('Invalid inquiry ID.')], validate, deleteInquiry);

router.get('/dashboard', getDashboardStats);

export default router;
