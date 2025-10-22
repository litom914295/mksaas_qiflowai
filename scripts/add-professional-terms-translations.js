const fs = require('fs');
const path = require('path');

// 专业术语完整翻译
const translations = {
  'zh-CN': {
    QiFlow: {
      terms: {
        // 天干
        tiangan: {
          title: '天干',
          items: {
            jia: '甲',
            yi: '乙',
            bing: '丙',
            ding: '丁',
            wu: '戊',
            ji: '己',
            geng: '庚',
            xin: '辛',
            ren: '壬',
            gui: '癸',
          },
        },
        // 地支
        dizhi: {
          title: '地支',
          items: {
            zi: '子',
            chou: '丑',
            yin: '寅',
            mao: '卯',
            chen: '辰',
            si: '巳',
            wu: '午',
            wei: '未',
            shen: '申',
            you: '酉',
            xu: '戌',
            hai: '亥',
          },
        },
        // 五行
        wuxing: {
          title: '五行',
          items: {
            wood: '木',
            fire: '火',
            earth: '土',
            metal: '金',
            water: '水',
          },
          relationships: {
            generating: '相生',
            overcoming: '相克',
            harmony: '和谐',
            conflict: '冲突',
          },
        },
        // 十神
        shishen: {
          title: '十神',
          items: {
            bijian: '比肩',
            jiecai: '劫财',
            shishen: '食神',
            shangguan: '伤官',
            piancai: '偏财',
            zhengcai: '正财',
            qisha: '七杀',
            zhengguan: '正官',
            pianyin: '偏印',
            zhengyin: '正印',
          },
          descriptions: {
            bijian: '与日主相同，代表兄弟姐妹、朋友',
            jiecai: '与日主同行异性，代表竞争、夺财',
            shishen: '日主所生同性，代表才华、表达',
            shangguan: '日主所生异性，代表聪明、叛逆',
            piancai: '日主所克同性，代表偏财运、投资',
            zhengcai: '日主所克异性，代表正财运、工资',
            qisha: '克日主同性，代表压力、挑战',
            zhengguan: '克日主异性，代表权威、职位',
            pianyin: '生日主同性，代表偏门学问',
            zhengyin: '生日主异性，代表母亲、正统教育',
          },
        },
        // 纳音
        nayin: {
          title: '纳音',
          items: {
            haizhongjin: '海中金',
            luzhonghuo: '炉中火',
            dalinmu: '大林木',
            lushangtu: '路旁土',
            jianfengjin: '剑锋金',
            shantouhu: '山头火',
            jianxiashui: '涧下水',
            chengtountu: '城头土',
            bailajin: '白蜡金',
            yangliumu: '杨柳木',
            quanzhongshui: '泉中水',
            wushangtu: '屋上土',
            pilili: '霹雳火',
            songbainu: '松柏木',
            changliushui: '长流水',
            shazongtu: '沙中土',
            shanxiahuo: '山下火',
            pingdimu: '平地木',
            biishangtu: '壁上土',
            jinboxin: '金箔金',
            fudenghuo: '佛灯火',
            tianheshui: '天河水',
            daiyitu: '大驿土',
            chaichuanjin: '钗钏金',
            sangsongmu: '桑松木',
            daxishui: '大溪水',
            shazongtu2: '沙中土',
            tianshanghuo: '天上火',
            shiliumu: '石榴木',
            dahaishui: '大海水',
          },
        },
        // 大运流年
        luck: {
          dayun: '大运',
          liunian: '流年',
          xiaoyun: '小运',
          taisui: '太岁',
          descriptions: {
            dayun: '十年一转的大运势',
            liunian: '每年的运势变化',
            xiaoyun: '每月的运势波动',
            taisui: '当年的值年星君',
          },
        },
        // 用神喜忌
        yongshen: {
          title: '用神',
          yongshen: '用神',
          xishen: '喜神',
          jishen: '忌神',
          choushen: '仇神',
          xiangshen: '相神',
          descriptions: {
            yongshen: '命局所需的五行，能够平衡命局',
            xishen: '辅助用神的五行',
            jishen: '对命局不利的五行',
            choushen: '与用神对立的五行',
            xiangshen: '与用神相生的五行',
          },
          strength: {
            strong: '身旺',
            weak: '身弱',
            balanced: '中和',
            veryStrong: '太旺',
            veryWeak: '太弱',
          },
        },
        // 九星飞星
        flyingStars: {
          title: '九星飞星',
          stars: {
            1: '一白贪狼星',
            2: '二黑巨门星',
            3: '三碧禄存星',
            4: '四绿文曲星',
            5: '五黄廉贞星',
            6: '六白武曲星',
            7: '七赤破军星',
            8: '八白左辅星',
            9: '九紫右弼星',
          },
          elements: {
            1: '水',
            2: '土',
            3: '木',
            4: '木',
            5: '土',
            6: '金',
            7: '金',
            8: '土',
            9: '火',
          },
          nature: {
            1: '吉',
            2: '凶',
            3: '凶',
            4: '吉',
            5: '凶',
            6: '吉',
            7: '凶',
            8: '吉',
            9: '吉',
          },
          meanings: {
            1: '智慧、学业、官运',
            2: '疾病、是非、破财',
            3: '是非、口舌、争斗',
            4: '文昌、学业、智慧',
            5: '灾祸、意外、破财',
            6: '权力、地位、偏财',
            7: '破财、盗贼、口舌',
            8: '财运、事业、健康',
            9: '喜庆、桃花、名声',
          },
        },
        // 风水格局
        geju: {
          title: '格局',
          types: {
            wangshanwangshui: '旺山旺水',
            shangshanxiashui: '上山下水',
            shuangxinghuixiang: '双星会向',
            fuyin: '伏吟',
            fanyin: '反吟',
            heshi: '合十',
            sanban: '三般',
            dajie: '打劫',
          },
          descriptions: {
            wangshanwangshui: '山星和向星都飞到当旺的宫位，最吉',
            shangshanxiashui: '山星飞到向方，向星飞到坐方，大凶',
            shuangxinghuixiang: '山星和向星都飞到向方',
            fuyin: '山星和向星相同',
            fanyin: '山星和向星相对',
            heshi: '山星和向星相加等于十',
            sanban: '三盘星数形成特殊组合',
            dajie: '特殊的三元九运组合',
          },
        },
        // 方位
        directions: {
          title: '方位',
          eight: {
            north: '北',
            northeast: '东北',
            east: '东',
            southeast: '东南',
            south: '南',
            southwest: '西南',
            west: '西',
            northwest: '西北',
          },
          trigrams: {
            kan: '坎',
            gen: '艮',
            zhen: '震',
            xun: '巽',
            li: '离',
            kun: '坤',
            dui: '兑',
            qian: '乾',
          },
          positions: {
            wealth: '财位',
            wenchang: '文昌位',
            taohua: '桃花位',
            guiren: '贵人位',
            yannian: '延年位',
            tianyi: '天医位',
            shengqi: '生气位',
            wugui: '五鬼位',
            liusha: '六煞位',
            huohai: '祸害位',
            jueming: '绝命位',
          },
        },
        // 季节节气
        seasons: {
          title: '季节节气',
          seasons: {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季',
          },
          solarTerms: {
            lichun: '立春',
            yushui: '雨水',
            jingzhe: '惊蛰',
            chunfen: '春分',
            qingming: '清明',
            guyu: '谷雨',
            lixia: '立夏',
            xiaoman: '小满',
            mangzhong: '芒种',
            xiazhi: '夏至',
            xiaoshu: '小暑',
            dashu: '大暑',
            liqiu: '立秋',
            chushu: '处暑',
            bailu: '白露',
            qiufen: '秋分',
            hanlu: '寒露',
            shuangjiang: '霜降',
            lidong: '立冬',
            xiaoxue: '小雪',
            daxue: '大雪',
            dongzhi: '冬至',
            xiaohan: '小寒',
            dahan: '大寒',
          },
        },
        // 颜色
        colors: {
          title: '颜色',
          favorable: '有利颜色',
          unfavorable: '不利颜色',
          byElement: {
            wood: ['绿色', '青色', '碧色'],
            fire: ['红色', '紫色', '橙色'],
            earth: ['黄色', '棕色', '土色'],
            metal: ['白色', '金色', '银色'],
            water: ['黑色', '蓝色', '灰色'],
          },
        },
        // 行业
        industries: {
          title: '适合行业',
          byElement: {
            wood: ['林业', '木材', '文化', '教育', '医药', '纺织'],
            fire: ['能源', '餐饮', '电子', '光学', '娱乐', '广告'],
            earth: ['房地产', '建筑', '农业', '畜牧', '中介', '管理'],
            metal: ['金融', '五金', '机械', '汽车', '珠宝', '科技'],
            water: ['航运', '水产', '饮料', '旅游', '物流', '通讯'],
          },
        },
      },
    },
  },
  'zh-TW': {
    QiFlow: {
      terms: {
        tiangan: {
          title: '天干',
          items: {
            jia: '甲',
            yi: '乙',
            bing: '丙',
            ding: '丁',
            wu: '戊',
            ji: '己',
            geng: '庚',
            xin: '辛',
            ren: '壬',
            gui: '癸',
          },
        },
        dizhi: {
          title: '地支',
          items: {
            zi: '子',
            chou: '丑',
            yin: '寅',
            mao: '卯',
            chen: '辰',
            si: '巳',
            wu: '午',
            wei: '未',
            shen: '申',
            you: '酉',
            xu: '戌',
            hai: '亥',
          },
        },
        wuxing: {
          title: '五行',
          items: {
            wood: '木',
            fire: '火',
            earth: '土',
            metal: '金',
            water: '水',
          },
          relationships: {
            generating: '相生',
            overcoming: '相剋',
            harmony: '和諧',
            conflict: '衝突',
          },
        },
        shishen: {
          title: '十神',
          items: {
            bijian: '比肩',
            jiecai: '劫財',
            shishen: '食神',
            shangguan: '傷官',
            piancai: '偏財',
            zhengcai: '正財',
            qisha: '七殺',
            zhengguan: '正官',
            pianyin: '偏印',
            zhengyin: '正印',
          },
          descriptions: {
            bijian: '與日主相同，代表兄弟姐妹、朋友',
            jiecai: '與日主同行異性，代表競爭、奪財',
            shishen: '日主所生同性，代表才華、表達',
            shangguan: '日主所生異性，代表聰明、叛逆',
            piancai: '日主所剋同性，代表偏財運、投資',
            zhengcai: '日主所剋異性，代表正財運、工資',
            qisha: '剋日主同性，代表壓力、挑戰',
            zhengguan: '剋日主異性，代表權威、職位',
            pianyin: '生日主同性，代表偏門學問',
            zhengyin: '生日主異性，代表母親、正統教育',
          },
        },
        nayin: {
          title: '納音',
          items: {
            haizhongjin: '海中金',
            luzhonghuo: '爐中火',
            dalinmu: '大林木',
            lushangtu: '路旁土',
            jianfengjin: '劍鋒金',
            shantouhu: '山頭火',
            jianxiashui: '澗下水',
            chengtountu: '城頭土',
            bailajin: '白蠟金',
            yangliumu: '楊柳木',
            quanzhongshui: '泉中水',
            wushangtu: '屋上土',
            pilili: '霹靂火',
            songbainu: '松柏木',
            changliushui: '長流水',
            shazongtu: '沙中土',
            shanxiahuo: '山下火',
            pingdimu: '平地木',
            biishangtu: '壁上土',
            jinboxin: '金箔金',
            fudenghuo: '佛燈火',
            tianheshui: '天河水',
            daiyitu: '大驛土',
            chaichuanjin: '釵釧金',
            sangsongmu: '桑松木',
            daxishui: '大溪水',
            shazongtu2: '沙中土',
            tianshanghuo: '天上火',
            shiliumu: '石榴木',
            dahaishui: '大海水',
          },
        },
        luck: {
          dayun: '大運',
          liunian: '流年',
          xiaoyun: '小運',
          taisui: '太歲',
          descriptions: {
            dayun: '十年一轉的大運勢',
            liunian: '每年的運勢變化',
            xiaoyun: '每月的運勢波動',
            taisui: '當年的值年星君',
          },
        },
        yongshen: {
          title: '用神',
          yongshen: '用神',
          xishen: '喜神',
          jishen: '忌神',
          choushen: '仇神',
          xiangshen: '相神',
          descriptions: {
            yongshen: '命局所需的五行，能夠平衡命局',
            xishen: '輔助用神的五行',
            jishen: '對命局不利的五行',
            choushen: '與用神對立的五行',
            xiangshen: '與用神相生的五行',
          },
          strength: {
            strong: '身旺',
            weak: '身弱',
            balanced: '中和',
            veryStrong: '太旺',
            veryWeak: '太弱',
          },
        },
        flyingStars: {
          title: '九星飛星',
          stars: {
            1: '一白貪狼星',
            2: '二黑巨門星',
            3: '三碧祿存星',
            4: '四綠文曲星',
            5: '五黃廉貞星',
            6: '六白武曲星',
            7: '七赤破軍星',
            8: '八白左輔星',
            9: '九紫右弼星',
          },
          elements: {
            1: '水',
            2: '土',
            3: '木',
            4: '木',
            5: '土',
            6: '金',
            7: '金',
            8: '土',
            9: '火',
          },
          nature: {
            1: '吉',
            2: '凶',
            3: '凶',
            4: '吉',
            5: '凶',
            6: '吉',
            7: '凶',
            8: '吉',
            9: '吉',
          },
          meanings: {
            1: '智慧、學業、官運',
            2: '疾病、是非、破財',
            3: '是非、口舌、爭鬥',
            4: '文昌、學業、智慧',
            5: '災禍、意外、破財',
            6: '權力、地位、偏財',
            7: '破財、盜賊、口舌',
            8: '財運、事業、健康',
            9: '喜慶、桃花、名聲',
          },
        },
        geju: {
          title: '格局',
          types: {
            wangshanwangshui: '旺山旺水',
            shangshanxiashui: '上山下水',
            shuangxinghuixiang: '雙星會向',
            fuyin: '伏吟',
            fanyin: '反吟',
            heshi: '合十',
            sanban: '三般',
            dajie: '打劫',
          },
          descriptions: {
            wangshanwangshui: '山星和向星都飛到當旺的宮位，最吉',
            shangshanxiashui: '山星飛到向方，向星飛到坐方，大凶',
            shuangxinghuixiang: '山星和向星都飛到向方',
            fuyin: '山星和向星相同',
            fanyin: '山星和向星相對',
            heshi: '山星和向星相加等於十',
            sanban: '三盤星數形成特殊組合',
            dajie: '特殊的三元九運組合',
          },
        },
        directions: {
          title: '方位',
          eight: {
            north: '北',
            northeast: '東北',
            east: '東',
            southeast: '東南',
            south: '南',
            southwest: '西南',
            west: '西',
            northwest: '西北',
          },
          trigrams: {
            kan: '坎',
            gen: '艮',
            zhen: '震',
            xun: '巽',
            li: '離',
            kun: '坤',
            dui: '兌',
            qian: '乾',
          },
          positions: {
            wealth: '財位',
            wenchang: '文昌位',
            taohua: '桃花位',
            guiren: '貴人位',
            yannian: '延年位',
            tianyi: '天醫位',
            shengqi: '生氣位',
            wugui: '五鬼位',
            liusha: '六煞位',
            huohai: '禍害位',
            jueming: '絕命位',
          },
        },
        seasons: {
          title: '季節節氣',
          seasons: {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季',
          },
          solarTerms: {
            lichun: '立春',
            yushui: '雨水',
            jingzhe: '驚蟄',
            chunfen: '春分',
            qingming: '清明',
            guyu: '穀雨',
            lixia: '立夏',
            xiaoman: '小滿',
            mangzhong: '芒種',
            xiazhi: '夏至',
            xiaoshu: '小暑',
            dashu: '大暑',
            liqiu: '立秋',
            chushu: '處暑',
            bailu: '白露',
            qiufen: '秋分',
            hanlu: '寒露',
            shuangjiang: '霜降',
            lidong: '立冬',
            xiaoxue: '小雪',
            daxue: '大雪',
            dongzhi: '冬至',
            xiaohan: '小寒',
            dahan: '大寒',
          },
        },
        colors: {
          title: '顏色',
          favorable: '有利顏色',
          unfavorable: '不利顏色',
          byElement: {
            wood: ['綠色', '青色', '碧色'],
            fire: ['紅色', '紫色', '橙色'],
            earth: ['黃色', '棕色', '土色'],
            metal: ['白色', '金色', '銀色'],
            water: ['黑色', '藍色', '灰色'],
          },
        },
        industries: {
          title: '適合行業',
          byElement: {
            wood: ['林業', '木材', '文化', '教育', '醫藥', '紡織'],
            fire: ['能源', '餐飲', '電子', '光學', '娛樂', '廣告'],
            earth: ['房地產', '建築', '農業', '畜牧', '中介', '管理'],
            metal: ['金融', '五金', '機械', '汽車', '珠寶', '科技'],
            water: ['航運', '水產', '飲料', '旅遊', '物流', '通訊'],
          },
        },
      },
    },
  },
  en: {
    QiFlow: {
      terms: {
        tiangan: {
          title: 'Heavenly Stems',
          items: {
            jia: 'Jia (甲)',
            yi: 'Yi (乙)',
            bing: 'Bing (丙)',
            ding: 'Ding (丁)',
            wu: 'Wu (戊)',
            ji: 'Ji (己)',
            geng: 'Geng (庚)',
            xin: 'Xin (辛)',
            ren: 'Ren (壬)',
            gui: 'Gui (癸)',
          },
        },
        dizhi: {
          title: 'Earthly Branches',
          items: {
            zi: 'Zi (子)',
            chou: 'Chou (丑)',
            yin: 'Yin (寅)',
            mao: 'Mao (卯)',
            chen: 'Chen (辰)',
            si: 'Si (巳)',
            wu: 'Wu (午)',
            wei: 'Wei (未)',
            shen: 'Shen (申)',
            you: 'You (酉)',
            xu: 'Xu (戌)',
            hai: 'Hai (亥)',
          },
        },
        wuxing: {
          title: 'Five Elements',
          items: {
            wood: 'Wood',
            fire: 'Fire',
            earth: 'Earth',
            metal: 'Metal',
            water: 'Water',
          },
          relationships: {
            generating: 'Generating Cycle',
            overcoming: 'Overcoming Cycle',
            harmony: 'Harmony',
            conflict: 'Conflict',
          },
        },
        shishen: {
          title: 'Ten Gods',
          items: {
            bijian: 'Friend (比肩)',
            jiecai: 'Rob Wealth (劫财)',
            shishen: 'Eating God (食神)',
            shangguan: 'Hurting Officer (伤官)',
            piancai: 'Indirect Wealth (偏财)',
            zhengcai: 'Direct Wealth (正财)',
            qisha: 'Seven Killings (七杀)',
            zhengguan: 'Direct Officer (正官)',
            pianyin: 'Indirect Resource (偏印)',
            zhengyin: 'Direct Resource (正印)',
          },
          descriptions: {
            bijian: 'Same as Day Master, represents siblings and friends',
            jiecai: 'Same element opposite polarity, represents competition',
            shishen: 'Produced by Day Master same polarity, represents talent',
            shangguan:
              'Produced by Day Master opposite polarity, represents intelligence',
            piancai:
              'Controlled by Day Master same polarity, represents indirect wealth',
            zhengcai:
              'Controlled by Day Master opposite polarity, represents direct wealth',
            qisha: 'Controls Day Master same polarity, represents pressure',
            zhengguan:
              'Controls Day Master opposite polarity, represents authority',
            pianyin:
              'Produces Day Master same polarity, represents unconventional knowledge',
            zhengyin:
              'Produces Day Master opposite polarity, represents traditional education',
          },
        },
        nayin: {
          title: 'Nayin',
          items: {
            haizhongjin: 'Gold in the Sea',
            luzhonghuo: 'Fire in the Furnace',
            dalinmu: 'Wood of the Forest',
            lushangtu: 'Earth by the Roadside',
            jianfengjin: 'Sword-Edge Gold',
            shantouhu: 'Fire on the Mountain',
            jianxiashui: 'Water in the Stream',
            chengtountu: 'Earth on the City Wall',
            bailajin: 'White Wax Gold',
            yangliumu: 'Willow Wood',
            quanzhongshui: 'Water in the Spring',
            wushangtu: 'Earth on the Roof',
            pilili: 'Thunderbolt Fire',
            songbainu: 'Pine-Cypress Wood',
            changliushui: 'Long Flowing Water',
            shazongtu: 'Earth in the Sand',
            shanxiahuo: 'Fire at the Foot of the Mountain',
            pingdimu: 'Flat Land Wood',
            biishangtu: 'Earth on the Wall',
            jinboxin: 'Gold Foil Gold',
            fudenghuo: 'Buddha Lamp Fire',
            tianheshui: 'Heavenly River Water',
            daiyitu: 'Earth of the Great Post Road',
            chaichuanjin: 'Hairpin-Bracelet Gold',
            sangsongmu: 'Mulberry Wood',
            daxishui: 'Great Stream Water',
            shazongtu2: 'Earth in the Sand',
            tianshanghuo: 'Fire in the Sky',
            shiliumu: 'Pomegranate Wood',
            dahaishui: 'Water of the Great Sea',
          },
        },
        luck: {
          dayun: 'Major Luck Cycle',
          liunian: 'Annual Fortune',
          xiaoyun: 'Monthly Fortune',
          taisui: 'Grand Duke Jupiter',
          descriptions: {
            dayun: '10-year major fortune cycle',
            liunian: 'Annual fortune changes',
            xiaoyun: 'Monthly fortune fluctuations',
            taisui: "Year's ruling deity",
          },
        },
        yongshen: {
          title: 'Favorable Elements',
          yongshen: 'Favorable Element',
          xishen: 'Supporting Element',
          jishen: 'Unfavorable Element',
          choushen: 'Opposing Element',
          xiangshen: 'Auxiliary Element',
          descriptions: {
            yongshen: 'Element needed to balance the chart',
            xishen: 'Element that assists the favorable element',
            jishen: 'Element harmful to the chart',
            choushen: 'Element opposing the favorable element',
            xiangshen: 'Element generating the favorable element',
          },
          strength: {
            strong: 'Strong',
            weak: 'Weak',
            balanced: 'Balanced',
            veryStrong: 'Very Strong',
            veryWeak: 'Very Weak',
          },
        },
        flyingStars: {
          title: 'Nine Flying Stars',
          stars: {
            1: 'Star 1 - White Greedy Wolf',
            2: 'Star 2 - Black Giant Door',
            3: 'Star 3 - Green Storing Lu',
            4: 'Star 4 - Green Literary Song',
            5: 'Star 5 - Yellow Integrity',
            6: 'Star 6 - White Martial Song',
            7: 'Star 7 - Red Breaking Army',
            8: 'Star 8 - White Left Assistant',
            9: 'Star 9 - Purple Right Assistant',
          },
          elements: {
            1: 'Water',
            2: 'Earth',
            3: 'Wood',
            4: 'Wood',
            5: 'Earth',
            6: 'Metal',
            7: 'Metal',
            8: 'Earth',
            9: 'Fire',
          },
          nature: {
            1: 'Auspicious',
            2: 'Inauspicious',
            3: 'Inauspicious',
            4: 'Auspicious',
            5: 'Inauspicious',
            6: 'Auspicious',
            7: 'Inauspicious',
            8: 'Auspicious',
            9: 'Auspicious',
          },
          meanings: {
            1: 'Wisdom, Education, Career',
            2: 'Illness, Disputes, Losses',
            3: 'Conflicts, Arguments, Fights',
            4: 'Education, Learning, Wisdom',
            5: 'Disasters, Accidents, Losses',
            6: 'Power, Status, Wealth',
            7: 'Losses, Theft, Arguments',
            8: 'Wealth, Career, Health',
            9: 'Celebration, Romance, Fame',
          },
        },
        geju: {
          title: 'Feng Shui Patterns',
          types: {
            wangshanwangshui: 'Prosperous Mountain Prosperous Water',
            shangshanxiashui: 'Mountain Goes Down Water Goes Up',
            shuangxinghuixiang: 'Double Stars Meet Direction',
            fuyin: 'Hidden Chant',
            fanyin: 'Reversed Chant',
            heshi: 'Combination of Ten',
            sanban: 'Three Combinations',
            dajie: 'Great Robbery',
          },
          descriptions: {
            wangshanwangshui:
              'Mountain and water stars both reach prosperous positions, most auspicious',
            shangshanxiashui:
              'Mountain star flies to direction, water star flies to sitting, very inauspicious',
            shuangxinghuixiang:
              'Both mountain and water stars fly to direction',
            fuyin: 'Mountain and water stars are the same',
            fanyin: 'Mountain and water stars are opposite',
            heshi: 'Mountain and water stars add up to ten',
            sanban: 'Three plates form special combinations',
            dajie: 'Special three-cycle nine-fortune combination',
          },
        },
        directions: {
          title: 'Directions',
          eight: {
            north: 'North',
            northeast: 'Northeast',
            east: 'East',
            southeast: 'Southeast',
            south: 'South',
            southwest: 'Southwest',
            west: 'West',
            northwest: 'Northwest',
          },
          trigrams: {
            kan: 'Kan (Water)',
            gen: 'Gen (Mountain)',
            zhen: 'Zhen (Thunder)',
            xun: 'Xun (Wind)',
            li: 'Li (Fire)',
            kun: 'Kun (Earth)',
            dui: 'Dui (Lake)',
            qian: 'Qian (Heaven)',
          },
          positions: {
            wealth: 'Wealth Position',
            wenchang: 'Education Position',
            taohua: 'Romance Position',
            guiren: 'Benefactor Position',
            yannian: 'Longevity Position',
            tianyi: 'Heavenly Doctor Position',
            shengqi: 'Vitality Position',
            wugui: 'Five Ghosts Position',
            liusha: 'Six Killings Position',
            huohai: 'Disasters Position',
            jueming: 'Total Loss Position',
          },
        },
        seasons: {
          title: 'Seasons & Solar Terms',
          seasons: {
            spring: 'Spring',
            summer: 'Summer',
            autumn: 'Autumn',
            winter: 'Winter',
          },
          solarTerms: {
            lichun: 'Beginning of Spring',
            yushui: 'Rain Water',
            jingzhe: 'Awakening of Insects',
            chunfen: 'Spring Equinox',
            qingming: 'Pure Brightness',
            guyu: 'Grain Rain',
            lixia: 'Beginning of Summer',
            xiaoman: 'Grain Buds',
            mangzhong: 'Grain in Ear',
            xiazhi: 'Summer Solstice',
            xiaoshu: 'Minor Heat',
            dashu: 'Major Heat',
            liqiu: 'Beginning of Autumn',
            chushu: 'End of Heat',
            bailu: 'White Dew',
            qiufen: 'Autumn Equinox',
            hanlu: 'Cold Dew',
            shuangjiang: 'Descent of Frost',
            lidong: 'Beginning of Winter',
            xiaoxue: 'Minor Snow',
            daxue: 'Major Snow',
            dongzhi: 'Winter Solstice',
            xiaohan: 'Minor Cold',
            dahan: 'Major Cold',
          },
        },
        colors: {
          title: 'Colors',
          favorable: 'Favorable Colors',
          unfavorable: 'Unfavorable Colors',
          byElement: {
            wood: ['Green', 'Blue-green', 'Cyan'],
            fire: ['Red', 'Purple', 'Orange'],
            earth: ['Yellow', 'Brown', 'Earth tones'],
            metal: ['White', 'Gold', 'Silver'],
            water: ['Black', 'Blue', 'Gray'],
          },
        },
        industries: {
          title: 'Suitable Industries',
          byElement: {
            wood: [
              'Forestry',
              'Timber',
              'Culture',
              'Education',
              'Medicine',
              'Textiles',
            ],
            fire: [
              'Energy',
              'Food & Beverage',
              'Electronics',
              'Optics',
              'Entertainment',
              'Advertising',
            ],
            earth: [
              'Real Estate',
              'Construction',
              'Agriculture',
              'Animal Husbandry',
              'Agency',
              'Management',
            ],
            metal: [
              'Finance',
              'Hardware',
              'Machinery',
              'Automotive',
              'Jewelry',
              'Technology',
            ],
            water: [
              'Shipping',
              'Aquatic',
              'Beverages',
              'Tourism',
              'Logistics',
              'Communications',
            ],
          },
        },
      },
    },
  },
};

// 为其他语言创建简化版本（暂时使用英文+中文注音）
const otherLanguages = ['ja', 'ko', 'ms'];
otherLanguages.forEach((lang) => {
  translations[lang] = JSON.parse(JSON.stringify(translations.en)); // 深拷贝英文版本
});

// 语言文件路径
const localesDir = path.join(__dirname, '..', 'src', 'locales');
const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'];

// 深度合并对象的辅助函数
function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// 主函数
async function addProfessionalTerms() {
  console.log('🚀 开始添加专业术语翻译...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const lang of languages) {
    try {
      const filePath = path.join(localesDir, lang, 'common.json');

      // 读取现有文件
      let existingData = {};
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        existingData = JSON.parse(fileContent);
      }

      // 合并翻译
      const newData = deepMerge(existingData, translations[lang]);

      // 写回文件
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');

      console.log(`✅ ${lang}: 专业术语翻译已成功添加`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${lang}: 添加翻译失败`);
      console.error(error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 执行结果:');
  console.log(`   ✅ 成功: ${successCount} 个语言`);
  console.log(`   ❌ 失败: ${errorCount} 个语言`);
  console.log('\n✨ 专业术语翻译完成！');
  console.log('\n📝 已添加的专业术语分类:');
  console.log('   • 天干 (10个)');
  console.log('   • 地支 (12个)');
  console.log('   • 五行及相生相克关系');
  console.log('   • 十神 (10个) + 详细解释');
  console.log('   • 纳音 (30个)');
  console.log('   • 大运、流年、小运、太岁');
  console.log('   • 用神、喜神、忌神等');
  console.log('   • 九星飞星 (9个) + 含义');
  console.log('   • 风水格局 (8种)');
  console.log('   • 八方位 + 八卦');
  console.log('   • 特殊方位 (财位、文昌位等11个)');
  console.log('   • 二十四节气');
  console.log('   • 五行对应颜色');
  console.log('   • 五行对应行业');
  console.log('\n💡 提示:');
  console.log('   1. 专业术语已添加到 QiFlow.terms 命名空间');
  console.log(`   2. 可以使用 t('QiFlow.terms.tiangan.items.jia') 访问`);
  console.log('   3. 建议在组件中引用这些术语，而不是硬编码');
}

// 执行
addProfessionalTerms().catch(console.error);
