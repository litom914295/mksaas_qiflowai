# 表单组件库

本模块提供了完整的用户信息管理表单组件，支持多语言、数据验证、地图集成和隐私保护。

## 核心组件

### 1. UserProfileForm

主要的用户资料表单组件，支持注册、编辑和游客模式。

```typescript
import { UserProfileForm } from '@/components/forms/user-profile-form-new';

<UserProfileForm
  mode="profile" // 'registration' | 'profile' | 'guest'
  showProgress={true}
  defaultValues={{
    displayName: '用户名',
    email: 'user@example.com',
  }}
  onSubmit={async (data) => {
    // 处理表单提交
    console.log('表单数据:', data);
  }}
/>
```

**功能特性**:
- 支持公历/农历日期选择
- 地图地址选择器
- 实时表单验证
- 进度条显示
- 信息完整度提示
- 隐私保护模式

### 2. CalendarPicker

支持公历和农历的日期选择器。

```typescript
import { CalendarPicker } from '@/components/forms/calendar-picker';

<CalendarPicker
  value={birthDate}
  onChange={setBirthDate}
  calendarType="gregorian" // 'gregorian' | 'lunar'
  placeholder="选择出生日期"
/>
```

**功能特性**:
- 公历/农历切换
- 月份导航
- 日期网格显示
- 农历日期显示（需要 API 支持）
- 响应式设计

### 3. TimePicker

精确的时间选择器，支持小时、分钟和秒。

```typescript
import { TimePicker } from '@/components/forms/time-picker';

<TimePicker
  value={birthTime}
  onChange={setBirthTime}
  showSeconds={false}
  format24Hour={true}
  placeholder="选择出生时间"
/>
```

**功能特性**:
- 24小时/12小时格式
- 可选秒数显示
- 快捷时间选择
- 滚动选择器
- 键盘导航支持

### 4. AddressAutocomplete

智能地址自动完成组件。

```typescript
import { AddressAutocomplete } from '@/components/forms/address-autocomplete';

<AddressAutocomplete
  value={address}
  onChange={setAddress}
  onPick={handleAddressPick}
  placeholder="输入地址"
/>
```

**功能特性**:
- 地址自动完成
- 防抖搜索
- 下拉建议列表
- 点击选择
- 键盘导航

### 5. MapPicker

地图位置选择器（占位实现）。

```typescript
import { MapPicker } from '@/components/forms/map-picker';

<MapPicker
  open={isMapOpen}
  onClose={() => setIsMapOpen(false)}
  onConfirm={handleMapConfirm}
  initial={{ address: '初始地址', latitude: 31.2304, longitude: 121.4737 }}
/>
```

**功能特性**:
- 模态对话框
- 地址输入
- 坐标输入
- 确认/取消操作
- 后续将集成 Mapbox/高德地图

### 6. ProgressBar

进度条组件，显示表单完成度。

```typescript
import { ProgressBar } from '@/components/forms/progress-bar';

<ProgressBar
  steps={[
    { id: 'name', label: '基本信息', completed: true },
    { id: 'birth', label: '出生信息', completed: false },
    { id: 'location', label: '出生地点', completed: false },
  ]}
  showLabels={true}
  orientation="horizontal"
/>
```

**功能特性**:
- 水平/垂直布局
- 步骤指示器
- 完成状态显示
- 可选步骤标记
- 进度百分比

### 7. InfoTooltip

信息提示工具，提供字段说明。

```typescript
import { InfoTooltip } from '@/components/forms/info-tooltip';

<InfoTooltip
  content="这是字段的详细说明"
  title="字段说明"
  position="top"
>
  <HelpCircle className="w-4 h-4" />
</InfoTooltip>
```

**功能特性**:
- 多方向定位
- 富文本内容
- 自动位置调整
- 点击/悬停触发
- 无障碍支持

## 表单验证

使用 Zod 进行类型安全的表单验证：

```typescript
const profileSchema = z.object({
  displayName: z.string().min(1, '请输入名称'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  calendar: z.enum(['gregorian', 'lunar']).default('gregorian'),
  birthDate: z.string().min(1, '请选择日期'),
  birthTime: z.string().optional(),
  address: z.string().min(1, '请输入地址或选择位置'),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().optional(),
});
```

## 国际化支持

所有组件都支持多语言：

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('forms');

// 使用翻译
<label>{t('displayName')}</label>
<input placeholder={t('displayNamePlaceholder')} />
```

## 数据加密

敏感数据通过 API 自动加密：

```typescript
// 敏感数据更新
await authManager.updateSensitiveData({
  birthDate: '1990-01-01',
  birthTime: '12:00',
  birthLocation: '北京市',
  phone: '+86 138 0000 0000',
  currentPassword: 'currentPassword',
});
```

## 使用示例

### 注册表单

```typescript
function RegistrationForm() {
  const handleSubmit = async (data) => {
    try {
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // 注册成功
    } catch (error) {
      // 处理错误
    }
  };

  return (
    <UserProfileForm
      mode="registration"
      showProgress={true}
      onSubmit={handleSubmit}
    />
  );
}
```

### 资料编辑

```typescript
function ProfileEditForm({ user }) {
  const handleSubmit = async (data) => {
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          data: {
            displayName: data.displayName,
            preferredLocale: 'zh-CN',
            timezone: 'Asia/Shanghai',
          },
        }),
      });
      // 更新成功
    } catch (error) {
      // 处理错误
    }
  };

  return (
    <UserProfileForm
      mode="profile"
      defaultValues={{
        displayName: user.displayName,
        email: user.email,
      }}
      onSubmit={handleSubmit}
    />
  );
}
```

### 游客模式

```typescript
function GuestProfileForm() {
  const handleSubmit = async (data) => {
    try {
      // 保存到游客会话
      await fetch('/api/guest/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // 保存成功
    } catch (error) {
      // 处理错误
    }
  };

  return (
    <UserProfileForm
      mode="guest"
      showProgress={true}
      onSubmit={handleSubmit}
    />
  );
}
```

## 样式定制

组件使用 Tailwind CSS，支持自定义样式：

```typescript
<UserProfileForm
  className="max-w-4xl mx-auto"
  // 其他属性
/>
```

## 无障碍支持

所有组件都遵循无障碍设计原则：

- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度支持
- 焦点管理
- ARIA 标签

## 性能优化

- 防抖搜索
- 懒加载组件
- 虚拟滚动（大列表）
- 内存泄漏防护
- 组件缓存

## 最佳实践

### 1. 表单验证

```typescript
// 使用 Zod 进行验证
const schema = z.object({
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, '手机号格式不正确'),
});

// 实时验证
const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### 2. 错误处理

```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (data) => {
  setError(null);
  try {
    await onSubmit(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : '提交失败');
  }
};
```

### 3. 加载状态

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    await onSubmit(data);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 4. 数据持久化

```typescript
// 自动保存草稿
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('form-draft', JSON.stringify(watchedValues));
  }, 1000);
  
  return () => clearTimeout(timer);
}, [watchedValues]);
```

## 故障排除

### 常见问题

1. **表单验证失败**
   - 检查 Zod 模式定义
   - 确认字段名称匹配
   - 验证数据类型

2. **地图组件不显示**
   - 检查 API 密钥配置
   - 确认网络连接
   - 查看控制台错误

3. **国际化不生效**
   - 检查翻译文件
   - 确认语言设置
   - 验证 useTranslations 使用

4. **样式问题**
   - 检查 Tailwind 配置
   - 确认 CSS 类名
   - 验证响应式断点

### 调试工具

```typescript
// 启用表单调试
const { watch, formState } = useForm();
console.log('表单状态:', formState);
console.log('当前值:', watch());
```
