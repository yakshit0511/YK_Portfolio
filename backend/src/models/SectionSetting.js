import mongoose from 'mongoose';

const sectionSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['about', 'skills', 'projects', 'certificates', 'github', 'education', 'experience', 'contact'],
    },
    title: {
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

const SectionSetting = mongoose.model('SectionSetting', sectionSettingSchema);

export default SectionSetting;
