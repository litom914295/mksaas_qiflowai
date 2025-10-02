import { Locale } from './config';

// 专业风水术语翻译对照表
export interface FengshuiTerm {
  id: string;
  category: 'bazi' | 'fengshui' | 'compass' | 'elements' | 'stars' | 'directions';
  translations: Record<Locale, string>;
  description?: Record<Locale, string>;
}

export const fengshuiTerms: FengshuiTerm[] = [
  // 八字相关术语
  {
    id: 'heavenly_stems',
    category: 'bazi',
    translations: {
      'zh-CN': '天干',
      'zh-TW': '天干',
      'en': 'Heavenly Stems',
      'ja': '天干',
      'ko': '천간',
      'ms': 'Batang Syurga'
    },
    description: {
      'zh-CN': '甲乙丙丁戊己庚辛壬癸十个天干',
      'zh-TW': '甲乙丙丁戊己庚辛壬癸十個天干',
      'en': 'The ten celestial stems: Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui',
      'ja': '甲乙丙丁戊己庚辛壬癸の十干',
      'ko': '갑을병정무기경신임계 십간',
      'ms': 'Sepuluh batang syurga: Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui'
    }
  },
  {
    id: 'earthly_branches',
    category: 'bazi',
    translations: {
      'zh-CN': '地支',
      'zh-TW': '地支',
      'en': 'Earthly Branches',
      'ja': '地支',
      'ko': '지지',
      'ms': 'Cabang Bumi'
    },
    description: {
      'zh-CN': '子丑寅卯辰巳午未申酉戌亥十二地支',
      'zh-TW': '子丑寅卯辰巳午未申酉戌亥十二地支',
      'en': 'The twelve earthly branches: Zi, Chou, Yin, Mao, Chen, Si, Wu, Wei, Shen, You, Xu, Hai',
      'ja': '子丑寅卯辰巳午未申酉戌亥の十二支',
      'ko': '자축인묘진사오미신유술해 십이지',
      'ms': 'Dua belas cabang bumi: Zi, Chou, Yin, Mao, Chen, Si, Wu, Wei, Shen, You, Xu, Hai'
    }
  },
  
  // 五行术语
  {
    id: 'five_elements_wood',
    category: 'elements',
    translations: {
      'zh-CN': '木',
      'zh-TW': '木',
      'en': 'Wood',
      'ja': '木',
      'ko': '목',
      'ms': 'Kayu'
    }
  },
  {
    id: 'five_elements_fire',
    category: 'elements',
    translations: {
      'zh-CN': '火',
      'zh-TW': '火',
      'en': 'Fire',
      'ja': '火',
      'ko': '화',
      'ms': 'Api'
    }
  },
  {
    id: 'five_elements_earth',
    category: 'elements',
    translations: {
      'zh-CN': '土',
      'zh-TW': '土',
      'en': 'Earth',
      'ja': '土',
      'ko': '토',
      'ms': 'Tanah'
    }
  },
  {
    id: 'five_elements_metal',
    category: 'elements',
    translations: {
      'zh-CN': '金',
      'zh-TW': '金',
      'en': 'Metal',
      'ja': '金',
      'ko': '금',
      'ms': 'Logam'
    }
  },
  {
    id: 'five_elements_water',
    category: 'elements',
    translations: {
      'zh-CN': '水',
      'zh-TW': '水',
      'en': 'Water',
      'ja': '水',
      'ko': '수',
      'ms': 'Air'
    }
  },

  // 玄空飞星术语
  {
    id: 'xuankong_flying_stars',
    category: 'fengshui',
    translations: {
      'zh-CN': '玄空飞星',
      'zh-TW': '玄空飛星',
      'en': 'Xuankong Flying Stars',
      'ja': '玄空飛星',
      'ko': '현공비성',
      'ms': 'Bintang Terbang Xuankong'
    },
    description: {
      'zh-CN': '玄空风水学中的核心理论，通过飞星盘分析住宅吉凶',
      'zh-TW': '玄空風水學中的核心理論，通過飛星盤分析住宅吉凶',
      'en': 'Core theory in Xuankong Feng Shui for analyzing auspiciousness through flying star charts',
      'ja': '玄空風水学の核心理論で、飛星盤により住宅の吉凶を分析',
      'ko': '현공풍수학의 핵심 이론으로 비성반을 통해 주택의 길흉을 분석',
      'ms': 'Teori teras dalam Feng Shui Xuankong untuk menganalisis keberuntungan melalui carta bintang terbang'
    }
  },
  {
    id: 'mountain_star',
    category: 'stars',
    translations: {
      'zh-CN': '山星',
      'zh-TW': '山星',
      'en': 'Mountain Star',
      'ja': '山星',
      'ko': '산성',
      'ms': 'Bintang Gunung'
    },
    description: {
      'zh-CN': '主管人丁健康的飞星',
      'zh-TW': '主管人丁健康的飛星',
      'en': 'Flying star governing health and people',
      'ja': '人の健康を司る飛星',
      'ko': '인정과 건강을 관장하는 비성',
      'ms': 'Bintang terbang yang mengawal kesihatan dan orang'
    }
  },
  {
    id: 'water_star',
    category: 'stars',
    translations: {
      'zh-CN': '水星',
      'zh-TW': '水星',
      'en': 'Water Star',
      'ja': '水星',
      'ko': '수성',
      'ms': 'Bintang Air'
    },
    description: {
      'zh-CN': '主管财运的飞星',
      'zh-TW': '主管財運的飛星',
      'en': 'Flying star governing wealth and fortune',
      'ja': '財運を司る飛星',
      'ko': '재운을 관장하는 비성',
      'ms': 'Bintang terbang yang mengawal kekayaan dan nasib'
    }
  },

  // 二十四山方位
  {
    id: 'twenty_four_mountains',
    category: 'directions',
    translations: {
      'zh-CN': '二十四山',
      'zh-TW': '二十四山',
      'en': 'Twenty-Four Mountains',
      'ja': '二十四山',
      'ko': '이십사산',
      'ms': 'Dua Puluh Empat Gunung'
    },
    description: {
      'zh-CN': '罗盘上的二十四个方位，每个方位15度',
      'zh-TW': '羅盤上的二十四個方位，每個方位15度',
      'en': 'Twenty-four directions on the compass, each covering 15 degrees',
      'ja': '羅盤上の二十四方位、各方位15度',
      'ko': '나침반상의 24방위, 각 방위 15도',
      'ms': 'Dua puluh empat arah pada kompas, setiap arah meliputi 15 darjah'
    }
  },

  // 九宫
  {
    id: 'nine_palaces',
    category: 'fengshui',
    translations: {
      'zh-CN': '九宫',
      'zh-TW': '九宮',
      'en': 'Nine Palaces',
      'ja': '九宮',
      'ko': '구궁',
      'ms': 'Sembilan Istana'
    },
    description: {
      'zh-CN': '将空间分为九个宫位的风水布局方法',
      'zh-TW': '將空間分為九個宮位的風水佈局方法',
      'en': 'Feng shui layout method dividing space into nine sectors',
      'ja': '空間を九つの宮位に分ける風水配置法',
      'ko': '공간을 아홉 개의 궁위로 나누는 풍수 배치법',
      'ms': 'Kaedah susun atur feng shui yang membahagikan ruang kepada sembilan sektor'
    }
  },

  // 用神忌神
  {
    id: 'favorable_god',
    category: 'bazi',
    translations: {
      'zh-CN': '用神',
      'zh-TW': '用神',
      'en': 'Favorable God',
      'ja': '用神',
      'ko': '용신',
      'ms': 'Tuhan Yang Menguntungkan'
    },
    description: {
      'zh-CN': '八字中对命主有利的五行',
      'zh-TW': '八字中對命主有利的五行',
      'en': 'Beneficial elements in BaZi chart',
      'ja': '八字で命主に有利な五行',
      'ko': '사주에서 명주에게 유리한 오행',
      'ms': 'Unsur yang menguntungkan dalam carta BaZi'
    }
  },
  {
    id: 'unfavorable_god',
    category: 'bazi',
    translations: {
      'zh-CN': '忌神',
      'zh-TW': '忌神',
      'en': 'Unfavorable God',
      'ja': '忌神',
      'ko': '기신',
      'ms': 'Tuhan Yang Tidak Menguntungkan'
    },
    description: {
      'zh-CN': '八字中对命主不利的五行',
      'zh-TW': '八字中對命主不利的五行',
      'en': 'Harmful elements in BaZi chart',
      'ja': '八字で命主に不利な五行',
      'ko': '사주에서 명주에게 불리한 오행',
      'ms': 'Unsur yang merugikan dalam carta BaZi'
    }
  },

  // 罗盘术语
  {
    id: 'magnetic_declination',
    category: 'compass',
    translations: {
      'zh-CN': '磁偏角',
      'zh-TW': '磁偏角',
      'en': 'Magnetic Declination',
      'ja': '磁気偏角',
      'ko': '자기편각',
      'ms': 'Deklinasi Magnetik'
    },
    description: {
      'zh-CN': '磁北与真北之间的角度差',
      'zh-TW': '磁北與真北之間的角度差',
      'en': 'Angular difference between magnetic north and true north',
      'ja': '磁北と真北の角度差',
      'ko': '자북과 진북 사이의 각도차',
      'ms': 'Perbezaan sudut antara utara magnetik dan utara sebenar'
    }
  },

  // 九运
  {
    id: 'nine_periods',
    category: 'fengshui',
    translations: {
      'zh-CN': '九运',
      'zh-TW': '九運',
      'en': 'Nine Periods',
      'ja': '九運',
      'ko': '구운',
      'ms': 'Sembilan Tempoh'
    },
    description: {
      'zh-CN': '玄空风水中的时间周期，每运20年，共180年为一个大循环',
      'zh-TW': '玄空風水中的時間週期，每運20年，共180年為一個大循環',
      'en': 'Time cycles in Xuankong Feng Shui, each period lasts 20 years, 180 years for a complete cycle',
      'ja': '玄空風水の時間周期、各運20年、180年で一大循環',
      'ko': '현공풍수의 시간 주기, 각 운 20년, 180년이 한 대순환',
      'ms': 'Kitaran masa dalam Feng Shui Xuankong, setiap tempoh 20 tahun, 180 tahun untuk satu kitaran lengkap'
    }
  }
];

// 获取术语翻译
export function getFengshuiTerm(termId: string, locale: Locale): string {
  const term = fengshuiTerms.find(t => t.id === termId);
  return term?.translations[locale] || termId;
}

// 获取术语描述
export function getFengshuiTermDescription(termId: string, locale: Locale): string | undefined {
  const term = fengshuiTerms.find(t => t.id === termId);
  return term?.description?.[locale];
}

// 按分类获取术语
export function getFengshuiTermsByCategory(category: FengshuiTerm['category'], locale: Locale) {
  return fengshuiTerms
    .filter(term => term.category === category)
    .map(term => ({
      id: term.id,
      name: term.translations[locale],
      description: term.description?.[locale]
    }));
}

// 搜索术语
export function searchFengshuiTerms(query: string, locale: Locale) {
  const lowerQuery = query.toLowerCase();
  return fengshuiTerms
    .filter(term => 
      term.translations[locale].toLowerCase().includes(lowerQuery) ||
      term.description?.[locale]?.toLowerCase().includes(lowerQuery)
    )
    .map(term => ({
      id: term.id,
      name: term.translations[locale],
      description: term.description?.[locale],
      category: term.category
    }));
}