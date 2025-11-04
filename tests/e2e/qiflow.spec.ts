import { expect, test } from '@playwright/test';

async function dismissAgeOverlay(page) {
  // 年龄验证遮罩，若存在则点击“我已年满18岁”
  const btn = page.getByText('我已年满18岁');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
  }
}

test.describe('QiFlow Pages - E2E', () => {
  test('Bazi: i18n 切换 + 表单提交触发埋点', async ({ page }) => {
    // 中文页面
    await page.goto('/zh/analysis/bazi');
    await dismissAgeOverlay(page);

    await expect(page.getByRole('heading', { name: '八字分析' })).toBeVisible();

    // 清空历史埋点
    await page.evaluate(() => {
      (window as any).__qiflow_events = [];
    });

    await page.locator('input[name="name"]').fill('测试用户');
    await page.locator('input[name="birth"]').fill('1990-01-01 08:08');
    await page.getByRole('button', { name: '开始计算' }).click();

    // 等待 form_submit 埋点
    await page.waitForFunction(() => {
      // @ts-ignore
      return (
        Array.isArray(window.__qiflow_events) &&
        window.__qiflow_events.some(
          (e: any) =>
            e.name === 'form_submit' && e.properties?.module === 'bazi'
        )
      );
    });

    // 成功或失败任一
    const outcome = await page.evaluate(() => {
      // @ts-ignore
      const events = window.__qiflow_events || [];
      const ok = events.some(
        (e: any) => e.name === 'form_success' && e.properties?.module === 'bazi'
      );
      const err = events.some(
        (e: any) => e.name === 'form_error' && e.properties?.module === 'bazi'
      );
      return { ok, err };
    });
    expect(outcome.ok || outcome.err).toBeTruthy();

    // 英文页面（i18n 切换）
    await page.goto('/en/analysis/bazi');
    await dismissAgeOverlay(page);
    await expect(
      page.getByRole('heading', { name: 'Bazi Analysis' })
    ).toBeVisible();
  });

  test('Xuankong: 表单提交触发埋点', async ({ page }) => {
    await page.goto('/zh/analysis/xuankong');
    await dismissAgeOverlay(page);

    await expect(page.getByRole('heading', { name: '玄空飞星' })).toBeVisible();

    await page.evaluate(() => {
      (window as any).__qiflow_events = [];
    });

    await page.locator('input[name="address"]').fill('上海市某地址');
    await page.locator('input[name="facing"]').fill('180');
    await page.getByRole('button', { name: '开始分析' }).click();

    await page.waitForFunction(() => {
      // @ts-ignore
      return (
        Array.isArray(window.__qiflow_events) &&
        window.__qiflow_events.some(
          (e: any) =>
            e.name === 'form_submit' && e.properties?.module === 'xuankong'
        )
      );
    });
  });
});

// ============= 追加测试：校验 UX 四态与 i18n 占位 =============

test.describe('QiFlow Forms - 校验与四态', () => {
  test('Bazi：Incomplete 时出现 Limited 面板，提交按钮禁用', async ({
    page,
  }) => {
    await page.goto('/zh/analysis/bazi');
    await dismissAgeOverlay(page);
    await page.locator('input[name="name"]').click();
    await page.locator('input[name="name"]').fill('张三');
    await expect(
      page.getByRole('button', { name: /前往补齐必填项|Fix|补齐/ })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /开始计算|提交|Submit/ })
    ).toBeDisabled();
  });

  test('Bazi：Empty/Error/Timeout 四态模拟 + 文案精确值', async ({ page }) => {
    await page.goto('/zh/analysis/bazi?ui=empty');
    await dismissAgeOverlay(page);
    await expect(page.getByRole('status')).toBeVisible();

    await page.goto('/zh/analysis/bazi?ui=error');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('输入无效')).toBeVisible();
    await expect(page.getByText('发生错误，请检查信息后重试。')).toBeVisible();

    await page.goto('/zh/analysis/bazi?ui=timeout');
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByText('请求超时')).toBeVisible();
    await expect(page.getByText('操作耗时过长，请稍后再试。')).toBeVisible();
  });

  test('Xuankong：Incomplete 时出现 Limited 面板，提交按钮禁用', async ({
    page,
  }) => {
    await page.goto('/zh/analysis/xuankong');
    await dismissAgeOverlay(page);
    await page.locator('#xuankong-address').click();
    await page.locator('#xuankong-address').fill('上海市静安区XX路');
    await expect(
      page.getByRole('button', { name: /前往补齐必填项|Fix|补齐/ })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /开始分析|提交|Submit/ })
    ).toBeDisabled();
  });

  test('Xuankong：Empty/Error/Timeout 四态模拟 + 文案精确值', async ({
    page,
  }) => {
    await page.goto('/zh/analysis/xuankong?ui=empty');
    await dismissAgeOverlay(page);
    await expect(page.getByRole('status')).toBeVisible();

    await page.goto('/zh/analysis/xuankong?ui=error');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('输入无效')).toBeVisible();
    await expect(page.getByText('发生错误，请检查信息后重试。')).toBeVisible();

    await page.goto('/zh/analysis/xuankong?ui=timeout');
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByText('请求超时')).toBeVisible();
    await expect(page.getByText('操作耗时过长，请稍后再试。')).toBeVisible();
  });
});

test.describe('QiFlow i18n - 占位与提交文案', () => {
  test('Bazi：跨语言占位与提交按钮（精确值）', async ({ page }) => {
    await page.goto('/zh/analysis/bazi');
    await dismissAgeOverlay(page);
    const zhName = await page
      .locator('input[name="name"]')
      .getAttribute('placeholder');
    expect(zhName).toBeTruthy();

    await page.goto('/en/analysis/bazi');
    await dismissAgeOverlay(page);
    const enName = await page
      .locator('input[name="name"]')
      .getAttribute('placeholder');
    expect(enName).toBeTruthy();

    expect(zhName).not.toEqual(enName);

    const zhBtnText = await await page
      .goto('/zh/analysis/bazi')
      .then(() => page.getByRole('button', { name: '开始计算' }).innerText());
    expect(zhBtnText).toEqual('开始计算');

    await page.goto('/en/analysis/bazi');
    await dismissAgeOverlay(page);
    const enBtnText = await page
      .getByRole('button', { name: 'Calculate' })
      .innerText();
    expect(enBtnText).toEqual('Calculate');
  });

  test('Xuankong：精确占位与提交按钮（zh/en）', async ({ page }) => {
    // zh
    await page.goto('/zh/analysis/xuankong');
    await dismissAgeOverlay(page);
    const zhAddress = await page
      .locator('#xuankong-address')
      .getAttribute('placeholder');
    const zhFacing = await page
      .locator('#xuankong-facing')
      .getAttribute('placeholder');
    expect(zhAddress).toEqual('地址');
    expect(zhFacing).toEqual('朝向（度）');
    await expect(page.getByRole('button', { name: '开始分析' })).toBeVisible();

    // en
    await page.goto('/en/analysis/xuankong');
    await dismissAgeOverlay(page);
    const enAddress = await page
      .locator('#xuankong-address')
      .getAttribute('placeholder');
    const enFacing = await page
      .locator('#xuankong-facing')
      .getAttribute('placeholder');
    expect(enAddress).toEqual('Address');
    expect(enFacing).toEqual('Facing (deg)');
    await expect(page.getByRole('button', { name: 'Analyze' })).toBeVisible();
  });

  test('Bazi：精确校验 placeholder（zh/en）与性别默认显示', async ({
    page,
  }) => {
    // zh
    await page.goto('/zh/analysis/bazi');
    await dismissAgeOverlay(page);
    const zhName = await page
      .locator('input[name="name"]')
      .getAttribute('placeholder');
    const zhBirth = await page
      .locator('#bazi-birth')
      .getAttribute('placeholder');
    expect(zhName).toEqual('姓名');
    expect(zhBirth).toEqual('出生日期 1990-01-01 08:08');
    // 性别触发器文本（默认男）
    const zhGender = await page.locator('#bazi-gender').innerText();
    expect(zhGender).toContain('男');

    // en
    await page.goto('/en/analysis/bazi');
    await dismissAgeOverlay(page);
    const enName = await page
      .locator('input[name="name"]')
      .getAttribute('placeholder');
    const enBirth = await page
      .locator('#bazi-birth')
      .getAttribute('placeholder');
    expect(enName).toEqual('Name');
    expect(enBirth).toEqual('Birth Datetime 1990-01-01 08:08');
    const enGender = await page.locator('#bazi-gender').innerText();
    expect(enGender).toContain('Male');
  });

  test('States：Limited/Error/Timeout 文案精确值（zh/en）', async ({
    page,
  }) => {
    // zh limited
    await page.goto('/zh/analysis/bazi');
    await dismissAgeOverlay(page);
    await page.locator('input[name="name"]').fill('张三');
    await expect(page.getByText('建议补充信息')).toBeVisible();
    await expect(page.getByText('请补全必要字段以继续。')).toBeVisible();

    // en limited
    await page.goto('/en/analysis/bazi');
    await dismissAgeOverlay(page);
    await page.locator('input[name="name"]').fill('John');
    await expect(page.getByText('More information recommended')).toBeVisible();
    await expect(
      page.getByText('Please provide the required fields to proceed.')
    ).toBeVisible();

    // en error / timeout via ui
    await page.goto('/en/analysis/bazi?ui=error');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText('Invalid input')).toBeVisible();
    await expect(
      page.getByText(
        'Something went wrong. Please check the information and try again.'
      )
    ).toBeVisible();

    await page.goto('/en/analysis/bazi?ui=timeout');
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByText('Request timeout')).toBeVisible();
    await expect(
      page.getByText('The operation took too long. Please try again later.')
    ).toBeVisible();
  });
});
