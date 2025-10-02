# 🛠️ 八字报告系统故障排除指南

## 🚨 常见问题诊断和解决

### 1. 📦 依赖包相关问题

#### 问题 1.1: PDF导出功能不工作
```
错误信息: "jsPDF is not defined" 或 "html2canvas is not defined"
```

**诊断步骤:**
```bash
# 检查包是否已安装
npm list jspdf html2canvas

# 检查包版本
npm info jspdf version
npm info html2canvas version
```

**解决方案:**
```bash
# 重新安装依赖包
npm uninstall jspdf html2canvas
npm install jspdf@^2.5.1 html2canvas@^1.4.1

# 清理缓存后重试
npm cache clean --force
npm install
```

#### 问题 1.2: TypeScript类型错误
```
错误信息: "Cannot find module 'jspdf' or its corresponding type declarations"
```

**解决方案:**
```bash
# 安装类型定义
npm install --save-dev @types/jspdf

# 如果仍有问题，手动声明类型
echo "declare module 'jspdf';" >> src/types/global.d.ts
```

### 2. 🌐 浏览器兼容性问题

#### 问题 2.1: Safari中PDF导出失败
**症状:** Safari浏览器无法正常生成PDF

**解决方案:**
```javascript
// 在pdf-export-service.ts中添加Safari特殊处理
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
  // Safari特殊配置
  const canvas = await html2canvas(container, {
    scale: 1, // 降低缩放比例
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: false
  });
}
```

#### 问题 2.2: 移动端Canvas尺寸问题
**症状:** 移动设备上生成的PDF内容被截断

**解决方案:**
```javascript
// 添加移动端检测和特殊处理
const isMobile = window.innerWidth <= 768;

const canvas = await html2canvas(container, {
  width: isMobile ? 800 : 1200,
  height: isMobile ? 'auto' : 'auto',
  scale: isMobile ? 0.8 : 1.0
});
```

### 3. 🔗 分享功能问题

#### 问题 3.1: 分享链接无法访问
**症状:** 点击分享链接显示"未找到报告"

**诊断步骤:**
```javascript
// 在浏览器控制台检查LocalStorage
console.log(localStorage.getItem('qiflow_shared_reports'));

// 检查链接格式
console.log('当前URL:', window.location.href);
```

**解决方案:**
```javascript
// 方案1: 清理过期数据
localStorage.removeItem('qiflow_shared_reports');

// 方案2: 手动修复数据格式
const reports = JSON.parse(localStorage.getItem('qiflow_shared_reports') || '[]');
const fixedReports = reports.map(report => ({
  ...report,
  createdAt: new Date(report.createdAt),
  expiresAt: report.expiresAt ? new Date(report.expiresAt) : undefined
}));
localStorage.setItem('qiflow_shared_reports', JSON.stringify(fixedReports));
```

#### 问题 3.2: 二维码无法生成
**症状:** 二维码显示空白或加载失败

**解决方案:**
```javascript
// 替换二维码服务
const generateQRCode = (url) => {
  // 备选服务列表
  const services = [
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
    `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(url)}`,
    `https://qr.io/qr.png?url=${encodeURIComponent(url)}`
  ];
  
  return services[0]; // 使用第一个可用服务
};
```

### 4. 📊 性能相关问题

#### 问题 4.1: PDF生成时间过长
**症状:** PDF导出超过30秒或浏览器卡死

**诊断方法:**
```javascript
// 添加性能监控
console.time('PDF Generation');
const startTime = performance.now();

// PDF生成代码...

const endTime = performance.now();
console.timeEnd('PDF Generation');
console.log(`PDF生成耗时: ${endTime - startTime} 毫秒`);
```

**优化方案:**
```javascript
// 1. 减少Canvas分辨率
const canvas = await html2canvas(container, {
  scale: 0.5, // 降低分辨率
  quality: 0.8 // 降低质量
});

// 2. 分页处理大内容
const processInChunks = async (element) => {
  const chunks = Array.from(element.children);
  const pdf = new jsPDF();
  
  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) pdf.addPage();
    const canvas = await html2canvas(chunks[i]);
    // 处理单个chunk
  }
};
```

#### 问题 4.2: 内存泄漏
**症状:** 长时间使用后浏览器变慢

**解决方案:**
```javascript
// 及时清理Canvas和Blob对象
const cleanup = () => {
  // 清理Canvas
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // 清理Blob URLs
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
  
  // 清理DOM引用
  if (tempContainer && tempContainer.parentNode) {
    tempContainer.parentNode.removeChild(tempContainer);
  }
};
```

### 5. 💾 数据相关问题

#### 问题 5.1: 八字分析数据缺失
**症状:** 报告生成时显示"数据不完整"

**诊断步骤:**
```javascript
// 检查分析数据结构
console.log('BaZi Analysis Result:', baziAnalysis);
console.log('Pillars:', baziAnalysis?.pillars);
console.log('Elements:', baziAnalysis?.fiveElements || baziAnalysis?.elements);
```

**解决方案:**
```javascript
// 添加数据验证和默认值
const validateBaziData = (data) => {
  return {
    pillars: data?.pillars || {
      year: { chinese: '甲子', heavenlyStem: '甲', earthlyBranch: '子' },
      month: { chinese: '乙丑', heavenlyStem: '乙', earthlyBranch: '丑' },
      day: { chinese: '丙寅', heavenlyStem: '丙', earthlyBranch: '寅' },
      hour: { chinese: '丁卯', heavenlyStem: '丁', earthlyBranch: '卯' }
    },
    fiveElements: data?.fiveElements || data?.elements || {
      wood: 0, fire: 0, earth: 0, metal: 0, water: 0
    },
    favorableElements: data?.favorableElements || {
      primary: ['wood'], secondary: [], unfavorable: []
    }
  };
};
```

#### 问题 5.2: 大运数据异常
**症状:** 大运分析显示空白或错误信息

**解决方案:**
```javascript
// 添加大运数据验证
const validateLuckPillars = (luckPillars) => {
  if (!Array.isArray(luckPillars) || luckPillars.length === 0) {
    // 生成默认大运数据
    return generateDefaultLuckPillars();
  }
  
  return luckPillars.filter(lp => 
    lp.pillar && 
    lp.pillar.heavenlyStem && 
    lp.pillar.earthlyBranch &&
    lp.tenGodRelation
  );
};
```

### 6. 🎨 界面显示问题

#### 问题 6.1: CSS样式不正确
**症状:** 报告格式混乱或样式丢失

**解决方案:**
```css
/* 添加CSS重置规则 */
.report-container * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 确保字体正确加载 */
.report-container {
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  line-height: 1.6;
}

/* 打印样式优化 */
@media print {
  .report-container {
    background: white !important;
    color: black !important;
  }
}
```

#### 问题 6.2: 响应式布局问题
**症状:** 移动端显示异常

**解决方案:**
```css
/* 修复移动端响应式问题 */
@media (max-width: 768px) {
  .pillars-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .aspect-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    flex-direction: column;
  }
}
```

## 🔍 调试工具和技巧

### 开发者工具使用
```javascript
// 1. 启用详细日志
localStorage.setItem('debug_report_system', 'true');

// 2. 监控性能
performance.mark('report-start');
// ... 报告生成代码
performance.mark('report-end');
performance.measure('report-generation', 'report-start', 'report-end');

// 3. 检查内存使用
console.log('内存使用:', performance.memory);
```

### 网络问题调试
```javascript
// 检查网络状态
navigator.onLine; // true/false

// 监听网络变化
window.addEventListener('online', () => {
  console.log('网络已连接');
});

window.addEventListener('offline', () => {
  console.log('网络已断开');
});
```

## 📞 技术支持联系方式

### 快速自检清单
- [ ] npm包是否正确安装？
- [ ] 浏览器控制台是否有错误？
- [ ] 网络连接是否正常？
- [ ] 浏览器版本是否支持？
- [ ] LocalStorage是否可用？

### 错误报告模板
```
**环境信息：**
- 浏览器：[Chrome/Firefox/Safari] 版本号
- 操作系统：[Windows/macOS/Linux]
- 设备类型：[桌面/移动]

**错误描述：**
[详细描述问题现象]

**重现步骤：**
1. 第一步操作
2. 第二步操作
3. ...

**错误截图：**
[附上相关截图]

**控制台错误：**
[粘贴浏览器控制台错误信息]
```

### 紧急处理方案
如果遇到严重问题无法解决：

1. **临时解决方案**
   - 使用HTML导出替代PDF导出
   - 手动复制报告内容替代分享功能
   - 使用简化版报告模板

2. **备份方案**
   - 将分析结果保存为JSON格式
   - 使用浏览器打印功能生成PDF
   - 通过邮件发送报告内容

3. **回滚策略**
   - 恢复到上一个可工作版本
   - 禁用有问题的功能模块
   - 使用基础版报告生成器

通过以上故障排除指南，应该能够解决大部分常见问题。如遇到特殊情况，请根据具体错误信息进行针对性处理。🛠️