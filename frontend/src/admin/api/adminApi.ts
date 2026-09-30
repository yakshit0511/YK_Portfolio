import axios, { type AxiosRequestConfig } from 'axios';
import { apiClient } from '../../api/client';

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string | string[]>;
};

export interface AuthUser {
  email: string;
  lastLoginAt: string | null;
}

export interface ProfileData {
  fullName?: string;
  siteName?: string;
  typingTitles?: string[];
  about?: string;
  email?: string;
  phone?: string;
  showPhone?: boolean;
  location?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
  availability?: { status?: 'open' | 'limited' | 'closed'; message?: string };
  currentlyLearning?: string[];
  accentColor?: string;
  avatarUrl?: string;
  resume?: { url?: string; publicId?: string };
}

export interface ProjectData {
  _id?: string;
  title: string;
  shortDescription?: string;
  description?: string;
  techStack?: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  visible?: boolean;
  order?: number;
  images?: Array<{ url: string; publicId?: string }>;
  slug?: string;
  role?: string;
  duration?: string;
  status?: 'completed' | 'in-progress' | 'planned';
  problem?: string;
  solution?: string;
  features?: string[];
  challenges?: string;
}

export interface CertificateData {
  _id?: string;
  title: string;
  issuer?: string;
  type?: 'certificate' | 'achievement' | 'award';
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: { url?: string; publicId?: string };
  description?: string;
  visible?: boolean;
  order?: number;
}

export interface InsightsData {
  range: number;
  totals: {
    views: number;
    uniqueVisitors: number;
    projectViews: number;
    projectLinkClicks: number;
    resumeDownloads: number;
    socialClicks: number;
    contactSubmits: number;
  };
  daily: Array<{ day: string; views: number; unique: number }>;
  topProjects: Array<{ slug: string; title: string; views: number; linkClicks: number }>;
  topReferrers: Array<{ host: string; count: number }>;
  devices: { mobile: number; desktop: number };
}

export interface SkillData {
  _id?: string;
  name: string;
  category: string;
  level?: number;
  visible?: boolean;
  order?: number;
}

export interface EducationData {
  _id?: string;
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number | string;
  endYear?: number | string;
  currentSemester?: string;
  grade?: string;
  gradeNote?: string;
  description?: string;
  visible?: boolean;
  order?: number;
}

export interface ExperienceData {
  _id?: string;
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

export interface SectionData {
  key: 'about' | 'skills' | 'projects' | 'certificates' | 'github' | 'education' | 'experience' | 'contact';
  title: string;
  visible: boolean;
  order: number;
}

export interface InquiryData {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  emailSent?: boolean;
  emailError?: string | null;
  createdAt?: string;
}

export interface DashboardData {
  projects: number;
  skills: number;
  unreadInquiries: number;
  totalInquiries: number;
  failedEmails: number;
  recentInquiries: InquiryData[];
}

export interface PaginatedInquiries {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: InquiryData[];
}

export function getEnvAdminPath() {
  const configuredPath = import.meta.env.VITE_ADMIN_PATH || '/admin';
  return configuredPath.startsWith('/')
    ? configuredPath
    : `/${import.meta.env.VITE_ADMIN_PATH}`;
}

export function getAdminLoginPath() {
  return `${getEnvAdminPath()}`;
}

export const isAdminRequest = (config?: AxiosRequestConfig) => {
  const url = config?.url ?? '';
  return url.includes('/api/admin');
};

export const registerAdminSessionInterceptor = (onExpired: () => void) => {
  const interceptor = apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const url = error?.config?.url ?? '';
      if (status === 401 && url.includes('/api/admin') && !url.includes('/api/auth/login')) {
        onExpired();
      }
      return Promise.reject(error);
    }
  );

  return () => apiClient.interceptors.response.eject(interceptor);
};

export const getApiMessage = (error: unknown): string => {
  const data = axios.isAxiosError(error) ? error.response?.data : null;
  if (data && typeof data === 'object') {
    const message = (data as ApiErrorResponse).message; 
    if (message) return message;
    const errors = (data as ApiErrorResponse).errors;
    if (errors && typeof errors === 'object') {
      const flattened = Object.values(errors).flatMap((value) => Array.isArray(value) ? value : [value]);
      const first = flattened.find(Boolean);
      if (first) return String(first);
    }
  }

  if (axios.isAxiosError(error) && error.message) {
    return error.message;
  }

  return 'Something went wrong.';
};

export async function getMe() {
  const { data } = await apiClient.get<AuthUser>('/api/auth/me');
  return data;
}

export async function loginAdmin(payload: { email: string; password: string }) {
  const { data } = await apiClient.post<{ message?: string }>('/api/auth/login', payload);
  return data;
}

export async function logoutAdmin() {
  const { data } = await apiClient.post<{ message?: string }>('/api/auth/logout');
  return data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  const { data } = await apiClient.put<{ message?: string }>('/api/auth/change-password', payload);
  return data;
}

export async function getProfile() {
  const { data } = await apiClient.get<ProfileData>('/api/admin/profile');
  return data;
}

export async function updateProfile(payload: Partial<ProfileData>) {
  const { data } = await apiClient.put<ProfileData>('/api/admin/profile', payload);
  return data;
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post<{ url: string; publicId: string }>('/api/admin/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => event,
  });
  return data;
}

export async function uploadResume(file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await apiClient.post<{ url: string; publicId: string }>('/api/admin/profile/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}

export async function removeResume() {
  const { data } = await apiClient.delete<{ message?: string }>('/api/admin/profile/resume');
  return data;
}

export async function getProjects() {
  const { data } = await apiClient.get<ProjectData[]>('/api/admin/projects');
  return data;
}

export async function createProject(payload: Partial<ProjectData>) {
  const { data } = await apiClient.post<ProjectData>('/api/admin/projects', payload);
  return data;
}

export async function updateProject(projectId: string, payload: Partial<ProjectData>) {
  const { data } = await apiClient.put<ProjectData>(`/api/admin/projects/${projectId}`, payload);
  return data;
}

export async function deleteProject(projectId: string) {
  const { data } = await apiClient.delete<{ message?: string }>(`/api/admin/projects/${projectId}`);
  return data;
}

export async function uploadProjectImages(projectId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const { data } = await apiClient.post<ProjectData>(`/api/admin/projects/${projectId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProjectImage(projectId: string, publicId: string) {
  const encoded = encodeURIComponent(publicId);
  const { data } = await apiClient.delete<ProjectData>(`/api/admin/projects/${projectId}/images/${encoded}`);
  return data;
}

export async function reorderProjects(payload: Array<{ id: string; order: number }>) {
  const { data } = await apiClient.patch<ProjectData[]>('/api/admin/projects/reorder', payload);
  return data;
}

export async function getCertificates() {
  const { data } = await apiClient.get<CertificateData[]>('/api/admin/certificates');
  return data;
}

export async function createCertificate(payload: Partial<CertificateData>) {
  const { data } = await apiClient.post<CertificateData>('/api/admin/certificates', payload);
  return data;
}

export async function updateCertificate(id: string, payload: Partial<CertificateData>) {
  const { data } = await apiClient.put<CertificateData>(`/api/admin/certificates/${id}`, payload);
  return data;
}

export async function deleteCertificate(id: string) {
  const { data } = await apiClient.delete<{ message?: string }>(`/api/admin/certificates/${id}`);
  return data;
}

export async function reorderCertificates(payload: Array<{ id: string; order: number }>) {
  const { data } = await apiClient.patch<CertificateData[]>('/api/admin/certificates/reorder', payload);
  return data;
}

export async function uploadCertificateImage(id: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await apiClient.post<CertificateData>(`/api/admin/certificates/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getInsights(range: 7 | 30 | 90) {
  const { data } = await apiClient.get<InsightsData>('/api/admin/insights', { params: { range } });
  return data;
}

export async function getSkills() {
  const { data } = await apiClient.get<SkillData[]>('/api/admin/skills');
  return data;
}

export async function createSkill(payload: Partial<SkillData>) {
  const { data } = await apiClient.post<SkillData>('/api/admin/skills', payload);
  return data;
}

export async function updateSkill(skillId: string, payload: Partial<SkillData>) {
  const { data } = await apiClient.put<SkillData>(`/api/admin/skills/${skillId}`, payload);
  return data;
}

export async function deleteSkill(skillId: string) {
  const { data } = await apiClient.delete<{ message?: string }>(`/api/admin/skills/${skillId}`);
  return data;
}

export async function reorderSkills(payload: Array<{ id: string; order: number }>) {
  const { data } = await apiClient.patch<SkillData[]>('/api/admin/skills/reorder', payload);
  return data;
}

export async function getEducation() {
  const { data } = await apiClient.get<EducationData[]>('/api/admin/education');
  return data;
}

export async function createEducation(payload: Partial<EducationData>) {
  const { data } = await apiClient.post<EducationData>('/api/admin/education', payload);
  return data;
}

export async function updateEducation(educationId: string, payload: Partial<EducationData>) {
  const { data } = await apiClient.put<EducationData>(`/api/admin/education/${educationId}`, payload);
  return data;
}

export async function deleteEducation(id: string) {
  const { data } = await apiClient.delete<{ message?: string }>(`/api/admin/education/${id}`);
  return data;
}

export async function reorderEducation(payload: Array<{ id: string; order: number }>) {
  const { data } = await apiClient.patch<EducationData[]>('/api/admin/education/reorder', payload);
  return data;
}

export async function getExperience() {
  const { data } = await apiClient.get<ExperienceData[]>('/api/admin/experience');
  return data;
}

export async function createExperience(payload: Partial<ExperienceData>) {
  const { data } = await apiClient.post<ExperienceData>('/api/admin/experience', payload);
  return data;
}

export async function updateExperience(itemId: string, payload: Partial<ExperienceData>) {
  const { data } = await apiClient.put<ExperienceData>(`/api/admin/experience/${itemId}`, payload);
  return data;
}

export async function deleteExperience(id: string) {
  const { data } = await apiClient.delete<{ message?: string }>(`/api/admin/experience/${id}`);
  return data;
}

export async function reorderExperience(payload: Array<{ id: string; order: number }>) {
  const { data } = await apiClient.patch<ExperienceData[]>('/api/admin/experience/reorder', payload);
  return data;
}

export async function getSections() {
  const { data } = await apiClient.get<SectionData[]>('/api/admin/sections');
  return data;
}

export async function updateSections(payload: SectionData[]) {
  const { data } = await apiClient.put<SectionData[]>('/api/admin/sections', payload);
  return data;
}

export async function getDashboard() {
  const { data } = await apiClient.get<DashboardData>('/api/admin/dashboard');
  return data;
}

export async function getInquiries(params: { page?: number; limit?: number; status?: string; emailFailed?: boolean }) {
  const { data } = await apiClient.get<PaginatedInquiries>('/api/admin/inquiries', { params });
  return data;
}

export async function getInquiryById(id: string) {
  const { data } = await apiClient.get<InquiryData>(`/api/admin/inquiries/${id}`);
  return data;
}

export async function updateInquiryStatus(id: string, status: InquiryData['status']) {
  const { data } = await apiClient.patch<InquiryData>(`/api/admin/inquiries/${id}/status`, { status });
  return data;
}

export async function deleteInquiry(id: string) {
  const { data } = await apiClient.delete<{ message?: string }>(`/api/admin/inquiries/${id}`);
  return data;
}

export async function resendInquiryEmail(id: string) {
  const { data } = await apiClient.post<{ emailSent: boolean; emailError: string | null }>(`/api/admin/inquiries/${id}/resend-email`);
  return data;
}
