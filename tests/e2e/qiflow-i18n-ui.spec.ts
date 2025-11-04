import { expect, test } from '@playwright/test';

// 验证 i18n 占位符与按钮文案、错误态链路

async function dismissAgeOverlay(page) {
  const btn = page.getByText('我已年满18岁');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
  }
}

test.describe('QiFlow - i18n 与错误态', () => {
  test('Bazi 中文/英文占位符与按钮一致性 + 错误态', async ({ page }) => {
    // 中文
    await page.goto('/zh/analysis/bazi');
    await dismissAgeOverlay(page);
    // 占位符与按钮
    await expect(page.locator('input[name="birth"]')).toHaveAttribute(
      'placeholder',
      '出生日期 1990-01-01 08:08'
    );
    await expect(page.getByRole('button', { name: '开始计算' })).toBeVisible();

    // 错误态（缺少必要字段或非法值）
    await page.locator('input[name="birth"]').fill('invalid');
    await page.getByRole('button', { name: '开始计算' }).click();

    // i18n 错误提示
    await expect(page.getByText('输入无效，请检查后重试。')).toBeVisible({
      timeout: 10_000,
    });

    // 英文
    await page.goto('/en/analysis/bazi');
    await dismissAgeOverlay(page);
    await expect(page.locator('input[name="birth"]')).toHaveAttribute(
      'placeholder',
      'Birth Datetime 1990-01-01 08:08'
    );
    await expect(page.getByRole('button', { name: 'Calculate' })).toBeVisible();
  });

  test('Xuankong 中文/英文占位符与按钮一致性 + 错误态', async ({ page }) => {
    // 中文
    await page.goto('/zh/analysis/xuankong');
    await dismissAgeOverlay(page);
    await expect(page.locator('input[name="address"]')).toHaveAttribute(
      'placeholder',
      '地址'
    );
    await expect(page.locator('input[name="facing"]')).toHaveAttribute(
      'placeholder',
      '朝向（度）'
    );
    await expect(page.getByRole('button', { name: '开始分析' })).toBeVisible();

    // 错误态（非法 facing）
    await page.locator('input[name="address"]').fill('上海市');
    await page.locator('input[name="facing"]').fill('-1');
    await page.getByRole('button', { name: '开始分析' }).click();
    await expect(page.getByText('输入无效，请检查后重试。')).toBeVisible({
      timeout: 10_000,
    });

    // 英文
    await page.goto('/en/analysis/xuankong');
    await dismissAgeOverlay(page);
    await expect(page.locator('input[name="address"]').first()).toHaveAttribute(
      'placeholder',
      'Address'
    );
    await expect(page.locator('input[name="facing"]').first()).toHaveAttribute(
      'placeholder',
      'Facing (deg)'
    );
    await expect(page.getByRole('button', { name: 'Analyze' })).toBeVisible();
  });
});
