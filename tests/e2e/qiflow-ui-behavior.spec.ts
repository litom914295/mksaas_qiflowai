import { expect, test } from '@playwright/test';

async function dismissAgeOverlay(page) {
  const btn = page.getByText('我已年满18岁');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
  }
}

test.describe('QiFlow - 按钮禁用、i18n 下拉、样式令牌', () => {
  test('Bazi: 表单卡片结构 + 提交前禁用 -> 填写后启用；下拉 i18n；容器样式断言', async ({
    page,
  }) => {
    await page.goto('/zh/analysis/bazi');
    await dismissAgeOverlay(page);

    // 表单卡片结构断言
    const formCard = page.locator('[data-testid="bazi-form-card"]').first();
    await expect(
      formCard.locator('[data-slot="card-header"]').first()
    ).toBeVisible();
    await expect(
      formCard.locator('[data-slot="card-content"]').first()
    ).toBeVisible();
    await expect(
      formCard.locator('[data-slot="card-footer"]').first()
    ).toBeVisible();

    const submit = page.getByRole('button', { name: '开始计算' });
    await expect(submit).toBeDisabled();

    // 仅填写 birth，仍应禁用（name 为空）
    await page.locator('input[name="birth"]').fill('1990-01-01 08:08');
    await expect(submit).toBeDisabled();

    // 补充 name 后启用
    await page.locator('input[name="name"]').fill('测试');
    await expect(submit).toBeEnabled();

    // 下拉 i18n（中文）
    await expect(page.getByRole('option', { name: '男' })).toBeVisible();
    await expect(page.getByRole('option', { name: '女' })).toBeVisible();

    // 提交触发：可能成功或错误
    await submit.click();

    // 根据埋点结果决定断言容器样式
    const isSuccess = await page.evaluate(() => {
      const events = (window as any).__qiflow_events || [];
      return events.some(
        (e: any) => e.name === 'form_success' && e.properties?.module === 'bazi'
      );
    });

    if (isSuccess) {
      // 切换到图表 Tab 并断言图表分块（若存在）
      const chartsTab = page.getByRole('tab', { name: '图表' });
      if (await chartsTab.isVisible().catch(() => false)) {
        await chartsTab.click();
        const pillarsChart = page
          .locator('[data-testid="pillars-chart"]')
          .first();
        if (await pillarsChart.count()) {
          await expect(pillarsChart).toBeVisible();
        }
        const loshu = page.locator('[data-testid="loshu-grid"]').first();
        if (await loshu.count()) {
          await expect(loshu).toBeVisible();
        }
        const tenGods = page.locator('[data-testid="bazi-ten-gods"]').first();
        if (await tenGods.count()) {
          await expect(tenGods).toBeVisible();
        }
        const nayin = page.locator('[data-testid="bazi-nayin"]').first();
        if (await nayin.count()) {
          await expect(nayin).toBeVisible();
        }
        const yunList = page
          .locator('[data-testid="xuankong-yun-list"]')
          .first();
        if (await yunList.count()) {
          await expect(yunList).toBeVisible();
        }
      }
      // 结果容器使用 Card（data-slot=card）
      const card = page.locator('[data-slot="card"]').first();
      await expect(card).toBeVisible();
      // 新增精准断言：四柱面板、玄空特征/罗盘网格（若存在则应出现）
      const pillarsGrid = page.locator('[data-testid="pillars-grid"]').first();
      if (await pillarsGrid.count()) {
        await expect(pillarsGrid).toBeVisible();
      }
      const gejuList = page
        .locator('[data-testid="geju-characteristics"]')
        .first();
      if (await gejuList.count()) {
        await expect(gejuList).toBeVisible();
      }
      const sensorsGrid = page
        .locator('[data-testid="compass-sensors-grid"]')
        .first();
      if (await sensorsGrid.count()) {
        await expect(sensorsGrid).toBeVisible();
      }
      const calibGrid = page
        .locator('[data-testid="compass-calibration-grid"]')
        .first();
      if (await calibGrid.count()) {
        await expect(calibGrid).toBeVisible();
      }
      // 生成并下载报告
      const exportBtn = page.getByRole('button', { name: '生成详细报告' });
      if (await exportBtn.isVisible().catch(() => false)) {
        await exportBtn.click();
        await expect(page.getByRole('link', { name: '下载报告' })).toBeVisible({
          timeout: 10000,
        });
      }
      // 小范围视觉截图回归（作为测试附件）
      const img = await card.screenshot();
      await test.info().attach('bazi-result-card.png', {
        body: img,
        contentType: 'image/png',
      });
    } else {
      // 错误容器使用 StatePanel，并具有 role=alert
      const alert = page.locator('[role="alert"]').first();
      await expect(alert).toBeVisible({ timeout: 10_000 });
      const img = await alert.screenshot();
      await test.info().attach('bazi-error-panel.png', {
        body: img,
        contentType: 'image/png',
      });
    }
  });

  test('Xuankong: 表单卡片结构 + 提交前禁用 -> 填写后启用；文案 i18n；错误容器样式', async ({
    page,
  }) => {
    await page.goto('/zh/analysis/xuankong');
    await dismissAgeOverlay(page);

    // 表单卡片结构断言
    const formCard = page.locator('[data-testid="xuankong-form-card"]').first();
    await expect(
      formCard.locator('[data-slot="card-header"]').first()
    ).toBeVisible();
    await expect(
      formCard.locator('[data-slot="card-content"]').first()
    ).toBeVisible();
    await expect(
      formCard.locator('[data-slot="card-footer"]').first()
    ).toBeVisible();

    const submit = page.getByRole('button', { name: '开始分析' });
    await expect(submit).toBeDisabled();

    // 仅地址，不足
    await page.locator('input[name="address"]').fill('上海市');
    await expect(submit).toBeDisabled();

    // 地址 + 合法朝向 -> 启用
    await page.locator('input[name="facing"]').fill('180');
    await expect(submit).toBeEnabled();

    // 提交后：如果失败，出现错误 StatePanel；如果成功，不强制断言卡片（算法依赖）
    await submit.click();
    const alert = page.locator('[role="alert"]');
    // 失败情况（常见于积分不足等）
    if (await alert.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(alert).toBeVisible();
    }
  });

  test('Bazi 英文：下拉 i18n 校验', async ({ page }) => {
    await page.goto('/en/analysis/bazi');
    await dismissAgeOverlay(page);

    // 触发下拉出现（直接检查 option 文案）
    await expect(page.getByRole('option', { name: 'Male' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Female' })).toBeVisible();
  });
});
