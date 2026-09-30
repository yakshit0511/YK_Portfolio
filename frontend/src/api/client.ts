import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl = import.meta.env.PROD
  ? configuredApiUrl ?? ''
  : configuredApiUrl || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10_000,
});
