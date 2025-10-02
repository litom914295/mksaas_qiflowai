import http from 'http';

const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

async function testLanguage(lang) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3000/${lang}`, (res) => {
      console.log(`${lang}: ${res.statusCode} ${res.statusMessage}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log(`${lang}: ERROR - ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`${lang}: TIMEOUT`);
      req.destroy();
      resolve(false);
    });
  });
}

async function testAllLanguages() {
  console.log('测试所有语言页面...\n');
  
  const results = [];
  for (const lang of languages) {
    const success = await testLanguage(lang);
    results.push({ lang, success });
  }
  
  console.log('\n测试结果:');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  results.forEach(({ lang, success }) => {
    console.log(`${lang}: ${success ? '✅ 成功' : '❌ 失败'}`);
  });
  
  console.log(`\n总计: ${successCount}/${totalCount} 个语言页面正常工作`);
  
  if (successCount === totalCount) {
    console.log('🎉 所有语言页面都正常工作！');
  } else {
    console.log('⚠️  部分语言页面存在问题，请检查控制台错误信息。');
  }
}

testAllLanguages().catch(console.error);
