import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Pre-warm the application
  try {
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3001');
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log('Could not pre-warm application:', error);
  }

  await browser.close();

  // Set up test database or other global resources if needed
  console.log('Global setup completed');
}

export default globalSetup;
