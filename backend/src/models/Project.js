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
