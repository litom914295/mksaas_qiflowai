#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const BATCH_SIZE = 8;
const MAX_BATCHES = 8;
const ATTIC_DIR = '.attic';
const DATE_STAMP = new Date().toISOString().split('T')[0];
const ATTIC_TARGET_DIR = path.join(ATTIC_DIR, DATE_STAMP);

// 白名单和黑名单模式
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
    /content\/.*\.mdx?$/i,
    /\.source\//,
    /mksaas\//,
    /\.attic\//
];

function findCandidateFiles() {
    console.log('🔍 搜索候选文件...');
    
    // 获取git跟踪的所有文件
    let gitFiles = [];
    try {
        const gitOutput = execSync('git ls-files', { encoding: 'utf8' });
        gitFiles = gitOutput.split('\n').filter(f => f.trim());
    } catch (error) {
        console.error('无法获取git文件列表:', error.message);
        return [];
    }

    // 过滤候选文件
    const candidates = gitFiles.filter(file => {
        // 检查白名单
        const inWhitelist = whitelistPatterns.some(pattern => pattern.test(file));
        if (!inWhitelist) return false;
        
        // 检查黑名单
        const inDenylist = denylistPatterns.some(pattern => pattern.test(file));
        if (inDenylist) return false;
        
        // 检查文件是否存在
        if (!fs.existsSync(file)) return false;
        
        return true;
    });

    console.log(`找到 ${candidates.length} 个候选文件`);
    return candidates;
}

function moveBatch(files) {
    console.log(`📦 移动 ${files.length} 个文件...`);
    
    // 确保目标目录存在
    if (!fs.existsSync(ATTIC_TARGET_DIR)) {
        fs.mkdirSync(ATTIC_TARGET_DIR, { recursive: true });
    }
    
    let moveCount = 0;
    for (const file of files) {
        try {
            const targetPath = path.join(ATTIC_TARGET_DIR, file);
            const targetDir = path.dirname(targetPath);
            
            // 确保目标目录存在
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            // 使用git mv移动文件
            execSync(`git mv "${file}" "${targetPath}"`, { stdio: 'ignore' });
            moveCount++;
            
        } catch (error) {
            console.warn(`⚠️  移动文件失败 ${file}: ${error.message}`);
        }
    }
    
    console.log(`✅ 成功移动 ${moveCount} 个文件`);
    return moveCount;
}

function quickImportCheck() {
    console.log('🔍 执行快速导入检查...');
    try {
        execSync('npm run type-check', { stdio: 'ignore', timeout: 30000 });
        console.log('✅ 类型检查通过');
        return true;
    } catch (error) {
        console.warn('⚠️  类型检查失败');
        return false;
    }
}

async function main() {
    console.log('🚀 开始批量清理文件...');
    
    // 查找候选文件
    const candidates = findCandidateFiles();
    if (candidates.length === 0) {
        console.log('没有找到候选文件，退出');
        return;
    }

    // 分批处理
    let totalMoved = 0;
    let batchCount = 0;
    
    for (let i = 0; i < candidates.length && batchCount < MAX_BATCHES; i += BATCH_SIZE) {
        batchCount++;
        console.log(`\n📊 处理批次 ${batchCount}/${MAX_BATCHES}`);
        
        const batch = candidates.slice(i, i + BATCH_SIZE);
        const movedCount = moveBatch(batch);
        
        if (movedCount > 0) {
            totalMoved += movedCount;
            
            // 快速验证
            if (!quickImportCheck()) {
                console.log('❌ 验证失败，停止处理');
                break;
            }
        }
        
        // 短暂暂停
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎉 清理完成！总共移动了 ${totalMoved} 个文件到 ${ATTIC_TARGET_DIR}`);
}

if (require.main === module) {
    main().catch(console.error);
}