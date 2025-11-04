/**
 * PWA图标生成器
 * 生成192x192和512x512的应用图标
 */

const fs = require('fs');
const path = require('path');

// SVG模板 - QiFlow AI品牌图标
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="${size}" height="${size}" fill="#0b0b0b"/>
  
  <!-- 渐变定义 -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 中心圆形 -->
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" fill="url(#gradient)" opacity="0.2"/>
  
  <!-- Q字母设计 -->
  <g transform="translate(${size / 2}, ${size / 2})">
    <!-- 外圈 -->
    <circle cx="0" cy="0" r="${size / 4}" fill="none" stroke="url(#gradient)" stroke-width="${size / 20}"/>
    <!-- 尾部 -->
    <line x1="${size / 6}" y1="${size / 6}" x2="${size / 4}" y2="${size / 4}" 
          stroke="url(#gradient)" stroke-width="${size / 20}" stroke-linecap="round"/>
  </g>
  
  <!-- QiFlow文字 -->
  <text x="${size / 2}" y="${size * 0.75}" 
        font-family="Arial, sans-serif" 
        font-size="${size / 8}" 
        font-weight="bold"
        fill="white" 
        text-anchor="middle">QiFlow</text>
  
  <!-- AI标记 -->
  <text x="${size * 0.85}" y="${size * 0.9}" 
        font-family="Arial, sans-serif" 
        font-size="${size / 12}" 
        fill="#0ea5e9" 
        text-anchor="end">AI</text>
</svg>
`;

// 创建public目录（如果不存在）
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// 生成图标文件
const sizes = [192, 512];
sizes.forEach((size) => {
  const svgContent = svgTemplate(size);
  const fileName = `icon-${size}.svg`;
  const filePath = path.join(publicDir, fileName);

  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ 已生成 ${fileName}`);
});

// 同时创建一个favicon.svg
const faviconSvg = svgTemplate(32);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
console.log('✅ 已生成 favicon.svg');

console.log('\n注意：生成的是SVG格式图标，现代浏览器都支持。');
console.log('如需PNG格式，可以使用在线工具或图像处理软件转换。');
