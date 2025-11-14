import { expect, test } from '@playwright/test';

test.describe('玄空风水分析 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问工具页面
    await page.goto('/zh-CN/tools/compass-analysis');
  });

  test('完整分析流程 - 从输入到结果展示', async ({ page }) => {
    // 1. 输入房屋信息
    await test.step('输入房屋基本信息', async () => {
      // 输入地址
      await page.fill('input[name="address"]', '北京市朝阳区建国路88号');

      // 选择朝向
      await page.selectOption('select[name="facing"]', '180'); // 坐北朝南

      // 输入建造年份
      await page.fill('input[name="buildYear"]', '2020');

      // 输入楼层
      await page.fill('input[name="floor"]', '8');

      // 上传户型图（可选）
      // const fileInput = await page.locator('input[type="file"]');
      // await fileInput.setInputFiles('path/to/floorplan.jpg');
    });

    // 2. 选择分析选项
    await test.step('配置分析选项', async () => {
      // 勾选三大格局分析
      await page.check('input[name="includeQixingdajie"]');
      await page.check('input[name="includeLingzheng"]');
      await page.check('input[name="includeChengmenjue"]');

      // 添加环境信息（可选）
      const addEnvButton = await page.locator(
        'button:has-text("添加环境信息")'
      );
      if (await addEnvButton.isVisible()) {
        await addEnvButton.click();
        await page.fill('input[name="waterPositions"]', '1,2,3');
        await page.fill('input[name="mountainPositions"]', '5,6,7');
      }
    });

    // 3. 提交分析
    await test.step('提交分析请求', async () => {
      const analyzeButton = await page.locator('button:has-text("开始分析")');
      await analyzeButton.click();

      // 等待加载完成
      await page.waitForSelector('[data-testid="analysis-result"]', {
        timeout: 30000,
      });
    });

    // 4. 验证分析结果
    await test.step('验证基础分析结果', async () => {
      // 检查飞星盘显示
      const flyingStarPlate = await page.locator(
        '[data-testid="flying-star-plate"]'
      );
      await expect(flyingStarPlate).toBeVisible();

      // 检查九宫格
      const palaces = await page.locator(
        '[data-testid="palace-grid"] .palace-cell'
      );
      await expect(palaces).toHaveCount(9);

      // 检查评分
      const scoreElement = await page.locator('[data-testid="overall-score"]');
      await expect(scoreElement).toBeVisible();
      const scoreText = await scoreElement.textContent();
      expect(scoreText).toMatch(/\d+/); // 包含数字
    });

    // 5. 验证三大格局分析
    await test.step('验证七星打劫分析', async () => {
      const qixingSection = await page.locator(
        '[data-testid="qixing-dajie-analysis"]'
      );

      if (await qixingSection.isVisible()) {
        // 检查是否成格
        const statusBadge = await qixingSection.locator('.badge');
        await expect(statusBadge).toBeVisible();

        // 检查评分进度条
        const progressBar = await qixingSection.locator('[role="progressbar"]');
        await expect(progressBar).toBeVisible();

        // 检查激活条件
        const requirements = await qixingSection.locator(
          '[data-testid="activation-requirements"]'
        );
        if (await requirements.isVisible()) {
          const items = await requirements.locator('li');
          expect(await items.count()).toBeGreaterThan(0);
        }
      }
    });

    await test.step('验证零正理论分析', async () => {
      const lingzhengSection = await page.locator(
        '[data-testid="lingzheng-analysis"]'
      );

      if (await lingzhengSection.isVisible()) {
        // 检查零神位和正神位
        const zeroGodPosition = await lingzhengSection.locator(
          '[data-testid="zero-god-position"]'
        );
        await expect(zeroGodPosition).toBeVisible();

        const positiveGodPosition = await lingzhengSection.locator(
          '[data-testid="positive-god-position"]'
        );
        await expect(positiveGodPosition).toBeVisible();

        // 检查零正颠倒警告（如果存在）
        const reverseWarning =
          await lingzhengSection.locator('.alert-destructive');
        if (await reverseWarning.isVisible()) {
          const warningText = await reverseWarning.textContent();
          expect(warningText).toContain('零正颠倒');
        }
      }
    });

    await test.step('验证城门诀分析', async () => {
      const chengmenSection = await page.locator(
        '[data-testid="chengmenjue-analysis"]'
      );

      if (await chengmenSection.isVisible()) {
        // 检查城门位置
        const positions = await chengmenSection.locator(
          '[data-testid="chengmen-positions"]'
        );
        if (await positions.isVisible()) {
          const positionItems = await positions.locator('.position-item');
          expect(await positionItems.count()).toBeGreaterThan(0);
        }

        // 检查催旺方法
        const methods = await chengmenSection.locator(
          '[data-testid="activation-methods"]'
        );
        if (await methods.isVisible()) {
          const methodItems = await methods.locator('li');
          expect(await methodItems.count()).toBeGreaterThan(0);
        }
      }
    });

    // 6. 验证化解方案
    await test.step('验证化解方案展示', async () => {
      const remedySection = await page.locator(
        '[data-testid="remedy-solutions"]'
      );

      if (await remedySection.isVisible()) {
        // 检查是否有方案卡片
        const solutionCards = await remedySection.locator(
          '[data-testid="solution-card"]'
        );
        expect(await solutionCards.count()).toBeGreaterThan(0);

        // 点击查看详情
        const firstCard = solutionCards.first();
        const detailButton = await firstCard.locator(
          'button:has-text("查看详情")'
        );
        if (await detailButton.isVisible()) {
          await detailButton.click();

          // 验证详情弹窗或页面
          await page.waitForSelector('[data-testid="solution-detail"]', {
            timeout: 5000,
          });
        }
      }
    });

    // 7. 验证导出功能
    await test.step('验证导出功能', async () => {
      const exportButton = await page.locator('button:has-text("导出报告")');

      if (await exportButton.isVisible()) {
        // 点击导出按钮
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportButton.click(),
        ]);

        // 验证下载的文件
        expect(download.suggestedFilename()).toMatch(/风水分析报告.*\.pdf/);
      }
    });
  });

  test('API 响应时间测试', async ({ page }) => {
    // 监听API请求
    const apiResponses: number[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('/api/xuankong/comprehensive-analysis')) {
        const timing = response.request().timing();
        if (timing) {
          apiResponses.push(timing.responseEnd);
        }
      }
    });

    // 执行分析
    await page.goto('/zh-CN/tools/compass-analysis');
    await page.fill('input[name="facing"]', '180');
    await page.fill('input[name="buildYear"]', '2020');

    const startTime = Date.now();
    await page.click('button:has-text("开始分析")');
    await page.waitForSelector('[data-testid="analysis-result"]', {
      timeout: 10000,
    });
    const endTime = Date.now();

    // 验证响应时间
    const totalTime = endTime - startTime;
    console.log(`API响应总时间: ${totalTime}ms`);

    // 期望响应时间小于2秒
    expect(totalTime).toBeLessThan(2000);

    // 如果收集到具体的API时间，验证P95
    if (apiResponses.length > 0) {
      apiResponses.sort((a, b) => a - b);
      const p95Index = Math.floor(apiResponses.length * 0.95);
      const p95Time = apiResponses[p95Index];
      console.log(`API P95响应时间: ${p95Time}ms`);
      expect(p95Time).toBeLessThan(500);
    }
  });

  test('移动端响应式测试', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/zh-CN/tools/compass-analysis');

    // 验证移动端布局
    await test.step('验证移动端布局', async () => {
      // 检查导航菜单是否为汉堡菜单
      const mobileMenu = await page.locator(
        '[data-testid="mobile-menu-button"]'
      );
      await expect(mobileMenu).toBeVisible();

      // 检查表单是否为单列布局
      const formFields = await page.locator('.form-field');
      for (const field of await formFields.all()) {
        const box = await field.boundingBox();
        if (box) {
          // 移动端应该是全宽
          expect(box.width).toBeGreaterThan(300);
        }
      }
    });

    // 测试触摸交互
    await test.step('测试触摸交互', async () => {
      // 模拟触摸滑动
      await page.locator('body').tap({ position: { x: 180, y: 300 } });

      // 测试下拉选择
      const select = await page.locator('select[name="facing"]');
      await select.tap();
      await page.waitForTimeout(500);

      // 验证选项可见
      const options = await page.locator('option');
      expect(await options.count()).toBeGreaterThan(0);
    });
  });

  test('错误处理测试', async ({ page }) => {
    await page.goto('/zh-CN/tools/compass-analysis');

    // 测试无效输入
    await test.step('测试无效输入', async () => {
      // 输入无效年份
      await page.fill('input[name="buildYear"]', '3000');
      await page.click('button:has-text("开始分析")');

      // 应该显示错误提示
      const errorMessage = await page.locator('[role="alert"]');
      await expect(errorMessage).toBeVisible();
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('年份');
    });

    // 测试网络错误
    await test.step('测试网络错误处理', async () => {
      // 模拟网络错误
      await page.route('**/api/xuankong/**', (route) => {
        route.abort('failed');
      });

      await page.fill('input[name="buildYear"]', '2020');
      await page.fill('input[name="facing"]', '180');
      await page.click('button:has-text("开始分析")');

      // 应该显示网络错误提示
      const networkError = await page.locator('[data-testid="network-error"]');
      await expect(networkError).toBeVisible({ timeout: 5000 });
    });
  });

  test('性能基准测试', async ({ page }) => {
    // 收集性能指标
    const metrics = await page.evaluate(() => {
      return JSON.stringify(window.performance.timing);
    });

    const timing = JSON.parse(metrics);
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const domReadyTime =
      timing.domContentLoadedEventEnd - timing.navigationStart;
    const renderTime = timing.domComplete - timing.domLoading;

    console.log('性能指标:');
    console.log(`页面加载时间: ${pageLoadTime}ms`);
    console.log(`DOM就绪时间: ${domReadyTime}ms`);
    console.log(`渲染时间: ${renderTime}ms`);

    // 验证性能指标
    expect(pageLoadTime).toBeLessThan(3000); // 页面加载小于3秒
    expect(domReadyTime).toBeLessThan(2000); // DOM就绪小于2秒
    expect(renderTime).toBeLessThan(1000); // 渲染小于1秒

    // 测试Core Web Vitals
    const coreWebVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};

          for (const entry of entries) {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = (entry as any).processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              metrics.cls = (metrics.cls || 0) + (entry as any).value;
            }
          }

          resolve(metrics);
        }).observe({
          entryTypes: [
            'largest-contentful-paint',
            'first-input',
            'layout-shift',
          ],
        });
      });
    });

    console.log('Core Web Vitals:', coreWebVitals);
  });
});
