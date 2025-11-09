import { expect, test } from '@playwright/test';

// 快照断言通过环境变量启用：E2E_SNAPSHOTS=1
const enableSnapshots = process.env.E2E_SNAPSHOTS === '1';

async function dismissAgeOverlay(page) {
  const btn = page.getByText('我已年满18岁');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
  }
}

test.skip(!enableSnapshots, 'Snapshots are gated by E2E_SNAPSHOTS=1');

test.describe('QiFlow - Visual Snapshots', () => {
  test('Bazi form card snapshot (zh)', async ({ page }) => {
    await page.goto('/zh-CN/analysis/bazi');
    await dismissAgeOverlay(page);

    const formCard = page.locator('[data-testid="bazi-form-card"]').first();
    await expect(formCard).toBeVisible();
    await expect(formCard).toHaveScreenshot('bazi-form-card.zh.png');
  });

  test('Xuankong form card snapshot (zh)', async ({ page }) => {
    await page.goto('/zh-CN/analysis/xuankong');
    await dismissAgeOverlay(page);

    const formCard = page.locator('[data-testid="xuankong-form-card"]').first();
    await expect(formCard).toBeVisible();
    await expect(formCard).toHaveScreenshot('xuankong-form-card.zh.png');
  });
});
