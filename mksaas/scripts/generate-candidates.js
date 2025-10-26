#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const artifactsDir = process.argv[2] || 'mksaas';

async function generateCandidates() {
    console.log('生成候选清理文件...');
    
    // 读取knip报告
    let knipReport = {};
    try {
        const reportPath = path.join(artifactsDir, 'knip-report.json');
        const reportContent = fs.readFileSync(reportPath, 'utf8');
        knipReport = JSON.parse(reportContent);
    } catch (error) {
        console.log('无法读取knip报告，将使用空报告:', error.message);
    }
    
    // 白名单和黑名单
    const whitelistPatterns = [
        /^public\/.*\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
        /^components\/.*\.tsx?$/,
        /^src\/.*\.tsx?$/,
        /^app\/.*\.tsx?$/
    ];
    
    const denylistPatterns = [
        /node_modules/,
        /\.git/,
        /\.next/,
        /\.vscode/,
        /package\.json$/,
        /package-lock\.json$/,
        /next\.config\./,
        /tailwind\.config\./,
        /postcss\.config\./,
        /middleware\.ts$/,
        /layout\.tsx$/,
        /page\.tsx$/,
        /globals\.css$/,
        /error\.tsx$/,
        /loading\.tsx$/,
        /not-found\.tsx$/,
        /README\.md$/i,
        /\.env/,
        /tsconfig\.json$/,
        /\.gitignore$/,
        /content\/.*\.mdx?$/i,
        /\.source\//,
        /mksaas\//,
        /\.attic\//
    ];
    
    // 从knip报告提取候选文件
    let candidates = [];
    
    if (knipReport.files && Array.isArray(knipReport.files)) {
        candidates = candidates.concat(knipReport.files.map(f => f.replace(/^\.\//, '')));
    }
    
    if (knipReport.issues && Array.isArray(knipReport.issues)) {
        knipReport.issues.forEach(issue => {
            if (issue.files && Array.isArray(issue.files)) {
                candidates = candidates.concat(issue.files.map(f => f.replace(/^\.\//, '')));
            }
        });
    }
    
    // 过滤候选文件
    const filteredCandidates = candidates
        .filter(file => {
            // 检查是否在白名单中
            const inWhitelist = whitelistPatterns.some(pattern => pattern.test(file));
            if (!inWhitelist) return false;
            
            // 检查是否在黑名单中
            const inDenylist = denylistPatterns.some(pattern => pattern.test(file));
            if (inDenylist) return false;
            
            // 检查文件是否存在
            return fs.existsSync(file);
        })
        .filter((file, index, arr) => arr.indexOf(file) === index); // 去重
    
    // 保存候选文件
    const candidatesPath = path.join(artifactsDir, 'candidates.json');
    fs.writeFileSync(candidatesPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalFromKnip: candidates.length,
        filtered: filteredCandidates.length,
        files: filteredCandidates
    }, null, 2));
    
    console.log(`从knip报告中发现 ${candidates.length} 个候选文件`);
    console.log(`过滤后剩余 ${filteredCandidates.length} 个候选文件`);
    console.log(`候选文件已保存到: ${candidatesPath}`);
    
    return filteredCandidates;
}

if (require.main === module) {
    generateCandidates().catch(console.error);
}

module.exports = { generateCandidates };