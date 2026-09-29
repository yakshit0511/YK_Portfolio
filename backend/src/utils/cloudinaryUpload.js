import cloudinary from '../config/cloudinary.js';

export const uploadBuffer = async (buffer, { folder, resourceType = 'image' } = {}) => {
  if (!buffer) {
    throw new Error('No file buffer provided for upload.');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result?.secure_url || result?.url,
          publicId: result?.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

export const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};

export const extractPublicIdFromUrl = (url) => {
  if (!url) {
    return null;
  }

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) {
      return null;
    }

    const filePath = parts[1];
    const cleaned = filePath.replace(/^[^/]+\//, '');
    const withoutExtension = cleaned.replace(/\.[^/.]+$/, '');
    return withoutExtension;
  } catch (error) {
    return null;
  }
};
