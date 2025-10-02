"use strict";
/**
 * QiFlow AI - 智能分析请求检测模块
 *
 * 提供高精度的八字风水分析请求识别功能
 * 支持自然语言处理、多种日期格式识别和请求类型分类
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATE_PATTERNS = exports.INTENT_PATTERNS = exports.FENGSHUI_KEYWORDS = exports.BAZI_KEYWORDS = exports.AnalysisType = void 0;
exports.detectAnalysisRequest = detectAnalysisRequest;
exports.extractAnalysisParams = extractAnalysisParams;
exports.isAnalysisRequest = isAnalysisRequest;
var AnalysisType;
(function (AnalysisType) {
    AnalysisType["BAZI"] = "bazi";
    AnalysisType["FENGSHUI"] = "fengshui";
    AnalysisType["COMBINED"] = "combined";
    AnalysisType["NONE"] = "none"; // 非分析请求
})(AnalysisType || (exports.AnalysisType = AnalysisType = {}));
/**
 * 八字相关关键词库
 */
const BAZI_KEYWORDS = {
    // 核心术语
    core: ['八字', '命理', '命盘', '四柱', '批命', '算命', '占卜', '排盘'],
    // 天干地支
    stems: ['天干', '地支', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    branches: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
    // 十神系统
    tenGods: ['十神', '正官', '偏官', '七杀', '正印', '偏印', '枭神', '比肩', '劫财', '食神', '伤官', '正财', '偏财'],
    // 神煞
    godEvil: ['用神', '喜神', '忌神', '仇神', '闲神', '文昌', '天乙贵人', '桃花', '驿马'],
    // 大运流年
    luck: ['大运', '流年', '流月', '流日', '运势', '运程', '转运'],
    // 五行
    elements: ['五行', '金', '木', '水', '火', '土', '五行缺', '五行旺'],
    // 出生相关
    birth: ['出生', '生辰', '生日', '出世', '诞生', '农历', '阳历', '公历', '时辰'],
    // 性别
    gender: ['男', '女', '性别', '男命', '女命', '乾造', '坤造']
};
exports.BAZI_KEYWORDS = BAZI_KEYWORDS;
/**
 * 风水相关关键词库
 */
const FENGSHUI_KEYWORDS = {
    // 核心术语
    core: ['风水', '堪舆', '玄空', '飞星', '九宫', '罗盘', '指南针'],
    // 方位朝向
    direction: ['朝向', '坐向', '山向', '坐山', '向山', '东', '南', '西', '北',
        '东南', '西南', '东北', '西北', '子山午向', '癸山丁向'],
    // 房屋布局
    house: ['房屋', '房子', '住宅', '家宅', '居所', '户型', '布局', '格局',
        '客厅', '卧室', '厨房', '卫生间', '阳台', '大门', '窗户'],
    // 飞星相关
    flyingStar: ['九星', '一白', '二黑', '三碧', '四绿', '五黄', '六白', '七赤', '八白', '九紫',
        '贪狼', '巨门', '禄存', '文曲', '廉贞', '武曲', '破军', '左辅', '右弼'],
    // 煞气化解
    sha: ['煞气', '化煞', '破财', '是非', '官非', '病符', '凶星', '吉星'],
    // 风水物品
    items: ['风水摆件', '水晶', '葫芦', '铜钱', '八卦镜', '五帝钱', '貔貅', '龙龟'],
    // 建造时间
    period: ['元运', '九运', '八运', '七运', '建造', '建成', '落成', '入伙']
};
exports.FENGSHUI_KEYWORDS = FENGSHUI_KEYWORDS;
/**
 * 自然语言意图模式
 */
const INTENT_PATTERNS = [
    // 直接请求
    /帮我[看算测].*[命运势]/,
    /[算看]一?[下算].*[我的]?[命八字运]/,
    /分析.*[我的]?[命理八字运势]/,
    /[给帮].*[算看排].*[八字命盘]/,
    // 询问类
    /我的?[命运势].*怎么?样/,
    /[什么怎]么?样?.*运[势程]/,
    /适合.*什么.*[工作职业行业]/,
    /[财运感情事业].*如何/,
    // 风水相关
    /[看测].*风水/,
    /房[子屋].*朝向.*[好不]/,
    /[家房].*布局.*[好合适]/,
    /怎么?[样么]?[摆布]置/,
    // 综合分析
    /全面分析/,
    /详细[分析解读]/,
    /深入[了解剖析]/
];
exports.INTENT_PATTERNS = INTENT_PATTERNS;
/**
 * 日期格式检测正则
 */
const DATE_PATTERNS = [
    // 标准格式
    /\d{4}[-年/]\d{1,2}[-月/]\d{1,2}[-日号]/, // 2024-03-15 或 2024年3月15日
    /\d{4}[-/]\d{1,2}[-/]\d{1,2}/, // 2024/03/15 或 2024-03-15
    // 中文格式
    /[一二三四五六七八九零〇]{4}年.*月.*[日号]/, // 二〇二四年三月十五日
    /(农历|阴历|阳历|公历).*(年|月|日)/, // 农历1990年正月初五
    // 口语格式
    /\d{2,4}年\d{1,2}月\d{1,2}/, // 90年3月15
    /\d+年前/, // 30年前
    /[上下]午\d{1,2}[点时]/, // 下午3点
    // 时辰格式
    /[子丑寅卯辰巳午未申酉戌亥]时/, // 子时
    /\d{1,2}:\d{2}/, // 14:30
    /\d{1,2}点\d{0,2}分?/ // 14点30分
];
exports.DATE_PATTERNS = DATE_PATTERNS;
/**
 * 排除模式 - 这些模式表明不是分析请求
 */
const EXCLUSION_PATTERNS = [
    // 系统消息
    /^(你好|您好|欢迎|谢谢|再见|拜拜)/,
    /^(是的?|好的?|可以|没问题|明白|了解)/,
    /^(不|否|没有|不是|不要|不用)/,
    // AI自我介绍
    /我是.*AI/,
    /QiFlow.*大师/,
    /正在.*[思考分析处理]/,
    /根据您提供的/,
    // 纯咨询性问题
    /^什么是[八字风水命理]/,
    /^[八字风水]是什么/,
    /^怎么[看学用].*[八字风水]/,
    /^[八字风水].*原理/,
    // 闲聊
    /^今天.*天气/,
    /^现在几点/,
    /^你[是谁|叫什么|会什么]/
];
/**
 * 提取日期信息
 */
function extractDateInfo(message) {
    const foundFormats = [];
    for (const pattern of DATE_PATTERNS) {
        const matches = message.match(pattern);
        if (matches) {
            foundFormats.push(matches[0]);
        }
    }
    return foundFormats;
}
/**
 * 提取关键词
 */
function extractKeywords(message, keywordDict) {
    const foundKeywords = [];
    for (const category in keywordDict) {
        for (const keyword of keywordDict[category]) {
            if (message.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        }
    }
    return [...new Set(foundKeywords)]; // 去重
}
/**
 * 检测意图模式
 */
function detectIntentPatterns(message) {
    return INTENT_PATTERNS.some(pattern => pattern.test(message));
}
/**
 * 检测排除模式
 */
function isExcludedPattern(message) {
    return EXCLUSION_PATTERNS.some(pattern => pattern.test(message));
}
/**
 * 计算置信度
 */
function calculateConfidence(keywordCount, hasDateInfo, hasIntentPattern, messageLength) {
    let confidence = 0;
    // 关键词权重 (0-40%)
    if (keywordCount > 0) {
        confidence += Math.min(keywordCount * 10, 40);
    }
    // 日期信息权重 (0-30%)
    if (hasDateInfo) {
        confidence += 30;
    }
    // 意图模式权重 (0-20%)
    if (hasIntentPattern) {
        confidence += 20;
    }
    // 消息长度权重 (0-10%)
    if (messageLength > 10 && messageLength < 500) {
        confidence += 10;
    }
    else if (messageLength >= 500) {
        confidence += 5;
    }
    return Math.min(confidence, 100) / 100; // 归一化到 0-1
}
/**
 * 判断分析类型
 */
function determineAnalysisType(baziKeywords, fengshuiKeywords, extractedInfo) {
    // 更精确的判断逻辑
    const hasBaziContent = baziKeywords.length > 0 || extractedInfo.hasBirthDate || extractedInfo.hasGender;
    const hasFengshuiContent = fengshuiKeywords.length > 0 || extractedInfo.hasHouseInfo;
    // 如果同时有明确的八字和风水内容，才判断为综合分析
    if (hasBaziContent && hasFengshuiContent) {
        // 但是如果只是提到了"房"或"家"这样的词，而没有其他八字信息，应该是纯风水
        const hasStrongBaziSignal = extractedInfo.hasBirthDate ||
            extractedInfo.hasGender ||
            baziKeywords.some(k => ['八字', '命理', '命盘', '四柱', '出生', '生辰'].includes(k));
        if (!hasStrongBaziSignal) {
            return AnalysisType.FENGSHUI;
        }
        return AnalysisType.COMBINED;
    }
    else if (hasFengshuiContent) {
        return AnalysisType.FENGSHUI;
    }
    else if (hasBaziContent) {
        return AnalysisType.BAZI;
    }
    return AnalysisType.NONE;
}
/**
 * 智能分析请求检测主函数
 */
function detectAnalysisRequest(message) {
    // 基础验证
    if (!message || message.trim().length < 2) {
        return {
            isAnalysisRequest: false,
            analysisType: AnalysisType.NONE,
            confidence: 0,
            extractedInfo: {
                hasBirthDate: false,
                hasGender: false,
                hasLocation: false,
                hasHouseInfo: false,
                dateFormats: [],
                keywords: []
            },
            reason: '消息太短或为空'
        };
    }
    const normalizedMessage = message.toLowerCase().trim();
    // 检查排除模式
    if (isExcludedPattern(normalizedMessage)) {
        return {
            isAnalysisRequest: false,
            analysisType: AnalysisType.NONE,
            confidence: 0,
            extractedInfo: {
                hasBirthDate: false,
                hasGender: false,
                hasLocation: false,
                hasHouseInfo: false,
                dateFormats: [],
                keywords: []
            },
            reason: '匹配到排除模式（系统消息或闲聊）'
        };
    }
    // 提取信息
    const baziKeywords = extractKeywords(normalizedMessage, BAZI_KEYWORDS);
    const fengshuiKeywords = extractKeywords(normalizedMessage, FENGSHUI_KEYWORDS);
    const allKeywords = [...baziKeywords, ...fengshuiKeywords];
    const dateFormats = extractDateInfo(normalizedMessage);
    const hasIntentPattern = detectIntentPatterns(normalizedMessage);
    // 检测特定信息
    const hasBirthDate = dateFormats.length > 0 || /\d{4}.*\d{1,2}.*\d{1,2}/.test(message);
    const hasGender = /[男女]|性别|乾造|坤造/.test(normalizedMessage);
    const hasLocation = /[省市区县镇村]|北京|上海|广州|深圳/.test(normalizedMessage);
    const hasHouseInfo = /[东西南北]向|朝向|坐向|房[子屋]|户型/.test(normalizedMessage);
    // 构建提取信息
    const extractedInfo = {
        hasBirthDate,
        hasGender,
        hasLocation,
        hasHouseInfo,
        dateFormats,
        keywords: allKeywords
    };
    // 计算置信度
    const confidence = calculateConfidence(allKeywords.length, hasBirthDate, hasIntentPattern, message.length);
    // 判断分析类型
    const analysisType = determineAnalysisType(baziKeywords, fengshuiKeywords, extractedInfo);
    // 判断是否为分析请求
    const isAnalysisRequest = confidence >= 0.3 || // 置信度超过30%
        (allKeywords.length >= 2) || // 包含2个以上关键词
        (hasBirthDate && hasGender) || // 有出生信息和性别
        hasIntentPattern; // 匹配意图模式
    // 生成判断理由
    let reason = '';
    if (isAnalysisRequest) {
        const reasons = [];
        if (allKeywords.length > 0)
            reasons.push(`包含关键词: ${allKeywords.slice(0, 3).join(', ')}`);
        if (hasBirthDate)
            reasons.push('包含出生日期信息');
        if (hasIntentPattern)
            reasons.push('匹配分析意图模式');
        if (hasHouseInfo)
            reasons.push('包含房屋信息');
        reason = reasons.join('; ');
    }
    else {
        reason = '未检测到明确的分析请求特征';
    }
    // 输出调试日志
    if (process.env.NODE_ENV === 'development') {
        console.log('[分析检测] 详细分析结果:', {
            message: message.substring(0, 100),
            isAnalysisRequest,
            analysisType,
            confidence: (confidence * 100).toFixed(1) + '%',
            baziKeywords: baziKeywords.length,
            fengshuiKeywords: fengshuiKeywords.length,
            hasDateInfo: hasBirthDate,
            hasIntentPattern,
            reason
        });
    }
    return {
        isAnalysisRequest,
        analysisType,
        confidence,
        extractedInfo,
        reason
    };
}
/**
 * 提取分析参数
 */
function extractAnalysisParams(message) {
    const params = {};
    // 提取日期
    const yearMatch = message.match(/(\d{4})年/);
    const monthMatch = message.match(/(\d{1,2})月/);
    const dayMatch = message.match(/(\d{1,2})[日号]/);
    const hourMatch = message.match(/(\d{1,2})[时点]|([子丑寅卯辰巳午未申酉戌亥])时/);
    if (yearMatch || monthMatch || dayMatch) {
        params.birthDate = {
            year: yearMatch ? parseInt(yearMatch[1]) : undefined,
            month: monthMatch ? parseInt(monthMatch[1]) : undefined,
            day: dayMatch ? parseInt(dayMatch[1]) : undefined
        };
        if (hourMatch) {
            if (hourMatch[1]) {
                params.birthDate.hour = parseInt(hourMatch[1]);
            }
            else if (hourMatch[2]) {
                // 转换时辰为小时
                const branchHours = {
                    '子': 0, '丑': 2, '寅': 4, '卯': 6, '辰': 8, '巳': 10,
                    '午': 12, '未': 14, '申': 16, '酉': 18, '戌': 20, '亥': 22
                };
                params.birthDate.hour = branchHours[hourMatch[2]];
            }
        }
    }
    // 提取性别
    if (/男|乾造/.test(message)) {
        params.gender = 'male';
    }
    else if (/女|坤造/.test(message)) {
        params.gender = 'female';
    }
    // 提取地点
    const locationMatch = message.match(/在([^，。,\s]{2,10})[出生]/);
    if (locationMatch) {
        params.location = locationMatch[1];
    }
    // 提取房屋朝向
    const directionMatch = message.match(/([子癸丑艮寅甲卯乙辰巽巳丙午丁未坤申庚酉辛戌乾亥壬])山([子癸丑艮寅甲卯乙辰巽巳丙午丁未坤申庚酉辛戌乾亥壬])向/);
    if (directionMatch) {
        params.houseInfo = {
            direction: `${directionMatch[1]}山${directionMatch[2]}向`
        };
    }
    // 提取元运
    const periodMatch = message.match(/([七八九])运/);
    if (periodMatch) {
        const periodMap = { '七': 7, '八': 8, '九': 9 };
        params.houseInfo = params.houseInfo || {};
        params.houseInfo.period = periodMap[periodMatch[1]];
    }
    return params;
}
/**
 * 导出便捷函数 - 用于向后兼容
 */
function isAnalysisRequest(message) {
    const result = detectAnalysisRequest(message);
    return result.isAnalysisRequest;
}
