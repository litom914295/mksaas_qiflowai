import { expect, test } from '@playwright/test';

async function dismissAgeOverlay(page) {
  const btn = page.getByText('我已年满18岁');
  try {
    if (await btn.isVisible({ timeout: 1500 })) await btn.click();
  } catch {}
}

async function gotoSignUp(page) {
  await page.goto('/zh-CN/sign-up');
  await dismissAgeOverlay(page);
  const visible = await page
    .locator('#email')
    .isVisible()
    .catch(() => false);
  if (!visible) {
    await page.goto('/zh-CN/sign-up');
    await dismissAgeOverlay(page);
  }
}

async function signUp(
  page,
  { name, email, password }: { name: string; email: string; password: string }
) {
  await gotoSignUp(page);
  await page.locator('#name').fill(name);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.getByRole('button', { name: '注册' }).click();
  // 等待首页或任意可见元素，给后端创建会话时间
  await page.waitForLoadState('networkidle');
}

test.describe('Growth Activation E2E', () => {
  test('登记推荐 → 业务完成 → 激活发放（幂等）', async ({ browser }) => {
    const emailA = `e2e.a.${Date.now()}@example.com`;
    const emailB = `e2e.b.${Date.now()}@example.com`;
    const password = 'Test12345!';

    // A 注册（推荐人）
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await signUp(pageA, { name: '推荐人A', email: emailA, password });

    // B 注册（被推荐人）
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await signUp(pageB, { name: '被推荐人B', email: emailB, password });

    // 测试辅助：在 test 环境下为 A 与 B 建立 pending 推荐关系
    const bindRes = await pageB.request.post('/api/test/referral/bind', {
      headers: { 'x-test-enable': 'true' },
      data: { referrerEmail: emailA, refereeEmail: emailB },
    });
    expect(bindRes.ok()).toBeTruthy();
    const bindJson = await bindRes.json();
    expect(bindJson?.success).toBeTruthy();

    // B 完成八字分析（qiflow/bazi）
    const baziRes = await pageB.request.post('/api/qiflow/bazi', {
      data: {
        name: '测试',
        birthDate: '1990-01-01T08:08:00',
        gender: 'male',
        timezone: 'Asia/Shanghai',
      },
    });
    expect(baziRes.ok()).toBeTruthy();
    const baziJson = await baziRes.json();
    expect(baziJson?.success).toBeTruthy();

    // B 完成玄空分析（qiflow/xuankong）
    const xkRes = await pageB.request.post('/api/qiflow/xuankong', {
      data: {
        address: '上海市静安区某处',
        direction: 180,
        houseType: 'apartment',
      },
    });
    expect(xkRes.ok()).toBeTruthy();
    const xkJson = await xkRes.json();
    expect(xkJson?.success).toBeTruthy();

    // 触发激活奖励发放（也可由上面逻辑自动触发，这里再次调用确保发放已完成）
    const act1 = await pageB.request.post('/api/referral/activate', {
      data: {},
    });
    expect(act1.ok()).toBeTruthy();
    const act1Json = await act1.json();
    expect(act1Json?.success).toBeTruthy();
    expect(act1Json?.data?.rewarded).toBeTruthy();

    // 幂等性：再次调用应仍然成功且保持 rewarded=true
    const act2 = await pageB.request.post('/api/referral/activate', {
      data: {},
    });
    expect(act2.ok()).toBeTruthy();
    const act2Json = await act2.json();
    expect(act2Json?.success).toBeTruthy();
    expect(act2Json?.data?.rewarded).toBeTruthy();

    await ctxA.close();
    await ctxB.close();
  });
});
