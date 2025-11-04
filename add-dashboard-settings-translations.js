const fs = require('fs');
const path = require('path');

// 定义各语言的翻译
const translations = {
  'zh-CN': {
    Dashboard: {
      upgrade: {
        title: '升级账户',
        description: '解锁更多功能和积分',
        button: '立即升级',
      },
      sidebar: {
        main: '主要功能',
        settings: '设置',
        admin: '管理',
      },
      settings: {
        profile: {
          name: {
            title: '显示名称',
            description: '这是您在平台上显示的名称',
            placeholder: '请输入您的显示名称',
            hint: '请使用您的真实姓名或昵称',
            save: '保存',
            saving: '保存中...',
            success: '名称更新成功',
            fail: '名称更新失败',
            minLength: '名称至少需要3个字符',
            maxLength: '名称最多30个字符',
          },
          avatar: {
            title: '头像',
            description: '更新您的个人头像',
            upload: '上传头像',
            uploading: '上传中...',
            success: '头像更新成功',
            fail: '头像更新失败',
            fileTooLarge: '文件过大，请选择小于2MB的图片',
            invalidFormat: '不支持的文件格式',
          },
        },
        security: {
          password: {
            title: '修改密码',
            description: '定期更改密码以保护账户安全',
            currentPassword: '当前密码',
            newPassword: '新密码',
            confirmPassword: '确认新密码',
            currentPasswordPlaceholder: '请输入当前密码',
            newPasswordPlaceholder: '请输入新密码',
            confirmPasswordPlaceholder: '请再次输入新密码',
            hint: '密码至少需要8个字符',
            save: '更新密码',
            saving: '更新中...',
            success: '密码更新成功',
            fail: '密码更新失败',
            passwordsNotMatch: '两次输入的密码不一致',
            weakPassword: '密码强度不够',
            wrongCurrentPassword: '当前密码错误',
          },
          deleteAccount: {
            title: '删除账户',
            description: '永久删除您的账户和所有数据',
            warning: '⚠️ 此操作无法撤销',
            confirmText: '我理解此操作无法撤销',
            deleteButton: '删除账户',
            deleting: '删除中...',
            success: '账户已删除',
            fail: '账户删除失败',
          },
        },
        credits: {
          balance: {
            title: '积分余额',
            description: '您当前的可用积分',
            creditsAdded: '积分充值成功',
            retry: '重试',
            expiringCredits: '{credits}积分将在{days}天内过期',
          },
          packages: {
            title: '购买积分',
            description: '选择适合您的积分套餐',
            credits: '积分',
            popular: '热门',
            buyNow: '立即购买',
            buying: '购买中...',
            bonus: '赠送 {amount} 积分',
          },
          transactions: {
            title: '交易记录',
            description: '查看您的积分使用历史',
            date: '日期',
            type: '类型',
            amount: '数量',
            balance: '余额',
            description_col: '说明',
            noTransactions: '暂无交易记录',
            loadMore: '加载更多',
            types: {
              purchase: '购买',
              consume: '消耗',
              refund: '退款',
              bonus: '赠送',
              signin: '签到',
            },
          },
        },
        billing: {
          title: '账单管理',
          description: '管理您的订阅和支付方式',
          currentPlan: '当前套餐',
          nextBilling: '下次扣费',
          cancel: '取消订阅',
          upgrade: '升级套餐',
          paymentMethod: '支付方式',
          addPaymentMethod: '添加支付方式',
          billingHistory: '账单历史',
          invoice: '发票',
          download: '下载',
          paid: '已支付',
          pending: '待支付',
        },
        notification: {
          title: '通知设置',
          description: '管理您的通知偏好',
          email: {
            title: '邮件通知',
            marketing: '营销邮件',
            updates: '产品更新',
            newsletters: '订阅新闻',
            tips: '使用技巧',
          },
          push: {
            title: '推送通知',
            analysis: '分析完成',
            credits: '积分变动',
            system: '系统通知',
          },
          save: '保存设置',
          saving: '保存中...',
          success: '设置已保存',
          fail: '保存失败',
        },
      },
    },
  },
  en: {
    Dashboard: {
      upgrade: {
        title: 'Upgrade Account',
        description: 'Unlock more features and credits',
        button: 'Upgrade Now',
      },
      sidebar: {
        main: 'Main',
        settings: 'Settings',
        admin: 'Admin',
      },
      settings: {
        profile: {
          name: {
            title: 'Display Name',
            description: 'This is your display name on the platform',
            placeholder: 'Enter your display name',
            hint: 'Please use your real name or nickname',
            save: 'Save',
            saving: 'Saving...',
            success: 'Name updated successfully',
            fail: 'Failed to update name',
            minLength: 'Name must be at least 3 characters',
            maxLength: 'Name must be at most 30 characters',
          },
          avatar: {
            title: 'Avatar',
            description: 'Update your profile picture',
            upload: 'Upload Avatar',
            uploading: 'Uploading...',
            success: 'Avatar updated successfully',
            fail: 'Failed to update avatar',
            fileTooLarge:
              'File too large, please select an image smaller than 2MB',
            invalidFormat: 'Unsupported file format',
          },
        },
        security: {
          password: {
            title: 'Change Password',
            description:
              'Change your password regularly to keep your account secure',
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            confirmPassword: 'Confirm New Password',
            currentPasswordPlaceholder: 'Enter current password',
            newPasswordPlaceholder: 'Enter new password',
            confirmPasswordPlaceholder: 'Enter new password again',
            hint: 'Password must be at least 8 characters',
            save: 'Update Password',
            saving: 'Updating...',
            success: 'Password updated successfully',
            fail: 'Failed to update password',
            passwordsNotMatch: 'Passwords do not match',
            weakPassword: 'Password is too weak',
            wrongCurrentPassword: 'Current password is incorrect',
          },
          deleteAccount: {
            title: 'Delete Account',
            description: 'Permanently delete your account and all data',
            warning: '⚠️ This action cannot be undone',
            confirmText: 'I understand this action cannot be undone',
            deleteButton: 'Delete Account',
            deleting: 'Deleting...',
            success: 'Account deleted',
            fail: 'Failed to delete account',
          },
        },
        credits: {
          balance: {
            title: 'Credits Balance',
            description: 'Your current available credits',
            creditsAdded: 'Credits added successfully',
            retry: 'Retry',
            expiringCredits: '{credits} credits will expire in {days} days',
          },
          packages: {
            title: 'Buy Credits',
            description: 'Choose a credits package that suits you',
            credits: 'Credits',
            popular: 'Popular',
            buyNow: 'Buy Now',
            buying: 'Buying...',
            bonus: 'Bonus {amount} credits',
          },
          transactions: {
            title: 'Transaction History',
            description: 'View your credits usage history',
            date: 'Date',
            type: 'Type',
            amount: 'Amount',
            balance: 'Balance',
            description_col: 'Description',
            noTransactions: 'No transactions yet',
            loadMore: 'Load More',
            types: {
              purchase: 'Purchase',
              consume: 'Consume',
              refund: 'Refund',
              bonus: 'Bonus',
              signin: 'Sign In',
            },
          },
        },
        billing: {
          title: 'Billing Management',
          description: 'Manage your subscription and payment methods',
          currentPlan: 'Current Plan',
          nextBilling: 'Next Billing',
          cancel: 'Cancel Subscription',
          upgrade: 'Upgrade Plan',
          paymentMethod: 'Payment Method',
          addPaymentMethod: 'Add Payment Method',
          billingHistory: 'Billing History',
          invoice: 'Invoice',
          download: 'Download',
          paid: 'Paid',
          pending: 'Pending',
        },
        notification: {
          title: 'Notification Settings',
          description: 'Manage your notification preferences',
          email: {
            title: 'Email Notifications',
            marketing: 'Marketing Emails',
            updates: 'Product Updates',
            newsletters: 'Newsletters',
            tips: 'Tips & Tricks',
          },
          push: {
            title: 'Push Notifications',
            analysis: 'Analysis Complete',
            credits: 'Credits Changes',
            system: 'System Notifications',
          },
          save: 'Save Settings',
          saving: 'Saving...',
          success: 'Settings saved',
          fail: 'Failed to save',
        },
      },
    },
  },
  'zh-TW': {
    Dashboard: {
      upgrade: {
        title: '升級帳戶',
        description: '解鎖更多功能和積分',
        button: '立即升級',
      },
      sidebar: {
        main: '主要功能',
        settings: '設置',
        admin: '管理',
      },
      settings: {
        profile: {
          name: {
            title: '顯示名稱',
            description: '這是您在平台上顯示的名稱',
            placeholder: '請輸入您的顯示名稱',
            hint: '請使用您的真實姓名或暱稱',
            save: '保存',
            saving: '保存中...',
            success: '名稱更新成功',
            fail: '名稱更新失敗',
            minLength: '名稱至少需要3個字符',
            maxLength: '名稱最多30個字符',
          },
          avatar: {
            title: '頭像',
            description: '更新您的個人頭像',
            upload: '上傳頭像',
            uploading: '上傳中...',
            success: '頭像更新成功',
            fail: '頭像更新失敗',
            fileTooLarge: '文件過大，請選擇小於2MB的圖片',
            invalidFormat: '不支持的文件格式',
          },
        },
        security: {
          password: {
            title: '修改密碼',
            description: '定期更改密碼以保護帳戶安全',
            currentPassword: '當前密碼',
            newPassword: '新密碼',
            confirmPassword: '確認新密碼',
            currentPasswordPlaceholder: '請輸入當前密碼',
            newPasswordPlaceholder: '請輸入新密碼',
            confirmPasswordPlaceholder: '請再次輸入新密碼',
            hint: '密碼至少需要8個字符',
            save: '更新密碼',
            saving: '更新中...',
            success: '密碼更新成功',
            fail: '密碼更新失敗',
            passwordsNotMatch: '兩次輸入的密碼不一致',
            weakPassword: '密碼強度不夠',
            wrongCurrentPassword: '當前密碼錯誤',
          },
          deleteAccount: {
            title: '刪除帳戶',
            description: '永久刪除您的帳戶和所有數據',
            warning: '⚠️ 此操作無法撤銷',
            confirmText: '我理解此操作無法撤銷',
            deleteButton: '刪除帳戶',
            deleting: '刪除中...',
            success: '帳戶已刪除',
            fail: '帳戶刪除失敗',
          },
        },
        credits: {
          balance: {
            title: '積分餘額',
            description: '您當前的可用積分',
            creditsAdded: '積分充值成功',
            retry: '重試',
            expiringCredits: '{credits}積分將在{days}天內過期',
          },
          packages: {
            title: '購買積分',
            description: '選擇適合您的積分套餐',
            credits: '積分',
            popular: '熱門',
            buyNow: '立即購買',
            buying: '購買中...',
            bonus: '贈送 {amount} 積分',
          },
          transactions: {
            title: '交易記錄',
            description: '查看您的積分使用歷史',
            date: '日期',
            type: '類型',
            amount: '數量',
            balance: '餘額',
            description_col: '說明',
            noTransactions: '暫無交易記錄',
            loadMore: '加載更多',
            types: {
              purchase: '購買',
              consume: '消耗',
              refund: '退款',
              bonus: '贈送',
              signin: '簽到',
            },
          },
        },
        billing: {
          title: '賬單管理',
          description: '管理您的訂閱和支付方式',
          currentPlan: '當前套餐',
          nextBilling: '下次扣費',
          cancel: '取消訂閱',
          upgrade: '升級套餐',
          paymentMethod: '支付方式',
          addPaymentMethod: '添加支付方式',
          billingHistory: '賬單歷史',
          invoice: '發票',
          download: '下載',
          paid: '已支付',
          pending: '待支付',
        },
        notification: {
          title: '通知設置',
          description: '管理您的通知偏好',
          email: {
            title: '郵件通知',
            marketing: '營銷郵件',
            updates: '產品更新',
            newsletters: '訂閱新聞',
            tips: '使用技巧',
          },
          push: {
            title: '推送通知',
            analysis: '分析完成',
            credits: '積分變動',
            system: '系統通知',
          },
          save: '保存設置',
          saving: '保存中...',
          success: '設置已保存',
          fail: '保存失敗',
        },
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

    // 添加 Dashboard 翻译
    existingContent.Dashboard = localeTranslations.Dashboard;
    console.log(`✅ Added Dashboard translations for locale: ${locale}`);

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

console.log('\n🎉 Dashboard and Settings translations update completed!');
