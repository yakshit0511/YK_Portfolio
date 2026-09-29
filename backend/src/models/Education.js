import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    degree: {
      type: String,
    },
    field: {
      type: String,
    },
    startYear: {
      type: Number,
    },
    endYear: {
      type: Number,
    },
    currentSemester: {
      type: String,
    },
    grade: {
      type: String,
    },
    gradeNote: {
      type: String,
    },
    description: {
      type: String,
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

const Education = mongoose.model('Education', educationSchema);

export default Education;
