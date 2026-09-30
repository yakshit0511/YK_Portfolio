import { expect, test, type Page } from '@playwright/test';

const portfolio = {
  profile: {
    fullName: 'Yakshit Koshiya',
    siteName: 'Yakshit Portfolio',
    typingTitles: ['Full Stack MERN Developer'],
    about: 'A Full Stack MERN Developer building practical applications.',
    email: 'owner@example.test',
    socials: {},
    seo: {},
  },
  sections: [
    { key: 'about', title: 'About', visible: true, order: 0 },
    { key: 'skills', title: 'Skills', visible: true, order: 1 },
    { key: 'projects', title: 'Projects', visible: true, order: 2 },
    { key: 'education', title: 'Education', visible: true, order: 3 },
    { key: 'contact', title: 'Contact', visible: true, order: 4 },
  ],
  skills: [],
  projects: [],
  education: [],
  experience: [],
};

async function mockPublicApi(page: Page) {
  await page.route('**/api/public/portfolio', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(portfolio),
  }));
}

test('home loads without browser console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await mockPublicApi(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test('hero sequence reaches its static final frame under reduced motion', async ({ page }) => {
  await mockPublicApi(page);
  await page.goto('/');
  await expect(page.locator('img.hero-sequence-image')).toHaveAttribute('src', /07_final_pose/);
});

test('contact form displays validation feedback', async ({ page }) => {
  await mockPublicApi(page);
  await page.goto('/');
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText(/Please enter your name/)).toBeVisible();
  await expect(page.getByText(/valid email address/)).toBeVisible();
});

test('unknown admin sub-path redirects a logged-out visitor to admin login', async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Unauthorized' }),
  }));
  const adminPath = process.env.VITE_ADMIN_PATH || '/admin';
  await page.goto(`${adminPath}/not-a-page`);
  await expect(page).toHaveURL(new RegExp(`${adminPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});