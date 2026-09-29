export interface SocialLinks {
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export interface Profile {
  fullName: string;
  siteName: string;
  typingTitles: string[];
  about: string;
  email?: string;
  location?: string;
  avatarUrl?: string;
  resume?: { url?: string; publicId?: string };
  socials: SocialLinks;
  seo?: { title?: string; description?: string };
  accentColor?: string;
}

export interface Skill {
  name: string;
  category: string;
  level?: number;
  icon?: string;
  order?: number;
}

export interface SkillGroup {
  category: string;
  items: Skill[];
}

export interface ProjectImage {
  url: string;
  publicId?: string;
}

export interface Project {
  title: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  images?: ProjectImage[];
  techStack?: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  order?: number;
}

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  currentSemester?: string;
  grade?: string;
  gradeNote?: string;
  description?: string;
  order?: number;
}

export interface Experience {
  role: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  techStack?: string[];
  order?: number;
}

export interface SectionSetting {
  key: 'about' | 'skills' | 'projects' | 'education' | 'experience' | 'contact';
  title: string;
  visible: boolean;
  order: number;
}

export interface PortfolioData {
  profile: Profile | null;
  sections: SectionSetting[];
  skills: SkillGroup[];
  projects: Project[];
  education: Education[];
  experience: Experience[];
}
