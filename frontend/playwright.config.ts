import { defineConfig } from '@playwright/test';
import { loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseURL = 'http://localhost:5173';
const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const viteEnv = loadEnv('development', frontendRoot, 'VITE_');
const configuredAdminPath = viteEnv.VITE_ADMIN_PATH || '/admin';
process.env.VITE_ADMIN_PATH = configuredAdminPath.startsWith('/') ? configuredAdminPath : `/${configuredAdminPath}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 30_000,
  reporter: 'list',
  use: {
    baseURL,
    headless: true,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { VITE_ADMIN_PATH: process.env.VITE_ADMIN_PATH },
  },
});