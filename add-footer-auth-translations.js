const fs = require('fs');
const path = require('path');

// 定义各语言的翻译
const translations = {
  'zh-CN': {
    Marketing: {
      footer: {
        tagline: '结合传统智慧与现代AI技术的智能风水分析平台',
        product: {
          title: '产品',
          items: {
            features: '功能特性',
            pricing: '价格方案',
            faq: '常见问题',
          },
        },
        resources: {
          title: '资源',
          items: {
            blog: '博客',
            docs: '文档',
            changelog: '更新日志',
            roadmap: '产品路线图',
          },
        },
        company: {
          title: '公司',
          items: {
            about: '关于我们',
            contact: '联系我们',
            waitlist: '候补名单',
          },
        },
        legal: {
          title: '法律',
          items: {
            cookiePolicy: 'Cookie 政策',
            privacyPolicy: '隐私政策',
            termsOfService: '服务条款',
          },
        },
      },
    },
    AuthPage: {
      login: {
        welcomeBack: '欢迎回来',
        signUpHint: '还没有账号？立即注册',
        email: '邮箱',
        password: '密码',
        emailRequired: '请输入有效的邮箱地址',
        passwordRequired: '请输入密码',
        captchaInvalid: '验证码无效，请重试',
        showPassword: '显示密码',
        hidePassword: '隐藏密码',
        forgotPassword: '忘记密码？',
        signIn: '登录',
        signInWith: '使用 {provider} 登录',
        orContinueWith: '或继续使用',
      },
      register: {
        createAccount: '创建账户',
        signInHint: '已有账号？立即登录',
        name: '姓名',
        email: '邮箱',
        password: '密码',
        nameRequired: '请输入姓名',
        emailRequired: '请输入有效的邮箱地址',
        passwordRequired: '请输入密码',
        captchaInvalid: '验证码无效，请重试',
        showPassword: '显示密码',
        hidePassword: '隐藏密码',
        signUp: '注册',
        signUpWith: '使用 {provider} 注册',
        orContinueWith: '或继续使用',
        checkEmail: '请检查您的邮箱以验证账户',
        signUpFailed: '注册失败，请稍后重试',
        userAlreadyExists: '该邮箱已被注册，请使用其他邮箱',
        invalidEmail: '邮箱格式不正确',
        weakPassword: '密码强度不够，请使用更复杂的密码',
      },
      forgotPassword: {
        title: '忘记密码',
        backToLogin: '返回登录',
        email: '邮箱',
        emailRequired: '请输入有效的邮箱地址',
        sendResetLink: '发送重置链接',
        checkEmail: '请检查您的邮箱获取密码重置链接',
      },
      resetPassword: {
        title: '重置密码',
        newPassword: '新密码',
        confirmPassword: '确认密码',
        passwordRequired: '请输入新密码',
        passwordsNotMatch: '两次输入的密码不一致',
        resetPassword: '重置密码',
        passwordResetSuccess: '密码重置成功',
      },
    },
  },
  en: {
    Marketing: {
      footer: {
        tagline:
          'Intelligent Feng Shui analysis platform combining traditional wisdom with modern AI technology',
        product: {
          title: 'Product',
          items: {
            features: 'Features',
            pricing: 'Pricing',
            faq: 'FAQ',
          },
        },
        resources: {
          title: 'Resources',
          items: {
            blog: 'Blog',
            docs: 'Documentation',
            changelog: 'Changelog',
            roadmap: 'Roadmap',
          },
        },
        company: {
          title: 'Company',
          items: {
            about: 'About',
            contact: 'Contact',
            waitlist: 'Waitlist',
          },
        },
        legal: {
          title: 'Legal',
          items: {
            cookiePolicy: 'Cookie Policy',
            privacyPolicy: 'Privacy Policy',
            termsOfService: 'Terms of Service',
          },
        },
      },
    },
    AuthPage: {
      login: {
        welcomeBack: 'Welcome Back',
        signUpHint: "Don't have an account? Sign up now",
        email: 'Email',
        password: 'Password',
        emailRequired: 'Please enter a valid email address',
        passwordRequired: 'Please enter your password',
        captchaInvalid: 'Invalid captcha, please try again',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        forgotPassword: 'Forgot password?',
        signIn: 'Sign In',
        signInWith: 'Sign in with {provider}',
        orContinueWith: 'Or continue with',
      },
      register: {
        createAccount: 'Create Account',
        signInHint: 'Already have an account? Sign in now',
        name: 'Name',
        email: 'Email',
        password: 'Password',
        nameRequired: 'Please enter your name',
        emailRequired: 'Please enter a valid email address',
        passwordRequired: 'Please enter your password',
        captchaInvalid: 'Invalid captcha, please try again',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        signUp: 'Sign Up',
        signUpWith: 'Sign up with {provider}',
        orContinueWith: 'Or continue with',
        checkEmail: 'Please check your email to verify your account',
        signUpFailed: 'Sign up failed, please try again later',
        userAlreadyExists:
          'This email is already registered, please use another email',
        invalidEmail: 'Invalid email format',
        weakPassword: 'Password is too weak, please use a stronger password',
      },
      forgotPassword: {
        title: 'Forgot Password',
        backToLogin: 'Back to Login',
        email: 'Email',
        emailRequired: 'Please enter a valid email address',
        sendResetLink: 'Send Reset Link',
        checkEmail: 'Please check your email for password reset link',
      },
      resetPassword: {
        title: 'Reset Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        passwordRequired: 'Please enter new password',
        passwordsNotMatch: 'Passwords do not match',
        resetPassword: 'Reset Password',
        passwordResetSuccess: 'Password reset successfully',
      },
    },
  },
  'zh-TW': {
    Marketing: {
      footer: {
        tagline: '結合傳統智慧與現代AI技術的智能風水分析平台',
        product: {
          title: '產品',
          items: {
            features: '功能特性',
            pricing: '價格方案',
            faq: '常見問題',
          },
        },
        resources: {
          title: '資源',
          items: {
            blog: '部落格',
            docs: '文檔',
            changelog: '更新日誌',
            roadmap: '產品路線圖',
          },
        },
        company: {
          title: '公司',
          items: {
            about: '關於我們',
            contact: '聯繫我們',
            waitlist: '候補名單',
          },
        },
        legal: {
          title: '法律',
          items: {
            cookiePolicy: 'Cookie 政策',
            privacyPolicy: '隱私政策',
            termsOfService: '服務條款',
          },
        },
      },
    },
    AuthPage: {
      login: {
        welcomeBack: '歡迎回來',
        signUpHint: '還沒有帳號？立即註冊',
        email: '郵箱',
        password: '密碼',
        emailRequired: '請輸入有效的郵箱地址',
        passwordRequired: '請輸入密碼',
        captchaInvalid: '驗證碼無效，請重試',
        showPassword: '顯示密碼',
        hidePassword: '隱藏密碼',
        forgotPassword: '忘記密碼？',
        signIn: '登錄',
        signInWith: '使用 {provider} 登錄',
        orContinueWith: '或繼續使用',
      },
      register: {
        createAccount: '創建帳戶',
        signInHint: '已有帳號？立即登錄',
        name: '姓名',
        email: '郵箱',
        password: '密碼',
        nameRequired: '請輸入姓名',
        emailRequired: '請輸入有效的郵箱地址',
        passwordRequired: '請輸入密碼',
        captchaInvalid: '驗證碼無效，請重試',
        showPassword: '顯示密碼',
        hidePassword: '隱藏密碼',
        signUp: '註冊',
        signUpWith: '使用 {provider} 註冊',
        orContinueWith: '或繼續使用',
        checkEmail: '請檢查您的郵箱以驗證帳戶',
        signUpFailed: '註冊失敗，請稍後重試',
        userAlreadyExists: '該郵箱已被註冊，請使用其他郵箱',
        invalidEmail: '郵箱格式不正確',
        weakPassword: '密碼強度不夠，請使用更複雜的密碼',
      },
      forgotPassword: {
        title: '忘記密碼',
        backToLogin: '返回登錄',
        email: '郵箱',
        emailRequired: '請輸入有效的郵箱地址',
        sendResetLink: '發送重置鏈接',
        checkEmail: '請檢查您的郵箱獲取密碼重置鏈接',
      },
      resetPassword: {
        title: '重置密碼',
        newPassword: '新密碼',
        confirmPassword: '確認密碼',
        passwordRequired: '請輸入新密碼',
        passwordsNotMatch: '兩次輸入的密碼不一致',
        resetPassword: '重置密碼',
        passwordResetSuccess: '密碼重置成功',
      },
    },
  },
  // 其他语言使用英文作为后备，脚本会自动处理
};

// 获取所有语言文件
const localesDir = path.join(__dirname, 'src', 'locales');
const localeFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith('.json'));

console.log('Found locale files:', localeFiles);

localeFiles.forEach((file) => {
  const filePath = path.join(localesDir, file);
  const locale = path.basename(file, '.json');

  console.log(`\nProcessing ${file} (locale: ${locale})`);

  try {
    // 读取现有的翻译文件
    const existingContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // 获取对应语言的翻译
    const localeTranslations = translations[locale] || translations.en;

    // 添加 Marketing.footer 翻译
    if (!existingContent.Marketing) {
      existingContent.Marketing = {};
    }
    existingContent.Marketing.footer = localeTranslations.Marketing.footer;
    console.log(`✅ Added Marketing.footer translations for locale: ${locale}`);

    // 添加 AuthPage 翻译
    existingContent.AuthPage = localeTranslations.AuthPage;
    console.log(`✅ Added AuthPage translations for locale: ${locale}`);

    // 写回文件
    fs.writeFileSync(
      filePath,
      JSON.stringify(existingContent, null, 2),
      'utf8'
    );
    console.log(`✅ Updated ${file} successfully`);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n🎉 Footer and Auth translations update completed!');
