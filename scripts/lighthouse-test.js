/**
 * Lighthouse性能测试脚本
 * 测试网站性能、可访问性、最佳实践、SEO和PWA
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Lighthouse性能测试\n');
console.log('================================\n');

// 检查是否安装了lighthouse
try {
  execSync('npx --no-install lighthouse --version', { stdio: 'ignore' });
} catch {
  console.log('⚠️  Lighthouse未安装。正在安装...');
  console.log('运行: npm install -g lighthouse\n');
  console.log('或使用Chrome DevTools的Lighthouse面板进行测试。\n');

  console.log('📝 手动测试步骤：');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 打开Chrome浏览器');
  console.log('3. 访问 http://localhost:3000');
  console.log('4. 打开DevTools (F12)');
  console.log('5. 切换到Lighthouse标签');
  console.log('6. 点击"Generate report"');
  console.log('\n期望分数：');
  console.log('- 性能: 85+');
  console.log('- 可访问性: 90+');
  console.log('- 最佳实践: 90+');
  console.log('- SEO: 90+');
  console.log('- PWA: 通过基础检查');
  process.exit(0);
}

// 测试配置
const testUrl = 'http://localhost:3000';
const outputDir = path.join(__dirname, '..', 'lighthouse-reports');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputPath = path.join(outputDir, `report-${timestamp}`);

// 创建报告目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`🔍 测试URL: ${testUrl}`);
console.log(`📁 报告路径: ${outputPath}\n`);

// Lighthouse测试配置
const config = {
  desktop: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
      },
    },
  },
  mobile: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        disabled: false,
      },
    },
  },
};

// 运行测试
function runLighthouse(device = 'mobile') {
  console.log(`\n📱 运行${device === 'mobile' ? '移动端' : '桌面端'}测试...`);

  const configFile = path.join(outputDir, `config-${device}.json`);
  fs.writeFileSync(configFile, JSON.stringify(config[device], null, 2));

  const cmd =
    `npx lighthouse ${testUrl} ` +
    `--config-path="${configFile}" ` +
    '--output=html ' +
    `--output-path="${outputPath}-${device}.html" ` +
    `--chrome-flags="--headless" ` +
    '--quiet';

  try {
    const output = execSync(cmd, { encoding: 'utf-8' });

    // 解析分数
    const scores = output.match(/\d+/g);
    if (scores && scores.length >= 4) {
      console.log('\n📊 测试结果：');
      console.log(`- 性能: ${scores[0]}/100`);
      console.log(`- 可访问性: ${scores[1]}/100`);
      console.log(`- 最佳实践: ${scores[2]}/100`);
      console.log(`- SEO: ${scores[3]}/100`);
      if (scores[4]) {
        console.log(`- PWA: ${scores[4]}/100`);
      }
    }

    console.log(`\n✅ 报告已保存: ${outputPath}-${device}.html`);
    return true;
  } catch (error) {
    console.error(`\n❌ ${device}测试失败:`, error.message);
    return false;
  }
}

// 检查服务器是否运行
console.log('🔍 检查开发服务器...');
const checkServer = () => {
  try {
    execSync(`curl -I ${testUrl}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

if (!checkServer()) {
  console.log('\n⚠️  开发服务器未运行！');
  console.log('请先启动服务器: npm run dev\n');
  console.log('然后在新终端运行: node scripts/lighthouse-test.js\n');
  process.exit(1);
}

console.log('✅ 服务器正在运行');

// 运行测试
const mobileSuccess = runLighthouse('mobile');
const desktopSuccess = runLighthouse('desktop');

// 总结
console.log('\n================================');
console.log('📊 测试完成总结\n');

if (mobileSuccess && desktopSuccess) {
  console.log('✅ 所有测试完成！');
  console.log(`\n📁 查看报告: ${outputDir}`);
  console.log('\n💡 优化建议：');
  console.log('- 性能 < 85分: 检查首屏加载、代码分割、图片优化');
  console.log('- 可访问性 < 90分: 检查ARIA标签、颜色对比度、键盘导航');
  console.log('- SEO < 90分: 检查meta标签、结构化数据、sitemap');
  console.log('- PWA未通过: 检查manifest、service worker、HTTPS');
} else {
  console.log('⚠️  部分测试失败，请检查错误信息');
}

console.log('\n================================');
