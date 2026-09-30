import axios from 'axios';

const apiBaseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 10_000,
});
