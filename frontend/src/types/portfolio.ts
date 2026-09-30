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
  phone?: string;
  location?: string;
  avatarUrl?: string;
  resume?: { url?: string; publicId?: string };
  socials: SocialLinks;
  seo?: { title?: string; description?: string };
  availability?: { status?: 'open' | 'limited' | 'closed'; message?: string };
  currentlyLearning?: string[];
  accentColor?: string;
}

export interface Skill {
  name: string;
  category: string;
  visible?: boolean;
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
  role?: string;
  duration?: string;
  status?: 'completed' | 'in-progress' | 'planned';
  problem?: string;
  solution?: string;
  features?: string[];
  challenges?: string;
  images?: ProjectImage[];
  techStack?: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  order?: number;
}

export interface Certificate {
  title: string;
  issuer?: string;
  type?: 'certificate' | 'achievement' | 'award';
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: ProjectImage;
  description?: string;
  order?: number;
}

export interface GithubActivityData {
  available: boolean;
  stale?: boolean;
  user?: { login: string; publicRepos: number; followers: number; profileUrl: string };
  stats?: { totalStars: number; topLanguages: Array<{ name: string; count: number }> };
  repos?: Array<{
    name: string;
    description: string;
    url: string;
    language: string | null;
    stars: number;
    forks: number;
    pushedAt: string | null;
    topics: string[];
  }>;
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
  visible?: boolean;
  order?: number;
}

export interface SectionSetting {
  key: 'about' | 'skills' | 'projects' | 'certificates' | 'github' | 'education' | 'experience' | 'contact';
  title: string;
  visible: boolean;
  order: number;
}

export interface PortfolioData {
  profile: Profile | null;
  sections: SectionSetting[];
  skills: SkillGroup[];
  projects: Project[];
  certificates: Certificate[];
  education: Education[];
  experience: Experience[];
}
