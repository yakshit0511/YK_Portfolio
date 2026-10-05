import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    shortDescription: {
      type: String,
    },
    description: {
      type: String,
    },
    role: {
      type: String,
      maxlength: 80,
    },
    duration: {
      type: String,
      maxlength: 60,
    },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'planned'],
      default: 'completed',
    },
    problem: {
      type: String,
      maxlength: 800,
    },
    solution: {
      type: String,
      maxlength: 800,
    },
    features: [{
      type: String,
      maxlength: 250,
    }],
    challenges: {
      type: String,
      maxlength: 800,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    techStack: [
      {
        type: String,
      },
    ],
    liveUrl: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
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

projectSchema.index({ visible: 1, featured: -1, order: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
