const fs = require('fs');
const path = require('path');

// 所有翻译内容
const translations = {
  'zh-CN': {
    QiFlow: {
      instantResult: {
        analysisComplete: '分析完成',
        yourPreview: '您的命理预览',
        previewDesc: '以下是根据您的出生信息生成的命理概况',
        aiSummary: 'AI 命理总结',
        yourPillars: '您的八字四柱',
        elementsChart: '五行分布图',
        keyInsights: '关键洞察',
        upgradeSection: {
          features: {
            fullReport: '完整30页专业八字报告',
            luckCycle: '流年、大运详细分析',
            pdfExport: 'PDF导出随时查看',
            aiChat: 'AI问答无限次数',
          },
          getFullReport: '立即获取完整报告',
          retry: '重新测试',
          limitedOffer: '💎 限时优惠：首次购买享8折优惠',
        },
      },
      interpretation: {
        generateButton: '生成解读',
        labels: {
          suggestions: '建议',
          relations: '十神关系',
          nayin: '纳音',
          breakdown: '运期分解',
        },
      },
      userProfile: {
        labels: {
          displayName: '显示名称',
          displayNamePlaceholder: '您的昵称',
          gender: '性别',
          genderOptions: {
            male: '男',
            female: '女',
            other: '其他',
          },
          calendar: '历法',
          calendarOptions: {
            gregorian: '公历',
            lunar: '农历',
          },
          birthDate: '出生日期',
          birthDateLunar: '出生日期（农历）',
          birthTime: '出生时间',
          address: '出生地点/地址',
          addressPlaceholder: '输入地址，支持自动补全和地图选择',
          email: '电子邮箱（选填）',
          emailPlaceholder: 'you@example.com',
          phone: '电话（选填）',
          phonePlaceholder: '仅用于联系，不会公开',
        },
        buttons: {
          openMap: '打开地图选点',
          save: '保存资料',
          saving: '保存中...',
        },
        hints: {
          mapSupport: '支持自动补全；地图选点为占位版本。',
        },
        validation: {
          nameRequired: '请输入姓名',
          dateRequired: '请选择日期',
          addressRequired: '请输入地址或选择位置',
          invalidEmail: '电子邮箱格式无效',
          submissionFailed: '提交失败',
        },
      },
      aiChat: {
        welcome: {
          greeting: '您好！我是气流AI助手。',
          coreAdvantage: '🌟 **核心优势**：所有风水分析都基于您的个人八字定制',
          features: {
            wealth: '• 财位根据您的日主确定',
            color: '• 颜色基于您的用神选择',
            direction: '• 方位依据您的五行喜忌',
          },
          instruction:
            '请先提供您的出生信息，让我为您提供真正个性化的命理风水建议。',
        },
        quickQuestions: {
          bazi: '我的八字用神是什么？',
          fengshui: '基于我的八字，家里如何布置风水？',
          wealth: '我的个人财位在哪里？',
          career: '我今年的事业运如何？',
        },
        prompts: {
          inputPlaceholder: '输入您的问题...',
          sendButton: '发送',
          loading: 'AI正在思考...',
        },
        responses: {
          needsInfo: '要回答您的问题，我需要以下信息：',
          pleaseProvide:
            '请您先完成相关的分析，或者告诉我这些信息，我才能为您提供准确的建议。',
          dataTypes: {
            bazi: '八字信息',
            xuankong: '风水数据',
            house: '房屋信息',
          },
          fengshuiRequiresBazi: {
            title: '🔔 **重要提示**：风水分析必须基于您的八字命理',
            difference: '我们的风水服务与众不同：',
            features: {
              notGeneric: '• 不是通用的风水建议',
              basedOnBazi: '• 完全基于您的八字定制',
              personalized: '• 财位、文昌位都因人而异',
            },
            pleaseProvide:
              '请先提供您的出生信息（年月日时、性别），让我为您进行个性化分析。',
          },
        },
        badges: {
          dataUsed: '使用了数据',
          bazi: '八字',
          xuankong: '风水',
          house: '房屋',
        },
      },
      forms: {
        common: {
          required: '必填',
          optional: '选填',
          select: '请选择',
          loading: '加载中...',
          submitting: '提交中...',
          success: '操作成功',
          error: '操作失败',
        },
      },
    },
  },
  'zh-TW': {
    QiFlow: {
      instantResult: {
        analysisComplete: '分析完成',
        yourPreview: '您的命理預覽',
        previewDesc: '以下是根據您的出生資訊生成的命理概況',
        aiSummary: 'AI 命理總結',
        yourPillars: '您的八字四柱',
        elementsChart: '五行分佈圖',
        keyInsights: '關鍵洞察',
        upgradeSection: {
          features: {
            fullReport: '完整30頁專業八字報告',
            luckCycle: '流年、大運詳細分析',
            pdfExport: 'PDF匯出隨時查看',
            aiChat: 'AI問答無限次數',
          },
          getFullReport: '立即獲取完整報告',
          retry: '重新測試',
          limitedOffer: '💎 限時優惠：首次購買享8折優惠',
        },
      },
      interpretation: {
        generateButton: '生成解讀',
        labels: {
          suggestions: '建議',
          relations: '十神關係',
          nayin: '納音',
          breakdown: '運期分解',
        },
      },
      userProfile: {
        labels: {
          displayName: '顯示名稱',
          displayNamePlaceholder: '您的暱稱',
          gender: '性別',
          genderOptions: {
            male: '男',
            female: '女',
            other: '其他',
          },
          calendar: '曆法',
          calendarOptions: {
            gregorian: '公曆',
            lunar: '農曆',
          },
          birthDate: '出生日期',
          birthDateLunar: '出生日期（農曆）',
          birthTime: '出生時間',
          address: '出生地點/地址',
          addressPlaceholder: '輸入地址，支援自動補全和地圖選擇',
          email: '電子郵箱（選填）',
          emailPlaceholder: 'you@example.com',
          phone: '電話（選填）',
          phonePlaceholder: '僅用於聯繫，不會公開',
        },
        buttons: {
          openMap: '打開地圖選點',
          save: '儲存資料',
          saving: '儲存中...',
        },
        hints: {
          mapSupport: '支援自動補全；地圖選點為佔位版本。',
        },
        validation: {
          nameRequired: '請輸入姓名',
          dateRequired: '請選擇日期',
          addressRequired: '請輸入地址或選擇位置',
          invalidEmail: '電子郵箱格式無效',
          submissionFailed: '提交失敗',
        },
      },
      aiChat: {
        welcome: {
          greeting: '您好！我是氣流AI助手。',
          coreAdvantage: '🌟 **核心優勢**：所有風水分析都基於您的個人八字定製',
          features: {
            wealth: '• 財位根據您的日主確定',
            color: '• 顏色基於您的用神選擇',
            direction: '• 方位依據您的五行喜忌',
          },
          instruction:
            '請先提供您的出生資訊，讓我為您提供真正個性化的命理風水建議。',
        },
        quickQuestions: {
          bazi: '我的八字用神是什麼？',
          fengshui: '基於我的八字，家裡如何佈置風水？',
          wealth: '我的個人財位在哪裡？',
          career: '我今年的事業運如何？',
        },
        prompts: {
          inputPlaceholder: '輸入您的問題...',
          sendButton: '發送',
          loading: 'AI正在思考...',
        },
        responses: {
          needsInfo: '要回答您的問題，我需要以下資訊：',
          pleaseProvide:
            '請您先完成相關的分析，或者告訴我這些資訊，我才能為您提供準確的建議。',
          dataTypes: {
            bazi: '八字資訊',
            xuankong: '風水數據',
            house: '房屋資訊',
          },
          fengshuiRequiresBazi: {
            title: '🔔 **重要提示**：風水分析必須基於您的八字命理',
            difference: '我們的風水服務與眾不同：',
            features: {
              notGeneric: '• 不是通用的風水建議',
              basedOnBazi: '• 完全基於您的八字定製',
              personalized: '• 財位、文昌位都因人而異',
            },
            pleaseProvide:
              '請先提供您的出生資訊（年月日時、性別），讓我為您進行個性化分析。',
          },
        },
        badges: {
          dataUsed: '使用了數據',
          bazi: '八字',
          xuankong: '風水',
          house: '房屋',
        },
      },
      forms: {
        common: {
          required: '必填',
          optional: '選填',
          select: '請選擇',
          loading: '載入中...',
          submitting: '提交中...',
          success: '操作成功',
          error: '操作失敗',
        },
      },
    },
  },
  en: {
    QiFlow: {
      instantResult: {
        analysisComplete: 'Analysis Complete',
        yourPreview: 'Your Destiny Preview',
        previewDesc:
          'Generated destiny overview based on your birth information',
        aiSummary: 'AI Destiny Summary',
        yourPillars: 'Your Ba Zi Four Pillars',
        elementsChart: 'Five Elements Distribution',
        keyInsights: 'Key Insights',
        upgradeSection: {
          features: {
            fullReport: 'Complete 30-page Professional Ba Zi Report',
            luckCycle: 'Detailed Luck Cycles and Annual Predictions',
            pdfExport: 'PDF Export for Anytime Access',
            aiChat: 'Unlimited AI Q&A Sessions',
          },
          getFullReport: 'Get Full Report Now',
          retry: 'Try Again',
          limitedOffer: '💎 Limited Offer: 20% OFF for First Purchase',
        },
      },
      interpretation: {
        generateButton: 'Generate Interpretation',
        labels: {
          suggestions: 'Suggestions',
          relations: 'Ten Gods Relations',
          nayin: 'Nayin',
          breakdown: 'Period Breakdown',
        },
      },
      userProfile: {
        labels: {
          displayName: 'Display Name',
          displayNamePlaceholder: 'Your nickname',
          gender: 'Gender',
          genderOptions: {
            male: 'Male',
            female: 'Female',
            other: 'Other',
          },
          calendar: 'Calendar',
          calendarOptions: {
            gregorian: 'Gregorian',
            lunar: 'Lunar',
          },
          birthDate: 'Birth Date',
          birthDateLunar: 'Birth Date (Lunar Calendar)',
          birthTime: 'Birth Time',
          address: 'Birth Place/Address',
          addressPlaceholder:
            'Enter address, supports autocomplete and map selection',
          email: 'Email (Optional)',
          emailPlaceholder: 'you@example.com',
          phone: 'Phone (Optional)',
          phonePlaceholder: 'For contact only, will not be public',
        },
        buttons: {
          openMap: 'Open Map Selection',
          save: 'Save Profile',
          saving: 'Saving...',
        },
        hints: {
          mapSupport:
            'Autocomplete is supported; map selection is placeholder version.',
        },
        validation: {
          nameRequired: 'Please enter name',
          dateRequired: 'Please select date',
          addressRequired: 'Please enter address or select location',
          invalidEmail: 'Invalid email format',
          submissionFailed: 'Submission failed',
        },
      },
      aiChat: {
        welcome: {
          greeting: 'Hello! I am the QiFlow AI Assistant.',
          coreAdvantage:
            '🌟 **Core Advantage**: All Feng Shui analyses are customized based on your personal Ba Zi',
          features: {
            wealth: '• Wealth position determined by your Day Master',
            color: '• Colors selected based on your favorable elements',
            direction: '• Directions based on your five elements preferences',
          },
          instruction:
            'Please provide your birth information first for truly personalized destiny and Feng Shui advice.',
        },
        quickQuestions: {
          bazi: 'What are my favorable elements in Ba Zi?',
          fengshui:
            'Based on my Ba Zi, how should I arrange Feng Shui at home?',
          wealth: 'Where is my personal wealth position?',
          career: 'How is my career luck this year?',
        },
        prompts: {
          inputPlaceholder: 'Enter your question...',
          sendButton: 'Send',
          loading: 'AI is thinking...',
        },
        responses: {
          needsInfo:
            'To answer your question, I need the following information:',
          pleaseProvide:
            'Please complete the relevant analysis first, or provide me with this information for accurate advice.',
          dataTypes: {
            bazi: 'Ba Zi Information',
            xuankong: 'Feng Shui Data',
            house: 'House Information',
          },
          fengshuiRequiresBazi: {
            title:
              '🔔 **Important**: Feng Shui analysis must be based on your Ba Zi destiny',
            difference: 'Our Feng Shui service is different:',
            features: {
              notGeneric: '• Not generic Feng Shui advice',
              basedOnBazi: '• Completely customized based on your Ba Zi',
              personalized: '• Wealth and wisdom positions vary by individual',
            },
            pleaseProvide:
              'Please provide your birth information (year, month, day, time, gender) for personalized analysis.',
          },
        },
        badges: {
          dataUsed: 'Data Used',
          bazi: 'Ba Zi',
          xuankong: 'Feng Shui',
          house: 'House',
        },
      },
      forms: {
        common: {
          required: 'Required',
          optional: 'Optional',
          select: 'Please select',
          loading: 'Loading...',
          submitting: 'Submitting...',
          success: 'Success',
          error: 'Failed',
        },
      },
    },
  },
  ja: {
    QiFlow: {
      instantResult: {
        analysisComplete: '分析完了',
        yourPreview: 'あなたの命理プレビュー',
        previewDesc: '生年月日情報に基づいて生成された命理概要',
        aiSummary: 'AI 命理総括',
        yourPillars: 'あなたの八字四柱',
        elementsChart: '五行分布図',
        keyInsights: '重要な洞察',
        upgradeSection: {
          features: {
            fullReport: '完全な30ページの専門八字レポート',
            luckCycle: '流年・大運の詳細分析',
            pdfExport: 'PDF出力でいつでも閲覧',
            aiChat: 'AI質問無制限',
          },
          getFullReport: '完全なレポートを今すぐ取得',
          retry: '再試行',
          limitedOffer: '💎 期間限定：初回購入20%オフ',
        },
      },
      interpretation: {
        generateButton: '解読を生成',
        labels: {
          suggestions: '提案',
          relations: '十神関係',
          nayin: '納音',
          breakdown: '運期分解',
        },
      },
      userProfile: {
        labels: {
          displayName: '表示名',
          displayNamePlaceholder: 'あなたのニックネーム',
          gender: '性別',
          genderOptions: {
            male: '男性',
            female: '女性',
            other: 'その他',
          },
          calendar: '暦',
          calendarOptions: {
            gregorian: 'グレゴリオ暦',
            lunar: '旧暦',
          },
          birthDate: '生年月日',
          birthDateLunar: '生年月日（旧暦）',
          birthTime: '出生時刻',
          address: '出生地/住所',
          addressPlaceholder: '住所を入力、自動補完と地図選択に対応',
          email: 'メール（任意）',
          emailPlaceholder: 'you@example.com',
          phone: '電話（任意）',
          phonePlaceholder: '連絡用のみ、公開されません',
        },
        buttons: {
          openMap: '地図選択を開く',
          save: 'プロフィールを保存',
          saving: '保存中...',
        },
        hints: {
          mapSupport: '自動補完対応；地図選択はプレースホルダー版です。',
        },
        validation: {
          nameRequired: '名前を入力してください',
          dateRequired: '日付を選択してください',
          addressRequired: '住所を入力または位置を選択してください',
          invalidEmail: 'メール形式が無効です',
          submissionFailed: '送信失敗',
        },
      },
      aiChat: {
        welcome: {
          greeting: 'こんにちは！私はQiFlow AIアシスタントです。',
          coreAdvantage:
            '🌟 **コアアドバンテージ**：すべての風水分析はあなたの個人的な八字に基づいてカスタマイズされています',
          features: {
            wealth: '• 財位はあなたの日主によって決定',
            color: '• 色はあなたの用神に基づいて選択',
            direction: '• 方位はあなたの五行の好みに基づく',
          },
          instruction:
            'まず生年月日情報を提供して、本当にパーソナライズされた命理と風水のアドバイスを受けてください。',
        },
        quickQuestions: {
          bazi: '私の八字の用神は何ですか？',
          fengshui: '私の八字に基づいて、家の風水をどう配置すべきですか？',
          wealth: '私の個人的な財位はどこですか？',
          career: '今年の私の仕事運はどうですか？',
        },
        prompts: {
          inputPlaceholder: '質問を入力...',
          sendButton: '送信',
          loading: 'AIが考えています...',
        },
        responses: {
          needsInfo: 'あなたの質問に答えるには、以下の情報が必要です：',
          pleaseProvide:
            'まず関連する分析を完了するか、この情報を教えてください。正確なアドバイスを提供できます。',
          dataTypes: {
            bazi: '八字情報',
            xuankong: '風水データ',
            house: '住宅情報',
          },
          fengshuiRequiresBazi: {
            title:
              '🔔 **重要**：風水分析はあなたの八字命理に基づく必要があります',
            difference: '私たちの風水サービスは異なります：',
            features: {
              notGeneric: '• 一般的な風水アドバイスではありません',
              basedOnBazi: '• あなたの八字に完全に基づいてカスタマイズ',
              personalized: '• 財位・文昌位は個人によって異なります',
            },
            pleaseProvide:
              'パーソナライズ分析のために、生年月日情報（年月日時、性別）を提供してください。',
          },
        },
        badges: {
          dataUsed: '使用データ',
          bazi: '八字',
          xuankong: '風水',
          house: '住宅',
        },
      },
      forms: {
        common: {
          required: '必須',
          optional: '任意',
          select: '選択してください',
          loading: '読み込み中...',
          submitting: '送信中...',
          success: '成功',
          error: '失敗',
        },
      },
    },
  },
  ko: {
    QiFlow: {
      instantResult: {
        analysisComplete: '분석 완료',
        yourPreview: '당신의 명리 미리보기',
        previewDesc: '생년월일 정보를 기반으로 생성된 명리 개요',
        aiSummary: 'AI 명리 요약',
        yourPillars: '당신의 사주 사柱',
        elementsChart: '오행 분포도',
        keyInsights: '주요 통찰',
        upgradeSection: {
          features: {
            fullReport: '완전한 30페이지 전문 사주 보고서',
            luckCycle: '유년, 대운 상세 분석',
            pdfExport: 'PDF 내보내기로 언제든 확인',
            aiChat: '무제한 AI 질의응답',
          },
          getFullReport: '지금 전체 보고서 받기',
          retry: '다시 시도',
          limitedOffer: '💎 한정 특가: 첫 구매 시 20% 할인',
        },
      },
      interpretation: {
        generateButton: '해석 생성',
        labels: {
          suggestions: '제안',
          relations: '십신 관계',
          nayin: '납음',
          breakdown: '운기 분해',
        },
      },
      userProfile: {
        labels: {
          displayName: '표시 이름',
          displayNamePlaceholder: '당신의 닉네임',
          gender: '성별',
          genderOptions: {
            male: '남성',
            female: '여성',
            other: '기타',
          },
          calendar: '달력',
          calendarOptions: {
            gregorian: '양력',
            lunar: '음력',
          },
          birthDate: '생년월일',
          birthDateLunar: '생년월일 (음력)',
          birthTime: '출생 시간',
          address: '출생지/주소',
          addressPlaceholder: '주소 입력, 자동 완성 및 지도 선택 지원',
          email: '이메일 (선택사항)',
          emailPlaceholder: 'you@example.com',
          phone: '전화 (선택사항)',
          phonePlaceholder: '연락용으로만, 공개되지 않습니다',
        },
        buttons: {
          openMap: '지도 선택 열기',
          save: '프로필 저장',
          saving: '저장 중...',
        },
        hints: {
          mapSupport: '자동 완성 지원; 지도 선택은 플레이스홀더 버전입니다.',
        },
        validation: {
          nameRequired: '이름을 입력하세요',
          dateRequired: '날짜를 선택하세요',
          addressRequired: '주소를 입력하거나 위치를 선택하세요',
          invalidEmail: '이메일 형식이 잘못되었습니다',
          submissionFailed: '제출 실패',
        },
      },
      aiChat: {
        welcome: {
          greeting: '안녕하세요! 저는 QiFlow AI 어시스턴트입니다.',
          coreAdvantage:
            '🌟 **핵심 장점**: 모든 풍수 분석은 당신의 개인 사주를 기반으로 맞춤화됩니다',
          features: {
            wealth: '• 재위는 당신의 일주에 따라 결정',
            color: '• 색상은 당신의 용신에 따라 선택',
            direction: '• 방향은 당신의 오행 선호도에 기반',
          },
          instruction:
            '진정으로 개인화된 명리와 풍수 조언을 위해 먼저 생년월일 정보를 제공하세요.',
        },
        quickQuestions: {
          bazi: '내 사주의 용신은 무엇인가요?',
          fengshui: '내 사주를 기반으로 집의 풍수를 어떻게 배치해야 하나요?',
          wealth: '나의 개인 재위는 어디인가요?',
          career: '올해 나의 직업운은 어떤가요?',
        },
        prompts: {
          inputPlaceholder: '질문을 입력하세요...',
          sendButton: '보내기',
          loading: 'AI가 생각하고 있습니다...',
        },
        responses: {
          needsInfo: '질문에 답하려면 다음 정보가 필요합니다:',
          pleaseProvide:
            '먼저 관련 분석을 완료하거나 이 정보를 알려주시면 정확한 조언을 드릴 수 있습니다.',
          dataTypes: {
            bazi: '사주 정보',
            xuankong: '풍수 데이터',
            house: '주택 정보',
          },
          fengshuiRequiresBazi: {
            title:
              '🔔 **중요**: 풍수 분석은 당신의 사주 명리를 기반으로 해야 합니다',
            difference: '우리의 풍수 서비스는 다릅니다:',
            features: {
              notGeneric: '• 일반적인 풍수 조언이 아닙니다',
              basedOnBazi: '• 당신의 사주를 기반으로 완전히 맞춤화',
              personalized: '• 재위, 문창위는 개인마다 다릅니다',
            },
            pleaseProvide:
              '개인화 분석을 위해 생년월일 정보(년월일시, 성별)를 제공하세요.',
          },
        },
        badges: {
          dataUsed: '사용 데이터',
          bazi: '사주',
          xuankong: '풍수',
          house: '주택',
        },
      },
      forms: {
        common: {
          required: '필수',
          optional: '선택',
          select: '선택하세요',
          loading: '로딩 중...',
          submitting: '제출 중...',
          success: '성공',
          error: '실패',
        },
      },
    },
  },
  fr: {
    QiFlow: {
      instantResult: {
        analysisComplete: 'Analyse terminée',
        yourPreview: 'Votre aperçu du destin',
        previewDesc:
          'Aperçu du destin généré en fonction de votre date de naissance',
        aiSummary: 'Résumé du destin par IA',
        yourPillars: 'Vos quatre piliers Ba Zi',
        elementsChart: 'Graphique de distribution des cinq éléments',
        keyInsights: 'Aperçus clés',
        upgradeSection: {
          features: {
            fullReport: 'Rapport Ba Zi professionnel complet de 30 pages',
            luckCycle:
              'Analyse détaillée des cycles de chance et prévisions annuelles',
            pdfExport: 'Export PDF pour accès à tout moment',
            aiChat: 'Sessions de questions-réponses IA illimitées',
          },
          getFullReport: 'Obtenir le rapport complet maintenant',
          retry: 'Réessayer',
          limitedOffer:
            '💎 Offre limitée : 20% de réduction pour le premier achat',
        },
      },
      interpretation: {
        generateButton: "Générer l'interprétation",
        labels: {
          suggestions: 'Suggestions',
          relations: 'Relations des dix dieux',
          nayin: 'Nayin',
          breakdown: 'Répartition des périodes',
        },
      },
      userProfile: {
        labels: {
          displayName: "Nom d'affichage",
          displayNamePlaceholder: 'Votre pseudo',
          gender: 'Genre',
          genderOptions: {
            male: 'Homme',
            female: 'Femme',
            other: 'Autre',
          },
          calendar: 'Calendrier',
          calendarOptions: {
            gregorian: 'Grégorien',
            lunar: 'Lunaire',
          },
          birthDate: 'Date de naissance',
          birthDateLunar: 'Date de naissance (calendrier lunaire)',
          birthTime: 'Heure de naissance',
          address: 'Lieu de naissance/Adresse',
          addressPlaceholder:
            "Entrez l'adresse, autocomplétion et sélection sur carte supportées",
          email: 'Email (facultatif)',
          emailPlaceholder: 'vous@exemple.com',
          phone: 'Téléphone (facultatif)',
          phonePlaceholder: 'Pour contact uniquement, ne sera pas public',
        },
        buttons: {
          openMap: 'Ouvrir la sélection sur carte',
          save: 'Enregistrer le profil',
          saving: 'Enregistrement...',
        },
        hints: {
          mapSupport:
            'Autocomplétion supportée ; sélection sur carte en version placeholder.',
        },
        validation: {
          nameRequired: 'Veuillez entrer un nom',
          dateRequired: 'Veuillez sélectionner une date',
          addressRequired:
            'Veuillez entrer une adresse ou sélectionner un lieu',
          invalidEmail: "Format d'email invalide",
          submissionFailed: 'Échec de la soumission',
        },
      },
      aiChat: {
        welcome: {
          greeting: "Bonjour ! Je suis l'assistant IA QiFlow.",
          coreAdvantage:
            '🌟 **Avantage principal** : Toutes les analyses Feng Shui sont personnalisées en fonction de votre Ba Zi personnel',
          features: {
            wealth:
              '• Position de richesse déterminée par votre Maître du Jour',
            color: '• Couleurs sélectionnées selon vos éléments favorables',
            direction:
              '• Directions basées sur vos préférences des cinq éléments',
          },
          instruction:
            "Veuillez d'abord fournir vos informations de naissance pour des conseils vraiment personnalisés en matière de destin et de Feng Shui.",
        },
        quickQuestions: {
          bazi: 'Quels sont mes éléments favorables dans le Ba Zi ?',
          fengshui:
            'Comment organiser le Feng Shui chez moi en fonction de mon Ba Zi ?',
          wealth: 'Où se trouve ma position de richesse personnelle ?',
          career: 'Comment sera ma chance professionnelle cette année ?',
        },
        prompts: {
          inputPlaceholder: 'Entrez votre question...',
          sendButton: 'Envoyer',
          loading: "L'IA réfléchit...",
        },
        responses: {
          needsInfo:
            "Pour répondre à votre question, j'ai besoin des informations suivantes :",
          pleaseProvide:
            "Veuillez d'abord compléter l'analyse pertinente, ou fournissez-moi ces informations pour des conseils précis.",
          dataTypes: {
            bazi: 'Informations Ba Zi',
            xuankong: 'Données Feng Shui',
            house: 'Informations sur la maison',
          },
          fengshuiRequiresBazi: {
            title:
              "🔔 **Important** : L'analyse Feng Shui doit être basée sur votre destin Ba Zi",
            difference: 'Notre service Feng Shui est différent :',
            features: {
              notGeneric: '• Pas de conseils Feng Shui génériques',
              basedOnBazi:
                '• Complètement personnalisé en fonction de votre Ba Zi',
              personalized:
                "• Les positions de richesse et de sagesse varient selon l'individu",
            },
            pleaseProvide:
              'Veuillez fournir vos informations de naissance (année, mois, jour, heure, sexe) pour une analyse personnalisée.',
          },
        },
        badges: {
          dataUsed: 'Données utilisées',
          bazi: 'Ba Zi',
          xuankong: 'Feng Shui',
          house: 'Maison',
        },
      },
      forms: {
        common: {
          required: 'Obligatoire',
          optional: 'Facultatif',
          select: 'Veuillez sélectionner',
          loading: 'Chargement...',
          submitting: 'Soumission...',
          success: 'Succès',
          error: 'Échec',
        },
      },
    },
  },
  ms: {
    QiFlow: {
      instantResult: {
        analysisComplete: 'Analisis Selesai',
        yourPreview: 'Pratonton Nasib Anda',
        previewDesc:
          'Ringkasan nasib yang dijana berdasarkan maklumat kelahiran anda',
        aiSummary: 'Ringkasan Nasib AI',
        yourPillars: 'Empat Tiang Ba Zi Anda',
        elementsChart: 'Carta Taburan Lima Elemen',
        keyInsights: 'Cerapan Utama',
        upgradeSection: {
          features: {
            fullReport: 'Laporan Ba Zi Profesional Lengkap 30 Halaman',
            luckCycle: 'Analisis Terperinci Kitaran Nasib dan Ramalan Tahunan',
            pdfExport: 'Eksport PDF untuk Akses Bila-bila Masa',
            aiChat: 'Sesi Soal Jawab AI Tanpa Had',
          },
          getFullReport: 'Dapatkan Laporan Penuh Sekarang',
          retry: 'Cuba Lagi',
          limitedOffer:
            '💎 Tawaran Terhad: 20% DISKAUN untuk Pembelian Pertama',
        },
      },
      interpretation: {
        generateButton: 'Jana Tafsiran',
        labels: {
          suggestions: 'Cadangan',
          relations: 'Hubungan Sepuluh Dewa',
          nayin: 'Nayin',
          breakdown: 'Pecahan Tempoh',
        },
      },
      userProfile: {
        labels: {
          displayName: 'Nama Paparan',
          displayNamePlaceholder: 'Nama samaran anda',
          gender: 'Jantina',
          genderOptions: {
            male: 'Lelaki',
            female: 'Perempuan',
            other: 'Lain-lain',
          },
          calendar: 'Kalendar',
          calendarOptions: {
            gregorian: 'Gregorian',
            lunar: 'Lunar',
          },
          birthDate: 'Tarikh Lahir',
          birthDateLunar: 'Tarikh Lahir (Kalendar Lunar)',
          birthTime: 'Masa Lahir',
          address: 'Tempat Lahir/Alamat',
          addressPlaceholder:
            'Masukkan alamat, menyokong autolengkap dan pemilihan peta',
          email: 'E-mel (Pilihan)',
          emailPlaceholder: 'anda@contoh.com',
          phone: 'Telefon (Pilihan)',
          phonePlaceholder: 'Untuk hubungan sahaja, tidak akan didedahkan',
        },
        buttons: {
          openMap: 'Buka Pemilihan Peta',
          save: 'Simpan Profil',
          saving: 'Menyimpan...',
        },
        hints: {
          mapSupport:
            'Autolengkap disokong; pemilihan peta adalah versi placeholder.',
        },
        validation: {
          nameRequired: 'Sila masukkan nama',
          dateRequired: 'Sila pilih tarikh',
          addressRequired: 'Sila masukkan alamat atau pilih lokasi',
          invalidEmail: 'Format e-mel tidak sah',
          submissionFailed: 'Penghantaran gagal',
        },
      },
      aiChat: {
        welcome: {
          greeting: 'Helo! Saya adalah Pembantu AI QiFlow.',
          coreAdvantage:
            '🌟 **Kelebihan Teras**: Semua analisis Feng Shui disesuaikan berdasarkan Ba Zi peribadi anda',
          features: {
            wealth: '• Kedudukan kekayaan ditentukan oleh Day Master anda',
            color: '• Warna dipilih berdasarkan elemen yang baik untuk anda',
            direction: '• Arah berdasarkan keutamaan lima elemen anda',
          },
          instruction:
            'Sila berikan maklumat kelahiran anda terlebih dahulu untuk nasihat nasib dan Feng Shui yang benar-benar diperibadikan.',
        },
        quickQuestions: {
          bazi: 'Apakah elemen yang baik untuk saya dalam Ba Zi?',
          fengshui:
            'Berdasarkan Ba Zi saya, bagaimana saya harus menyusun Feng Shui di rumah?',
          wealth: 'Di manakah kedudukan kekayaan peribadi saya?',
          career: 'Bagaimanakah nasib kerjaya saya tahun ini?',
        },
        prompts: {
          inputPlaceholder: 'Masukkan soalan anda...',
          sendButton: 'Hantar',
          loading: 'AI sedang berfikir...',
        },
        responses: {
          needsInfo:
            'Untuk menjawab soalan anda, saya memerlukan maklumat berikut:',
          pleaseProvide:
            'Sila lengkapkan analisis yang berkaitan terlebih dahulu, atau berikan maklumat ini kepada saya untuk nasihat yang tepat.',
          dataTypes: {
            bazi: 'Maklumat Ba Zi',
            xuankong: 'Data Feng Shui',
            house: 'Maklumat Rumah',
          },
          fengshuiRequiresBazi: {
            title:
              '🔔 **Penting**: Analisis Feng Shui mesti berdasarkan nasib Ba Zi anda',
            difference: 'Perkhidmatan Feng Shui kami berbeza:',
            features: {
              notGeneric: '• Bukan nasihat Feng Shui generik',
              basedOnBazi: '• Disesuaikan sepenuhnya berdasarkan Ba Zi anda',
              personalized:
                '• Kedudukan kekayaan dan kebijaksanaan berbeza mengikut individu',
            },
            pleaseProvide:
              'Sila berikan maklumat kelahiran anda (tahun, bulan, hari, masa, jantina) untuk analisis yang diperibadikan.',
          },
        },
        badges: {
          dataUsed: 'Data Digunakan',
          bazi: 'Ba Zi',
          xuankong: 'Feng Shui',
          house: 'Rumah',
        },
      },
      forms: {
        common: {
          required: 'Diperlukan',
          optional: 'Pilihan',
          select: 'Sila pilih',
          loading: 'Memuatkan...',
          submitting: 'Menghantar...',
          success: 'Berjaya',
          error: 'Gagal',
        },
      },
    },
  },
};

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
async function addQiFlowTranslations() {
  console.log('🚀 开始添加 QiFlow 核心组件翻译...\n');

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

      console.log(`✅ ${lang}: QiFlow 翻译已成功添加`);
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
  console.log('\n✨ QiFlow 核心组件国际化完成！');
  console.log('\n💡 提示:');
  console.log('   1. 清除 Next.js 缓存: Remove-Item -Recurse -Force .next');
  console.log('   2. 重启开发服务器: npm run dev');
  console.log('   3. 在浏览器中测试所有组件和语言切换');
}

// 执行
addQiFlowTranslations().catch(console.error);
