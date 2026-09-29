import multer from 'multer';

const storage = multer.memoryStorage();

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedImageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
const resumeMimeTypes = ['application/pdf'];
const allowedResumeExtensions = new Set(['pdf']);

const validateFile = ({ allowedMimeTypes, allowedExtensions, errorMessage }) => (req, file, cb) => {
  const extension = file.originalname?.split('.').pop()?.toLowerCase();
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
  const isExtensionAllowed = allowedExtensions.has(extension);

  if (!isMimeAllowed || !isExtensionAllowed) {
    cb(new Error(errorMessage), false);
    return;
  }

  cb(null, true);
};

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: validateFile({
    allowedMimeTypes: imageMimeTypes,
    allowedExtensions: allowedImageExtensions,
    errorMessage: 'Only JPG, PNG, and WEBP images up to 5 MB are allowed.',
  }),
});

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: validateFile({
    allowedMimeTypes: resumeMimeTypes,
    allowedExtensions: allowedResumeExtensions,
    errorMessage: 'Only PDF resumes up to 5 MB are allowed.',
  }),
});
