import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: 'Yakshit Koshiya',
    },
    siteName: {
      type: String,
      default: 'Yakshit Portfolio',
    },
    typingTitles: [
      {
        type: String,
      },
    ],
    about: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    showPhone: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    resume: {
      url: String,
      publicId: String,
      resourceType: String,
    },
    socials: {
      github: String,
      linkedin: String,
      instagram: String,
    },
    seo: {
      title: String,
      description: String,
    },
    accentColor: {
      type: String,
      default: '#2f7bff',
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
