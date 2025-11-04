# 双引擎改造实施指南 - Phase 1 核心功能

## ✅ 已完成（Phase 0）

### 1. CreditsManager 扩展
- ✅ 文件：`src/lib/credits/manager.ts`
- ✅ 新增类型：`XuankongMode`
- ✅ 新增计费：5种玄空分析模式（20/30/50/80/120积分）
- ✅ 新增方法：`selectXuankongMode()` - 智能推荐
- ✅ 新增方法：`executeXuankongAnalysis()` - 执行并扣费

### 2. 场景配置
- ✅ 文件：`src/config/scenarios.ts`
- ✅ 6大生活场景：居家/事业/财运/情感/学业/健康
- ✅ 24个细分功能

### 3. 积分激励配置
- ✅ 文件：`src/lib/credits/welcome-bonus.ts`
- ✅ 匿名试用：3次免费
- ✅ 注册奖励：200积分
- ✅ 签到系统：5-20积分/天
- ✅ 任务系统：12个成长任务

## 🚀 Phase 1 实施步骤

### 任务 4: 改造 xuankong-master-page.tsx

#### 步骤 4.1 - 添加必要的导入

在文件顶部添加：

```typescript
import { useEffect } from 'react'; // 添加到现有 import
import { Wallet, Laptop, Crown, Gem, Play, Gift } from 'lucide-react'; // 添加新图标
import { CreditsManager, type XuankongMode } from '@/lib/credits/manager';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { ComprehensiveAnalysisPanel } from './comprehensive-analysis-panel';
import { lifeScenarios } from '@/config/scenarios';
import { WELCOME_BONUSES } from '@/lib/credits/welcome-bonus';
import { toast } from 'sonner'; // 如果项目使用 sonner
```

#### 步骤 4.2 - 扩展组件状态

在 `XuankongMasterPage` 函数内部，替换现有状态：

```typescript
export function XuankongMasterPage() {
  const router = useRouter();
  
  // 用户与积分状态
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  
  // 模式选择
  const [engineMode, setEngineMode] = useState<XuankongMode | 'auto'>('auto');
  const [recommendedMode, setRecommendedMode] = useState<XuankongMode>('local');
  
  // 分析状态
  const [analysisData, setAnalysisData] = useState<XuankongFormData | null>(null);
  const [flyingStarResult, setFlyingStarResult] = useState<any>(null);
  const [unifiedResult, setUnifiedResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 场景选择
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  
  // ... 其余代码
}
```

#### 步骤 4.3 - 加载用户积分与推荐模式

添加 `useEffect` 钩子：

```typescript
// 加载用户积分与推荐模式
useEffect(() => {
  async function loadUserData() {
    try {
      setIsLoadingCredits(true);
      
      // 获取用户积分（假设已登录）
      const result = await getCreditBalanceAction();
      
      if (result?.success && result.credits !== undefined) {
        setCredits(result.credits);
        
        // 假设有用户ID（从session或context获取）
        const currentUserId = 'user_123'; // TODO: 从认证系统获取
        setUserId(currentUserId);
        
        // 获取推荐模式
        const manager = new CreditsManager();
        const recommendation = await manager.selectXuankongMode(currentUserId);
        setRecommendedMode(recommendation.mode);
        
        console.log('💡 推荐模式:', recommendation.reason);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      // 未登录用户默认本地模式
      setRecommendedMode('local');
    } finally {
      setIsLoadingCredits(false);
    }
  }
  
  loadUserData();
}, []);
```

#### 步骤 4.4 - 重写 handleFormSubmit（核心逻辑）

```typescript
const handleFormSubmit = async (data: XuankongFormData) => {
  setIsAnalyzing(true);
  setAnalysisData(data);
  
  // 确定最终使用的模式
  const finalMode = engineMode === 'auto' ? recommendedMode : engineMode;
  
  console.log('📊 开始分析 - 模式:', finalMode, '积分:', credits);
  
  try {
    if (!userId) {
      // 匿名用户：仅本地模式
      await handleLocalMode(data);
      return;
    }
    
    const manager = new CreditsManager();
    
    if (finalMode === 'local') {
      // 本地模式：前端计算
      const executionResult = await manager.executeXuankongAnalysis(
        userId,
        'local',
        async () => {
          return executeLocalAnalysis(data);
        }
      );
      
      if (executionResult.type === 'full') {
        setFlyingStarResult(executionResult.result);
        toast.success(`本地分析完成，消耗 ${executionResult.creditsUsed} 积分`);
        await refreshCredits();
      } else {
        toast.error(executionResult.message, {
          action: {
            label: '购买积分',
            onClick: () => router.push('/pricing')
          }
        });
      }
    } else {
      // 统一引擎模式：后端计算
      const executionResult = await manager.executeXuankongAnalysis(
        userId,
        finalMode,
        async () => {
          return await callUnifiedEngine(data, finalMode);
        }
      );
      
      if (executionResult.type === 'full') {
        setUnifiedResult(executionResult.result);
        toast.success(`分析完成，消耗 ${executionResult.creditsUsed} 积分`);
        await refreshCredits();
      } else {
        toast.error(executionResult.message, {
          action: {
            label: '购买积分',
            onClick: () => router.push('/pricing')
          }
        });
      }
    }
  } catch (error) {
    console.error('分析失败:', error);
    toast.error('分析失败，已自动切换到本地模式');
    
    // 降级到本地模式（不扣费）
    await handleLocalMode(data);
  } finally {
    setIsAnalyzing(false);
    
    // 滚动到结果
    setTimeout(() => {
      document.getElementById('analysis-result')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }
};

// 辅助函数：本地分析
function executeLocalAnalysis(data: XuankongFormData) {
  const observedAt = new Date(data.completionYear, data.completionMonth - 1, 1);
  const input: GenerateFlyingStarInput = {
    observedAt,
    facing: { degrees: data.facingDirection },
    config: {
      applyTiGua: true,
      applyFanGua: false,
      toleranceDeg: 3,
      enableAdvancedAnalysis: true
    }
  };
  return generateFlyingStar(input);
}

// 辅助函数：匿名用户本地模式
async function handleLocalMode(data: XuankongFormData) {
  const result = executeLocalAnalysis(data);
  setFlyingStarResult(result);
  toast.success('本地分析完成');
}

// 辅助函数：调用统一引擎
async function callUnifiedEngine(data: XuankongFormData, mode: XuankongMode) {
  const response = await fetch('/api/qiflow/unified-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bazi: data.bazi || {}, // TODO: 从表单获取八字
      house: {
        facing: data.facingDirection,
        buildYear: data.completionYear,
      },
      options: {
        depth: mode.replace('unified-', '') as any,
        includeLiunian: mode !== 'unified-basic',
        includePersonalization: mode === 'unified-comprehensive' || mode === 'unified-expert',
        includeScoring: mode !== 'unified-basic',
        includeWarnings: mode !== 'unified-basic',
      }
    })
  });
  
  if (!response.ok) throw new Error('API调用失败');
  
  const { data: result } = await response.json();
  return result;
}

// 辅助函数：刷新积分余额
async function refreshCredits() {
  const result = await getCreditBalanceAction();
  if (result?.success && result.credits !== undefined) {
    setCredits(result.credits);
  }
}
```

#### 步骤 4.5 - 添加积分余额显示（在页面头部）

在 `<nav>` 下方添加：

```tsx
{/* 积分余额横幅 */}
<div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">
            当前积分：
          </span>
          <span className="text-xl font-bold text-purple-600">
            {isLoadingCredits ? '...' : credits}
          </span>
        </div>
        
        {!userId && (
          <Badge variant="outline" className="bg-white">
            <Gift className="w-3 h-3 mr-1" />
            登录送200积分
          </Badge>
        )}
      </div>
      
      <Button
        size="sm"
        onClick={() => router.push('/pricing')}
        className="bg-gradient-to-r from-purple-600 to-blue-600"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        充值积分
      </Button>
    </div>
  </div>
</div>
```

#### 步骤 4.6 - 添加模式选择器（在表单前）

```tsx
{!flyingStarResult && !unifiedResult && (
  <>
    {/* 模式选择卡片 */}
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>选择分析模式</CardTitle>
        <CardDescription>
          根据您的需求和积分余额选择合适的分析模式
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={engineMode} onValueChange={(v) => setEngineMode(v as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="auto">
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">智能推荐</span>
                {engineMode === 'auto' && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {getModeLabel(recommendedMode)}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="local" disabled={credits < 20}>
              <div className="flex flex-col items-center gap-1">
                <Laptop className="w-4 h-4" />
                <span className="text-xs">本地模式</span>
                <Badge variant="outline" className="text-xs">20积分</Badge>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="unified-standard" disabled={credits < 50}>
              <div className="flex flex-col items-center gap-1">
                <Star className="w-4 h-4" />
                <span className="text-xs">标准分析</span>
                <Badge variant="outline" className="text-xs">50积分</Badge>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="unified-comprehensive" disabled={credits < 80}>
              <div className="flex flex-col items-center gap-1">
                <Crown className="w-4 h-4" />
                <span className="text-xs">综合分析</span>
                <Badge variant="outline" className="text-xs">80积分</Badge>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="unified-expert" disabled={credits < 120}>
              <div className="flex flex-col items-center gap-1">
                <Gem className="w-4 h-4" />
                <span className="text-xs">专家级</span>
                <Badge variant="outline" className="text-xs">120积分</Badge>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* 模式说明 */}
        <div className="mt-4">
          <ModeDescription mode={engineMode === 'auto' ? recommendedMode : engineMode} />
        </div>
      </CardContent>
    </Card>
    
    {/* 场景快捷选择（可选） */}
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>告诉我们，你需要什么帮助？</CardTitle>
        <CardDescription>选择场景，我们会为你推荐最佳分析方案</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(lifeScenarios).map(([key, scenario]) => (
            <Button
              key={key}
              variant={selectedScenario === key ? 'default' : 'outline'}
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setSelectedScenario(key)}
            >
              <span className="text-3xl">{scenario.icon}</span>
              <span className="text-sm">{scenario.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  </>
)}
```

#### 步骤 4.7 - 添加模式说明组件

```tsx
// 在组件外部添加辅助组件
function ModeDescription({ mode }: { mode: XuankongMode }) {
  const descriptions: Record<XuankongMode, any> = {
    'local': {
      title: '本地专业模式',
      icon: Laptop,
      features: ['✅ 基础飞星盘', '✅ 关键位置分析', '✅ 流年叠加视图', '✅ 前端计算（秒级响应）'],
      cost: 20
    },
    'unified-basic': {
      title: '基础分析模式',
      icon: Star,
      features: ['✅ 完整飞星盘', '✅ 基础格局判断', '✅ 后端计算'],
      cost: 30
    },
    'unified-standard': {
      title: '标准分析模式',
      icon: Star,
      features: ['✅ 基础模式全部', '✅ 智能评分', '✅ 分级预警', '✅ 关键位置详解'],
      cost: 50
    },
    'unified-comprehensive': {
      title: '综合分析模式（推荐）',
      icon: Crown,
      features: ['✅ 标准模式全部', '✅ 流年精准预测', '✅ 个性化八字融合', '✅ 行动计划'],
      cost: 80
    },
    'unified-expert': {
      title: '专家级分析',
      icon: Gem,
      features: ['✅ 综合模式全部', '✅ 替卦分析', '✅ 零正理论', '✅ 城门诀', '✅ 择吉推荐'],
      cost: 120
    }
  };
  
  const desc = descriptions[mode];
  const Icon = desc.icon;
  
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">{desc.title}</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {desc.features.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary">{desc.cost} 积分</Badge>
              <span className="text-xs text-gray-500">
                ≈ ¥{(desc.cost * 0.1).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getModeLabel(mode: XuankongMode): string {
  const labels: Record<XuankongMode, string> = {
    'local': '本地',
    'unified-basic': '基础',
    'unified-standard': '标准',
    'unified-comprehensive': '综合',
    'unified-expert': '专家'
  };
  return labels[mode];
}
```

#### 步骤 4.8 - 修改结果展示部分

```tsx
{/* 分析结果区域 */}
{(unifiedResult || flyingStarResult) && (
  <div id="analysis-result" className="space-y-8 animate-fade-in">
    {/* 优先展示统一引擎结果 */}
    {unifiedResult && (
      <ComprehensiveAnalysisPanel
        analysisResult={unifiedResult}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />
    )}
    
    {/* 本地模式结果 */}
    {!unifiedResult && flyingStarResult && (
      <div>
        {/* 原有的本地结果展示 */}
        <Card>
          {/* ... 原有内容保持不变 ... */}
        </Card>
      </div>
    )}
  </div>
)}
```

## 📋 下一步任务

### 任务 5: 改造 XuankongInputForm
- 添加八字字段（出生日期、时间、性别）
- 场景关联自动预填
- 表单校验增强

### 任务 6: 统一引擎API权限守卫
- 添加积分检查中间件
- 根据模式限制分析深度
- 自动扣费逻辑
- 返回剩余积分信息

## 🧪 测试要点

1. **积分余额显示**
   - 登录用户显示真实积分
   - 未登录用户显示"登录送200积分"

2. **智能模式推荐**
   - 积分充足推荐综合分析
   - 积分不足推荐标准或本地

3. **模式切换**
   - 可手动选择模式
   - 积分不足的模式禁用

4. **分析执行**
   - 本地模式：前端计算，20积分
   - 统一引擎：后端计算，按模式扣费
   - 积分不足提示充值

5. **降级策略**
   - 后端失败自动降级本地
   - 不额外扣费

## 📝 注意事项

1. **用户认证**
   - TODO: 从认证系统获取真实 userId
   - 当前使用占位符 'user_123'

2. **Toast 通知**
   - 如项目未安装 sonner，需安装或使用其他 toast 库
   - `npm install sonner`

3. **八字数据**
   - XuankongInputForm 需补充八字字段
   - 或从用户profile获取

4. **性能优化**
   - 考虑添加积分余额缓存
   - 减少不必要的API调用

5. **错误处理**
   - 网络异常
   - API 错误
   - 积分不足
   - 认证失败

## 🎯 预期效果

完成改造后：
- ✅ 用户可清楚看到积分余额
- ✅ 系统智能推荐最优分析模式
- ✅ 用户可手动选择模式
- ✅ 积分不足时友好提示并引导充值
- ✅ 分析完成后自动扣费并刷新余额
- ✅ 后端引擎失败自动降级本地模式
- ✅ 双引擎结果均可正确展示

## 🔗 相关文件

- `src/lib/credits/manager.ts` - 积分管理与扣费
- `src/config/scenarios.ts` - 场景配置
- `src/lib/credits/welcome-bonus.ts` - 积分奖励
- `src/actions/get-credit-balance.ts` - 获取积分余额
- `src/components/qiflow/xuankong/comprehensive-analysis-panel.tsx` - 统一结果面板
