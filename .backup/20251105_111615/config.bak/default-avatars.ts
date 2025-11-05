/**
 * 默认头像配置 - 中国玄学元素主题
 */

export type AvatarCategory = 'tiangan' | 'dizhi' | 'bagua' | 'wuxing' | 'shengxiao';

export interface DefaultAvatar {
  id: string;
  category: AvatarCategory;
  name: string;
  symbol: string;
  color: string;
  description: string;
}

/**
 * 天干系列（10个）
 */
const tianganAvatars: DefaultAvatar[] = [
  { id: 'jia', category: 'tiangan', name: '甲', symbol: '甲', color: 'bg-gradient-to-br from-green-500 to-emerald-600', description: '木之始，生发之象' },
  { id: 'yi', category: 'tiangan', name: '乙', symbol: '乙', color: 'bg-gradient-to-br from-green-400 to-teal-500', description: '木之柔，曲直之性' },
  { id: 'bing', category: 'tiangan', name: '丙', symbol: '丙', color: 'bg-gradient-to-br from-red-500 to-orange-600', description: '火之阳，炎上之象' },
  { id: 'ding', category: 'tiangan', name: '丁', symbol: '丁', color: 'bg-gradient-to-br from-red-400 to-pink-500', description: '火之阴，文明之光' },
  { id: 'wu', category: 'tiangan', name: '戊', symbol: '戊', color: 'bg-gradient-to-br from-yellow-600 to-amber-700', description: '土之阳，厚载之德' },
  { id: 'ji', category: 'tiangan', name: '己', symbol: '己', color: 'bg-gradient-to-br from-yellow-500 to-orange-500', description: '土之阴，稼穑之功' },
  { id: 'geng', category: 'tiangan', name: '庚', symbol: '庚', color: 'bg-gradient-to-br from-gray-400 to-slate-500', description: '金之阳，刚健之质' },
  { id: 'xin', category: 'tiangan', name: '辛', symbol: '辛', color: 'bg-gradient-to-br from-gray-300 to-zinc-400', description: '金之阴，革新之力' },
  { id: 'ren', category: 'tiangan', name: '壬', symbol: '壬', color: 'bg-gradient-to-br from-blue-600 to-cyan-700', description: '水之阳，润下之性' },
  { id: 'gui', category: 'tiangan', name: '癸', symbol: '癸', color: 'bg-gradient-to-br from-blue-500 to-indigo-600', description: '水之阴，至柔之道' },
];

/**
 * 地支系列（12个）
 */
const dizhiAvatars: DefaultAvatar[] = [
  { id: 'zi', category: 'dizhi', name: '子', symbol: '子', color: 'bg-gradient-to-br from-blue-600 to-indigo-700', description: '子水，冬季第一月' },
  { id: 'chou', category: 'dizhi', name: '丑', symbol: '丑', color: 'bg-gradient-to-br from-yellow-700 to-amber-800', description: '丑土，冬季第二月' },
  { id: 'yin', category: 'dizhi', name: '寅', symbol: '寅', color: 'bg-gradient-to-br from-green-600 to-emerald-700', description: '寅木，春季第一月' },
  { id: 'mao', category: 'dizhi', name: '卯', symbol: '卯', color: 'bg-gradient-to-br from-green-500 to-teal-600', description: '卯木，春季第二月' },
  { id: 'chen', category: 'dizhi', name: '辰', symbol: '辰', color: 'bg-gradient-to-br from-yellow-600 to-orange-700', description: '辰土，春季第三月' },
  { id: 'si', category: 'dizhi', name: '巳', symbol: '巳', color: 'bg-gradient-to-br from-red-500 to-orange-600', description: '巳火，夏季第一月' },
  { id: 'wu-dizhi', category: 'dizhi', name: '午', symbol: '午', color: 'bg-gradient-to-br from-red-600 to-pink-700', description: '午火，夏季第二月' },
  { id: 'wei', category: 'dizhi', name: '未', symbol: '未', color: 'bg-gradient-to-br from-yellow-500 to-amber-600', description: '未土，夏季第三月' },
  { id: 'shen', category: 'dizhi', name: '申', symbol: '申', color: 'bg-gradient-to-br from-gray-500 to-slate-600', description: '申金，秋季第一月' },
  { id: 'you', category: 'dizhi', name: '酉', symbol: '酉', color: 'bg-gradient-to-br from-gray-400 to-zinc-500', description: '酉金，秋季第二月' },
  { id: 'xu', category: 'dizhi', name: '戌', symbol: '戌', color: 'bg-gradient-to-br from-yellow-600 to-red-700', description: '戌土，秋季第三月' },
  { id: 'hai', category: 'dizhi', name: '亥', symbol: '亥', color: 'bg-gradient-to-br from-blue-700 to-cyan-800', description: '亥水，冬季第三月' },
];

/**
 * 八卦系列（8个）
 */
const baguaAvatars: DefaultAvatar[] = [
  { id: 'qian', category: 'bagua', name: '乾', symbol: '☰', color: 'bg-gradient-to-br from-yellow-400 to-amber-500', description: '天，刚健中正' },
  { id: 'kun', category: 'bagua', name: '坤', symbol: '☷', color: 'bg-gradient-to-br from-yellow-700 to-amber-800', description: '地，厚德载物' },
  { id: 'zhen', category: 'bagua', name: '震', symbol: '☳', color: 'bg-gradient-to-br from-green-500 to-emerald-600', description: '雷，动而健' },
  { id: 'xun', category: 'bagua', name: '巽', symbol: '☴', color: 'bg-gradient-to-br from-green-400 to-teal-500', description: '风，入而顺' },
  { id: 'kan', category: 'bagua', name: '坎', symbol: '☵', color: 'bg-gradient-to-br from-blue-600 to-cyan-700', description: '水，险而陷' },
  { id: 'li', category: 'bagua', name: '离', symbol: '☲', color: 'bg-gradient-to-br from-red-500 to-orange-600', description: '火，丽而明' },
  { id: 'gen', category: 'bagua', name: '艮', symbol: '☶', color: 'bg-gradient-to-br from-yellow-600 to-orange-700', description: '山，止而静' },
  { id: 'dui', category: 'bagua', name: '兑', symbol: '☱', color: 'bg-gradient-to-br from-gray-300 to-zinc-400', description: '泽，悦而说' },
];

/**
 * 五行系列（5个）
 */
const wuxingAvatars: DefaultAvatar[] = [
  { id: 'jin', category: 'wuxing', name: '金', symbol: '金', color: 'bg-gradient-to-br from-gray-300 to-yellow-400', description: '肃杀收敛，义之象' },
  { id: 'mu', category: 'wuxing', name: '木', symbol: '木', color: 'bg-gradient-to-br from-green-500 to-emerald-600', description: '生长舒展，仁之象' },
  { id: 'shui', category: 'wuxing', name: '水', symbol: '水', color: 'bg-gradient-to-br from-blue-600 to-cyan-700', description: '滋润向下，智之象' },
  { id: 'huo', category: 'wuxing', name: '火', symbol: '火', color: 'bg-gradient-to-br from-red-500 to-orange-600', description: '炎热向上，礼之象' },
  { id: 'tu', category: 'wuxing', name: '土', symbol: '土', color: 'bg-gradient-to-br from-yellow-600 to-amber-700', description: '承载生化，信之象' },
];

/**
 * 生肖系列（12个）
 */
const shengxiaoAvatars: DefaultAvatar[] = [
  { id: 'rat', category: 'shengxiao', name: '鼠', symbol: '🐭', color: 'bg-gradient-to-br from-gray-600 to-slate-700', description: '机智灵活，子时之属' },
  { id: 'ox', category: 'shengxiao', name: '牛', symbol: '🐮', color: 'bg-gradient-to-br from-yellow-700 to-amber-800', description: '勤劳踏实，丑时之属' },
  { id: 'tiger', category: 'shengxiao', name: '虎', symbol: '🐯', color: 'bg-gradient-to-br from-orange-600 to-red-700', description: '威武雄壮，寅时之属' },
  { id: 'rabbit', category: 'shengxiao', name: '兔', symbol: '🐰', color: 'bg-gradient-to-br from-pink-400 to-rose-500', description: '温柔可爱，卯时之属' },
  { id: 'dragon', category: 'shengxiao', name: '龙', symbol: '🐲', color: 'bg-gradient-to-br from-blue-600 to-purple-700', description: '尊贵神圣，辰时之属' },
  { id: 'snake', category: 'shengxiao', name: '蛇', symbol: '🐍', color: 'bg-gradient-to-br from-green-700 to-emerald-800', description: '智慧冷静，巳时之属' },
  { id: 'horse', category: 'shengxiao', name: '马', symbol: '🐴', color: 'bg-gradient-to-br from-red-600 to-orange-700', description: '奔放热情，午时之属' },
  { id: 'goat', category: 'shengxiao', name: '羊', symbol: '🐑', color: 'bg-gradient-to-br from-gray-300 to-zinc-400', description: '温和善良，未时之属' },
  { id: 'monkey', category: 'shengxiao', name: '猴', symbol: '🐵', color: 'bg-gradient-to-br from-yellow-500 to-orange-600', description: '聪明机敏，申时之属' },
  { id: 'rooster', category: 'shengxiao', name: '鸡', symbol: '🐔', color: 'bg-gradient-to-br from-red-500 to-pink-600', description: '勤奋守时，酉时之属' },
  { id: 'dog', category: 'shengxiao', name: '狗', symbol: '🐶', color: 'bg-gradient-to-br from-yellow-600 to-amber-700', description: '忠诚可靠，戌时之属' },
  { id: 'pig', category: 'shengxiao', name: '猪', symbol: '🐷', color: 'bg-gradient-to-br from-pink-500 to-rose-600', description: '善良憨厚，亥时之属' },
];

/**
 * 所有默认头像集合
 */
export const defaultAvatars: Record<AvatarCategory, DefaultAvatar[]> = {
  tiangan: tianganAvatars,
  dizhi: dizhiAvatars,
  bagua: baguaAvatars,
  wuxing: wuxingAvatars,
  shengxiao: shengxiaoAvatars,
};

/**
 * 分类信息
 */
export const avatarCategories = {
  tiangan: { name: '天干', emoji: '✨', count: 10 },
  dizhi: { name: '地支', emoji: '🌙', count: 12 },
  bagua: { name: '八卦', emoji: '☯️', count: 8 },
  wuxing: { name: '五行', emoji: '🔥', count: 5 },
  shengxiao: { name: '生肖', emoji: '🐉', count: 12 },
};

/**
 * 获取所有头像（扁平化）
 */
export function getAllDefaultAvatars(): DefaultAvatar[] {
  return Object.values(defaultAvatars).flat();
}

/**
 * 根据ID获取头像
 */
export function getAvatarById(id: string): DefaultAvatar | undefined {
  return getAllDefaultAvatars().find(avatar => avatar.id === id);
}

/**
 * 生成头像SVG数据URL
 */
export function generateAvatarDataUrl(avatar: DefaultAvatar): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="grad-${avatar.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          ${getGradientStops(avatar.color)}
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad-${avatar.id})"/>
      <text 
        x="100" 
        y="120" 
        font-size="80" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle"
        font-family="serif"
        style="text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"
      >${avatar.symbol}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * 从Tailwind颜色类提取渐变色
 */
function getGradientStops(colorClass: string): string {
  // 简化版本，实际使用中可以更精确地提取颜色
  const colorMap: Record<string, { from: string; to: string }> = {
    'from-green-500': { from: '#22c55e', to: '#10b981' },
    'from-red-500': { from: '#ef4444', to: '#f97316' },
    'from-blue-500': { from: '#3b82f6', to: '#06b6d4' },
    'from-yellow-500': { from: '#eab308', to: '#f59e0b' },
    'from-gray-300': { from: '#d1d5db', to: '#fbbf24' },
    // 可以添加更多颜色映射
  };
  
  // 默认渐变
  return '<stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" /><stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />';
}
