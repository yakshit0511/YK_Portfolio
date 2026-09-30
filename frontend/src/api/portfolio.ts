import { apiClient } from './client';
import type { GithubActivityData, PortfolioData, Project } from '../types/portfolio';

export async function fetchPortfolio(): Promise<PortfolioData> {
  const { data } = await apiClient.get<PortfolioData>('/api/public/portfolio');
  return data;
}

export async function fetchGithubActivity(): Promise<GithubActivityData> {
  const { data } = await apiClient.get<GithubActivityData>('/api/public/github');
  return data;
}

export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/api/public/projects/${encodeURIComponent(slug)}`);
  return data;
}
