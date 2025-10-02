# 八字报告生成系统 - 完整安装指南

## 📦 必需的npm依赖包

### 核心依赖包
```bash
# PDF生成相关
npm install jspdf html2canvas

# ID生成 (通常已通过其他依赖安装)
npm install nanoid

# 类型定义 (开发依赖)
npm install --save-dev @types/jspdf
```

### 可选增强包
```bash
# 二维码生成 (可选，当前使用在线服务)
npm install qrcode

# 图片处理优化 (可选)
npm install canvas

# 字体支持 (可选，用于PDF中文显示)
npm install jspdf-autotable
```

## 🔧 安装步骤

1. **基础安装**
   ```bash
   cd your-project-directory
   npm install jspdf html2canvas nanoid
   npm install --save-dev @types/jspdf
   ```

2. **验证安装**
   ```bash
   npm list jspdf html2canvas nanoid
   ```

3. **如果遇到安装问题**
   ```bash
   # 清理缓存
   npm cache clean --force
   
   # 使用cnpm (国内用户)
   npm install -g cnpm --registry=https://registry.npm.taobao.org
   cnpm install jspdf html2canvas nanoid
   ```

## 🌐 浏览器兼容性要求

### 支持的浏览器
- **Chrome 88+** (推荐)
- **Firefox 85+** (推荐)  
- **Safari 14+** (推荐)
- **Edge 88+** (推荐)

### 必需的浏览器API
- **Canvas API** - 用于HTML转图片
- **Clipboard API** - 用于复制分享链接
- **Blob API** - 用于文件下载
- **LocalStorage** - 用于分享记录存储

## ⚙️ 环境配置

### Next.js 配置
确保 `next.config.js` 支持客户端包：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 其他配置
  webpack: (config, { isServer }) => {
    // 客户端包配置
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

### TypeScript 配置
确保 `tsconfig.json` 包含正确的类型：

```json
{
  "compilerOptions": {
    "types": ["node", "jspdf"],
    "lib": ["dom", "dom.iterable", "es6"],
    // ... 其他配置
  }
}
```

## 🔍 依赖包详细说明

| 包名 | 版本 | 用途 | 必需性 |
|------|------|------|--------|
| `jspdf` | ^2.5.1+ | PDF文档生成 | 必需 |
| `html2canvas` | ^1.4.1+ | HTML转Canvas图片 | 必需 |
| `nanoid` | ^3.3.0+ | 生成分享ID | 必需 |
| `@types/jspdf` | ^2.3.0+ | jsPDF类型定义 | 开发必需 |
| `qrcode` | ^1.5.3+ | 二维码生成 | 可选 |

## 🚨 已知问题和解决方案

### 1. PDF中文字体问题
**问题**: PDF中中文显示为方框
**解决**: 使用支持中文的字体

```javascript
// 在pdf-export-service.ts中添加
import { jsPDF } from 'jspdf';

// 添加中文字体支持
pdf.addFont('path/to/chinese-font.ttf', 'chinese', 'normal');
pdf.setFont('chinese');
```

### 2. Canvas跨域问题
**问题**: html2canvas报CORS错误
**解决**: 配置图片跨域处理

```javascript
// 在html2canvas选项中添加
const options = {
  useCORS: true,
  allowTaint: true,
  foreignObjectRendering: false
};
```

### 3. 大尺寸PDF性能问题
**问题**: 生成大PDF时浏览器卡顿
**解决**: 分段处理和进度显示

```javascript
// 分段处理大内容
const processInChunks = async (element) => {
  // 实现分段截图和拼接
};
```

## ✅ 安装验证清单

- [ ] `npm list jspdf` 显示已安装版本
- [ ] `npm list html2canvas` 显示已安装版本  
- [ ] `npm list nanoid` 显示已安装版本
- [ ] TypeScript编译无错误
- [ ] 浏览器控制台无导入错误
- [ ] PDF导出功能可正常使用
- [ ] 分享链接生成正常
- [ ] 移动端兼容性正常

完成以上安装步骤后，八字报告生成系统即可正常运行！