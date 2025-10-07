/**
 * 智能输入解析服务
 * 自动识别用户提供的生辰八字、房屋信息等，并触发相应分析
 */

export interface BirthInfo {
  date: string;        // YYYY-MM-DD
  time: string;        // HH:mm
  gender?: 'male' | 'female';
  location?: string;
}

export interface HouseInfo {
  facing: number;      // 朝向度数
  mountain: number;    // 坐山度数
  buildYear?: number;  // 建造年份
  location?: string;
}

export interface ParsedInput {
  type: 'bazi' | 'fengshui' | 'unknown';
  data: BirthInfo | HouseInfo | null;
  confidence: number;  // 0-1, 解析置信度
  missingFields: string[];
}

/**
 * 智能输入解析器
 */
export class InputParser {
  /**
   * 解析用户输入，识别是否包含生辰八字信息
   */
  static parseBirthInfo(text: string): BirthInfo | null {
    // 移除所有空格
    const cleanText = text.replace(/\s+/g, '');
    
    // 正则匹配日期格式
    const datePatterns = [
      /(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})[日号]?/,  // 1990年1月1日
      /(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})/,
      /(\d{4})\-(\d{2})\-(\d{2})/,  // 1990-01-01
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,  // 1990/1/1
    ];
    
    // 时间匹配
    const timePatterns = [
      /(\d{1,2})[点时:](\d{2})[分]?/,  // 12点30分, 12:30
      /(\d{1,2})[点时]([半整])/,  // 12点半, 12点整
      /(\d{1,2})时/,  // 12时
    ];
    
    let date: string | null = null;
    let time: string | null = null;
    let gender: 'male' | 'female' | undefined;
    
    // 解析日期
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        date = `${year}-${month}-${day}`;
        break;
      }
    }
    
    // 解析时间
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const hour = match[1].padStart(2, '0');
        let minute = '00';
        
        if (match[2] === '半') {
          minute = '30';
        } else if (match[2] === '整') {
          minute = '00';
        } else if (match[2]) {
          minute = match[2].padStart(2, '0');
        }
        
        time = `${hour}:${minute}`;
        break;
      }
    }
    
    // 解析性别
    if (text.includes('男') || text.includes('♂')) {
      gender = 'male';
    } else if (text.includes('女') || text.includes('♀')) {
      gender = 'female';
    }
    
    // 提取地点（简单识别城市名）
    const locationMatch = text.match(/([\u4e00-\u9fa5]{2,10}[市县区])/);
    const location = locationMatch ? locationMatch[1] : undefined;
    
    if (date) {
      return {
        date,
        time: time || '12:00',  // 默认中午
        gender,
        location,
      };
    }
    
    return null;
  }
  
  /**
   * 解析房屋风水信息
   */
  static parseHouseInfo(text: string): HouseInfo | null {
    const cleanText = text.replace(/\s+/g, '');
    
    // 朝向度数
    const facingMatch = cleanText.match(/朝向?[：:]?(\d{1,3})度?/);
    const mountainMatch = cleanText.match(/坐山?[：:]?(\d{1,3})度?/);
    
    // 年份
    const yearMatch = cleanText.match(/(\d{4})年[建造入住]/);
    
    // 地点
    const locationMatch = cleanText.match(/([\u4e00-\u9fa5]{2,10}[市县区])/);
    
    if (facingMatch || mountainMatch) {
      return {
        facing: facingMatch ? parseInt(facingMatch[1]) : 0,
        mountain: mountainMatch ? parseInt(mountainMatch[1]) : 0,
        buildYear: yearMatch ? parseInt(yearMatch[1]) : undefined,
        location: locationMatch ? locationMatch[1] : undefined,
      };
    }
    
    return null;
  }
  
  /**
   * 智能解析用户输入
   */
  static parseInput(text: string): ParsedInput {
    // 尝试解析生辰八字
    const birthInfo = this.parseBirthInfo(text);
    if (birthInfo) {
      const missingFields: string[] = [];
      let confidence = 0.8;
      
      if (!birthInfo.gender) {
        missingFields.push('性别');
        confidence -= 0.1;
      }
      
      if (birthInfo.time === '12:00') {
        missingFields.push('出生时间');
        confidence -= 0.2;
      }
      
      return {
        type: 'bazi',
        data: birthInfo,
        confidence,
        missingFields,
      };
    }
    
    // 尝试解析房屋信息
    const houseInfo = this.parseHouseInfo(text);
    if (houseInfo) {
      const missingFields: string[] = [];
      let confidence = 0.7;
      
      if (!houseInfo.mountain && houseInfo.facing) {
        missingFields.push('坐山度数');
        confidence -= 0.1;
      }
      
      if (!houseInfo.buildYear) {
        missingFields.push('建造年份');
        confidence -= 0.1;
      }
      
      return {
        type: 'fengshui',
        data: houseInfo,
        confidence,
        missingFields,
      };
    }
    
    return {
      type: 'unknown',
      data: null,
      confidence: 0,
      missingFields: [],
    };
  }
  
  /**
   * 生成补充信息提示
   */
  static generateSupplementPrompt(parsed: ParsedInput): string {
    if (parsed.type === 'unknown') {
      return '';
    }
    
    if (parsed.missingFields.length === 0) {
      return '信息已完整，正在为您进行分析...';
    }
    
    const fields = parsed.missingFields.join('、');
    return `我已收到部分信息，还需要您提供：**${fields}**\n\n请补充这些信息，我将立即为您进行${parsed.type === 'bazi' ? '八字' : '风水'}分析。`;
  }
}

/**
 * 测试用例
 */
export const TEST_CASES = {
  bazi: [
    '我是1990年1月1日12点30分出生的男生，在北京',
    '1985-03-15 08:00 女',
    '出生：1992年5月20日晚上8点，性别女',
  ],
  fengshui: [
    '我家朝向是180度，坐山0度，2015年建造的',
    '房屋朝向南方，坐北朝南，上海',
  ],
};
