import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '..', 'src', 'locales', 'zh-TW.json');

console.log('🔧 修复 zh-TW.json 文件...');

try {
  // 读取文件内容
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 找到第 786 行的多余闭合括号
  const lines = content.split('\n');
  
  // 查找问题行（第 787 行，索引 786）
  if (lines[786] && lines[786].trim() === '}') {
    console.log('✅ 找到多余的闭合括号在第 787 行');
    
    // 移除多余的闭合括号
    lines[786] = '';
    
    // 重新组合内容
    content = lines.join('\n');
    
    // 验证修复后的 JSON
    try {
      JSON.parse(content);
      console.log('✅ JSON 语法验证通过');
      
      // 写回文件
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ 文件修复完成');
      
    } catch (parseError) {
      console.error('❌ 修复后 JSON 仍然无效:', parseError.message);
      
      // 如果还有问题，尝试更复杂的修复
      console.log('🔧 尝试更复杂的修复...');
      
      // 找到第一个完整的 JSON 对象结束位置
      let braceCount = 0;
      let lastValidBrace = -1;
      
      for (let i = 0; i < content.length; i++) {
        if (content[i] === '{') {
          braceCount++;
        } else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastValidBrace = i;
            break;
          }
        }
      }
      
      if (lastValidBrace > 0) {
        // 截取到第一个完整 JSON 对象结束
        const fixedContent = content.substring(0, lastValidBrace + 1);
        
        try {
          JSON.parse(fixedContent);
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log('✅ 使用截断方法修复成功');
        } catch (e) {
          console.error('❌ 截断修复也失败:', e.message);
        }
      }
    }
    
  } else {
    console.log('❌ 未找到预期的多余闭合括号');
  }
  
} catch (error) {
  console.error('❌ 修复过程中出错:', error.message);
}

