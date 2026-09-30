import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    issuer: {
      type: String,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ['certificate', 'achievement', 'award'],
      default: 'certificate',
    },
    issueDate: {
      type: String,
    },
    credentialId: {
      type: String,
      maxlength: 80,
    },
    credentialUrl: {
      type: String,
      validate: {
        validator(value) {
          if (!value) return true;
          try {
            const parsed = new URL(value);
            return parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'credentialUrl must be a valid https URL.',
      },
    },
    image: {
      url: String,
      publicId: String,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ visible: 1, order: 1, createdAt: -1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
