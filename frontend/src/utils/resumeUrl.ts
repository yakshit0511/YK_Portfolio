import { apiClient } from '../api/client';

export function getResumeDeliveryUrl(url: string, asDownload = false) {
  if (!url) return '';
  const path = asDownload ? '/api/public/resume?download=1' : '/api/public/resume';
  return apiClient.getUri({ url: path });
}