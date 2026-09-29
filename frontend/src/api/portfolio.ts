import { apiClient } from './client';
import type { PortfolioData } from '../types/portfolio';

export async function fetchPortfolio(): Promise<PortfolioData> {
  const { data } = await apiClient.get<PortfolioData>('/api/public/portfolio');
  return data;
}
