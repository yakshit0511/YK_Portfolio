import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    day: {
      type: String,
      required: true,
      index: true,
    },
    visitorHash: {
      type: String,
      required: true,
      index: true,
    },
    target: {
      type: String,
    },
    referrerHost: {
      type: String,
      maxlength: 100,
    },
    device: {
      type: String,
      enum: ['mobile', 'desktop'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 180 * 24 * 60 * 60,
    },
  },
  {
    timestamps: false,
  }
);

eventSchema.index({ type: 1, day: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
