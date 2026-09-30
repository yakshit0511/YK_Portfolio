import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailError: {
      type: String,
      maxlength: 300,
    },
    emailedAt: {
      type: Date,
    },
    ip: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ email: 1, createdAt: -1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
