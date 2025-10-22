# PRD: 用户旅程 P1 优化 v5.1.1

**文档版本**: v5.1.1  
**创建日期**: 2025-10-12  
**负责人**: 产品团队 + 增长团队  
**优先级**: P1 (高优先级)  
**预计工期**: 2-4周  
**预期影响**: 用户转化率提升 20-80%

---

## 目录
1. [项目背景](#项目背景)
2. [目标与成功指标](#目标与成功指标)
3. [需求详情](#需求详情)
4. [用户故事](#用户故事)
5. [设计要求](#设计要求)
6. [技术要求](#技术要求)
7. [验收标准](#验收标准)
8. [风险与依赖](#风险与依赖)

---

## 项目背景

### 现状分析
基于用户旅程评审，我们的 **Growth P0 病毒增长系统已经完整实现**，包括：
- ✅ 推荐裂变系统（双路径激活 + 里程碑奖励）
- ✅ 分享传播机制（生成 + 追踪 + 发奖 + 反作弊）
- ✅ 每日签到系统
- ✅ KPI看板
- ✅ 风控系统

**当前评分**: 8.0/10

### 优化机会
虽然核心功能完善，但在**用户体验和转化优化**方面仍有提升空间：

| 问题 | 影响 | 优先级 |
|------|------|--------|
| 首页"即时体验"使用伪随机算法 | 用户信任度下降 | P1 |
| 缺少邀请专页 | 邀请意愿不足 | P1 |
| 分享仅支持链接 | 传播效果有限 | P1 |
| 定价页面信息不足 | 付费转化率低 | P1 |
| Dashboard是管理员面板 | 用户参与度低 | P1 |

### 业务价值
完成本次优化后，预期：
- 首次访问转化率：+15%
- 注册转化率：+10%
- 邀请活跃度：+50%
- 分享传播率：+80%
- 付费转化率：+20%
- **整体评分提升至 9.0+**

---

## 目标与成功指标

### 核心目标
**在4周内，通过4个关键体验优化，将整体用户旅程评分从 8.0 提升至 9.0+**

### 成功指标 (KPI)

#### 1. 首页优化
- **主指标**: 首页 → 注册转化率 +15%
- **次指标**: 
  - 即时体验使用率 +25%
  - 即时体验后点击CTA率 +20%
  - 页面停留时间 +30秒

#### 2. 邀请专页
- **主指标**: 邀请操作数 +50%
- **次指标**:
  - 邀请专页访问量 > 1000/周
  - 邀请码复制率 +40%
  - 分享按钮点击率 +35%

#### 3. 分享图片生成
- **主指标**: 分享意愿率 +80%
- **次指标**:
  - 图片生成成功率 > 95%
  - 图片下载/分享率 +70%
  - 分享转化率（新用户注册）+60%

#### 4. 定价页面
- **主指标**: 付费转化率 +20%
- **次指标**:
  - 定价页停留时间 +45秒
  - CTA点击率 +25%
  - 购买完成率（点击→支付完成）+15%

---

## 需求详情

---

## 需求 1: 首页"即时体验"优化

### 1.1 需求描述
将首页的"即时体验"功能从**伪随机算法**改为**真实的轻量级命理分析**，并增加**视觉化展示**。

### 1.2 当前问题
```typescript
// src/components/qiflow/homepage/InstantTrySection.tsx
// 问题1: 伪随机算法，用户会识破
const fortuneIndex = dateHash % fortunes.length;

// 问题2: 只有4条硬编码的运势文案
const fortunes = [
  '今日运势：⭐⭐⭐⭐ 贵人相助...',
  // ...
];

// 问题3: 结果展示单薄，没有"wow moment"
<p className="text-sm">{fortune}</p>
```

### 1.3 解决方案

#### 方案A: 真实API分析（推荐）
```typescript
// 调用轻量级API，返回真实数据
POST /api/instant-preview
{
  birthDate: "1990-01-01"
}

// 响应：
{
  dayPillar: "甲子",           // 日柱
  wuxing: "木",                // 五行主属性
  wuxingStrength: {            // 五行力量
    wood: 35,
    fire: 20,
    earth: 15,
    metal: 15,
    water: 15
  },
  todayFortune: "今日运势...", // AI生成的运势
  favorable: ["学习", "社交"],  // 宜
  unfavorable: ["决策", "投资"] // 忌
}
```

#### 方案B: 增强视觉化
```typescript
<InstantResultEnhanced>
  {/* 1. 精准度展示 */}
  <AccuracyDisplay>
    <Badge>✓ 您的日柱：{dayPillar}</Badge>
    <Badge>✓ 五行属性：{wuxing}</Badge>
  </AccuracyDisplay>
  
  {/* 2. 五行雷达图 */}
  <WuxingRadarChart data={wuxingStrength} />
  
  {/* 3. 今日运势 */}
  <FortuneCard>
    <h3>今日运势预测</h3>
    <p>{todayFortune}</p>
    <div className="favorable">
      <span>宜：{favorable.join('、')}</span>
    </div>
    <div className="unfavorable">
      <span>忌：{unfavorable.join('、')}</span>
    </div>
  </FortuneCard>
  
  {/* 4. 解锁更多（CTA强化） */}
  <UnlockMore>
    <p className="blur">完整报告包含：大运流年、事业财运...</p>
    <Button size="lg">🎁 立即解锁完整报告（今日免费）</Button>
  </UnlockMore>
</InstantResultEnhanced>
```

### 1.4 交互流程
```
用户输入生日 → 显示"分析中"动画（模拟AI思考）→ 
展示日柱+五行 → 展示雷达图 → 展示今日运势 → 
显示"模糊化"的完整内容预览 → CTA按钮
```

### 1.5 成本分析
- **开发成本**: 轻量级API消耗 ~0.1积分/次
- **策略**: 免费提供，作为获客成本
- **风控**: IP限制（每IP每日最多5次）

### 1.6 验收标准
- [ ] API响应时间 < 2秒
- [ ] 生成的日柱、五行准确（抽样测试100个生日）
- [ ] 五行雷达图正确渲染
- [ ] 今日运势文案合理（不重复、不荒谬）
- [ ] CTA点击率提升 >20%
- [ ] IP限制正确工作

---

## 需求 2: 创建邀请专页

### 2.1 需求描述
创建独立的 **/invite** 页面，集中展示邀请功能、进度、奖励、排行榜。

### 2.2 当前问题
- **没有统一的邀请入口** - 用户不知道可以邀请
- **推荐码隐藏太深** - 在用户设置中不显眼
- **缺少激励可视化** - 用户不知道邀请的好处
- **没有社交竞争** - 缺少排行榜等激励机制

### 2.3 页面结构

#### 2.3.1 页面头部
```typescript
<InvitePageHeader>
  <h1>邀请好友，共享积分奖励</h1>
  <Tagline>每邀请1位好友完成激活，您和好友各得积分</Tagline>
  
  <RewardHighlight>
    <Card>
      <Icon>👥</Icon>
      <Title>立即奖励</Title>
      <Reward>推荐人 +30 积分</Reward>
      <Reward>被推荐人 +20 积分</Reward>
    </Card>
    
    <Card>
      <Icon>🏆</Icon>
      <Title>里程碑奖励</Title>
      <Tiers>
        <Tier>3人: +50积分</Tier>
        <Tier>10人: +200积分</Tier>
        <Tier>30人: +500积分</Tier>
        <Tier>100人: +2000积分</Tier>
      </Tiers>
    </Card>
  </RewardHighlight>
</InvitePageHeader>
```

#### 2.3.2 邀请进度
```typescript
<InviteProgress>
  <h2>您的邀请进度</h2>
  
  <ProgressBar>
    <Current>{successfulInvites} 人</Current>
    <Next>距离下一里程碑还需 {remaining} 人</Next>
    <Bar value={progress} max={nextMilestone} />
  </ProgressBar>
  
  <Stats>
    <Stat>
      <Label>总邀请</Label>
      <Value>{totalInvites}</Value>
    </Stat>
    <Stat>
      <Label>已激活</Label>
      <Value>{activatedInvites}</Value>
    </Stat>
    <Stat>
      <Label>已获得</Label>
      <Value>{earnedCredits} 积分</Value>
    </Stat>
  </Stats>
</InviteProgress>
```

#### 2.3.3 分享选项
```typescript
<ShareOptions>
  <h2>分享您的邀请</h2>
  
  <InviteCode>
    <Label>您的专属邀请码</Label>
    <InputGroup>
      <Input value={referralCode} readonly />
      <CopyButton onClick={copyToClipboard}>
        <Icon>📋</Icon> 复制
      </CopyButton>
    </InputGroup>
    <SuccessToast>已复制到剪贴板！</SuccessToast>
  </InviteCode>
  
  <InviteLink>
    <Label>邀请链接</Label>
    <InputGroup>
      <Input value={inviteUrl} readonly />
      <CopyButton onClick={copyLink}>
        <Icon>🔗</Icon> 复制链接
      </CopyButton>
    </InputGroup>
  </InviteLink>
  
  <ShareButtons>
    <h3>一键分享到</h3>
    <ButtonGroup>
      <ShareButton platform="wechat" onClick={shareToWechat}>
        <Icon>💬</Icon> 微信
      </ShareButton>
      <ShareButton platform="moments" onClick={shareToMoments}>
        <Icon>🔖</Icon> 朋友圈
      </ShareButton>
      <ShareButton platform="weibo" onClick={shareToWeibo}>
        <Icon>📱</Icon> 微博
      </ShareButton>
      <ShareButton platform="qq" onClick={shareToQQ}>
        <Icon>🐧</Icon> QQ
      </ShareButton>
      <ShareButton platform="sms" onClick={shareViaSMS}>
        <Icon>💌</Icon> 短信
      </ShareButton>
    </ButtonGroup>
  </ShareButtons>
  
  <ShareImageSection>
    <h3>生成邀请海报</h3>
    <p>生成精美海报，分享到社交平台</p>
    <Button onClick={generatePoster}>
      <Icon>🎨</Icon> 生成海报
    </Button>
    <PreviewModal>
      <PosterPreview src={posterUrl} />
      <Actions>
        <Button>下载</Button>
        <Button>分享</Button>
      </Actions>
    </PreviewModal>
  </ShareImageSection>
</ShareOptions>
```

#### 2.3.4 邀请记录
```typescript
<InviteHistory>
  <h2>邀请记录</h2>
  
  <Filters>
    <Select value={filter}>
      <Option value="all">全部</Option>
      <Option value="pending">待激活</Option>
      <Option value="activated">已激活</Option>
    </Select>
  </Filters>
  
  <Table>
    <thead>
      <tr>
        <th>好友</th>
        <th>注册时间</th>
        <th>激活状态</th>
        <th>获得奖励</th>
      </tr>
    </thead>
    <tbody>
      {invites.map(invite => (
        <tr key={invite.id}>
          <td>
            <Avatar src={invite.avatar} />
            <Name>{maskName(invite.name)}</Name>
          </td>
          <td>{formatDate(invite.registeredAt)}</td>
          <td>
            <Badge variant={invite.status}>
              {invite.status === 'activated' ? '✓ 已激活' : '待激活'}
            </Badge>
            {invite.status === 'pending' && (
              <Progress>
                <Text>激活进度：{invite.progress}</Text>
              </Progress>
            )}
          </td>
          <td>
            {invite.rewardGranted ? (
              <Credits>+{invite.reward} 积分</Credits>
            ) : (
              <Pending>待发放</Pending>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
  
  <Pagination>
    <Button onClick={prevPage}>上一页</Button>
    <PageInfo>{currentPage} / {totalPages}</PageInfo>
    <Button onClick={nextPage}>下一页</Button>
  </Pagination>
</InviteHistory>
```

#### 2.3.5 邀请排行榜
```typescript
<Leaderboard>
  <h2>本月邀请排行榜</h2>
  <p className="subtitle">榜上有名的推广大使</p>
  
  <RankList>
    {leaderboard.map((user, index) => (
      <RankItem key={user.id} rank={index + 1}>
        <Rank>
          {index === 0 && <Medal>🥇</Medal>}
          {index === 1 && <Medal>🥈</Medal>}
          {index === 2 && <Medal>🥉</Medal>}
          {index >= 3 && <Number>#{index + 1}</Number>}
        </Rank>
        
        <UserInfo>
          <Avatar src={user.avatar} />
          <Name>{maskName(user.name)}</Name>
          <Badge>{user.tier}</Badge>
        </UserInfo>
        
        <Stats>
          <InviteCount>{user.invites} 人</InviteCount>
          <EarnedCredits>{user.earnedCredits} 积分</EarnedCredits>
        </Stats>
      </RankItem>
    ))}
  </RankList>
  
  <MyRank>
    <h3>您的排名</h3>
    {userRank ? (
      <RankInfo>
        <Rank>#{userRank.rank}</Rank>
        <Text>已邀请 {userRank.invites} 人</Text>
        <Text>再邀请 {userRank.toNextRank} 人可进入前10</Text>
      </RankInfo>
    ) : (
      <EmptyState>
        <Text>开始邀请，冲击排行榜！</Text>
      </EmptyState>
    )}
  </MyRank>
</Leaderboard>
```

#### 2.3.6 激励说明
```typescript
<IncentiveExplain>
  <h2>邀请奖励规则</h2>
  
  <Rule>
    <Step>1</Step>
    <Content>
      <Title>分享您的邀请码或链接</Title>
      <Description>通过微信、朋友圈、微博等渠道分享</Description>
    </Content>
  </Rule>
  
  <Rule>
    <Step>2</Step>
    <Content>
      <Title>好友使用邀请码注册</Title>
      <Description>好友注册时输入您的邀请码</Description>
    </Content>
  </Rule>
  
  <Rule>
    <Step>3</Step>
    <Content>
      <Title>好友完成激活任务</Title>
      <Description>
        完成以下任一路径：<br/>
        • 路径A：八字分析 ≥1 + 风水分析 ≥1<br/>
        • 路径B：PDF导出 ≥1 + AI对话 ≥3轮
      </Description>
    </Content>
  </Rule>
  
  <Rule>
    <Step>4</Step>
    <Content>
      <Title>双方获得奖励</Title>
      <Description>
        您获得 30 积分，好友获得 20 积分<br/>
        （累计邀请达到里程碑可获得额外奖励）
      </Description>
    </Content>
  </Rule>
  
  <FAQ>
    <h3>常见问题</h3>
    <Question>
      <Q>邀请码有有效期吗？</Q>
      <A>邀请码永久有效，可重复使用</A>
    </Question>
    <Question>
      <Q>每天最多可以邀请多少人？</Q>
      <A>邀请人数不限，但奖励发放有频率限制（每日5次，每月40次）</A>
    </Question>
    <Question>
      <Q>什么时候能收到奖励？</Q>
      <A>好友完成激活任务后，奖励会立即发放到双方账户</A>
    </Question>
    <Question>
      <Q>里程碑奖励如何计算？</Q>
      <A>以成功激活的好友数量为准，达到里程碑后自动发放</A>
    </Question>
  </FAQ>
</IncentiveExplain>
```

### 2.4 路由与导航
```typescript
// 路由：/invite
// 文件：src/app/[locale]/invite/page.tsx

// 入口点：
// 1. 顶部导航栏：显著的"邀请好友"按钮
// 2. 用户Dashboard：邀请卡片
// 3. 分析结果页：底部提示"邀请好友获得更多积分"
// 4. 积分不足时：提示"邀请好友免费获得积分"
```

### 2.5 数据需求
```typescript
// API: GET /api/invite/stats
{
  user: {
    referralCode: string;
    inviteUrl: string;
    tier: string; // 用户等级（初级/中级/高级/超级推广大使）
  },
  stats: {
    totalInvites: number;        // 总邀请数
    activatedInvites: number;    // 已激活数
    pendingInvites: number;      // 待激活数
    earnedCredits: number;       // 已获得积分
    nextMilestone: number;       // 下一里程碑人数
    toNextMilestone: number;     // 还需邀请人数
  },
  invites: Array<{
    id: string;
    name: string;
    avatar: string;
    registeredAt: Date;
    status: 'pending' | 'activated';
    progress: string; // "八字分析 ✓  风水分析 ⏳"
    reward: number;
    rewardGranted: boolean;
  }>,
  leaderboard: Array<{
    rank: number;
    name: string;
    avatar: string;
    tier: string;
    invites: number;
    earnedCredits: number;
  }>,
  userRank: {
    rank: number;
    invites: number;
    toNextRank: number;
  }
}
```

### 2.6 验收标准
- [ ] 页面加载速度 < 1.5秒
- [ ] 邀请码复制功能正常
- [ ] 分享按钮跳转正确
- [ ] 进度条准确显示
- [ ] 排行榜实时更新
- [ ] 移动端适配良好
- [ ] 邀请操作数提升 >50%

---

## 需求 3: 分享图片生成

### 3.1 需求描述
实现**精美的分享海报生成功能**，用户可以将分析结果制作成图片，分享到社交平台。

### 3.2 当前问题
- **只支持链接分享** - 传播效果有限
- **缺少视觉化内容** - 不吸引眼球
- **没有二维码** - 无法直接扫码体验

### 3.3 海报设计要求

#### 3.3.1 海报模板
```
┌─────────────────────────────────┐
│   LOGO           我的八字分析结果  │
├─────────────────────────────────┤
│                                 │
│        [八字盘可视化]             │
│     年柱  月柱  日柱  时柱         │
│     甲子  乙丑  丙寅  丁卯         │
│                                 │
│        [五行雷达图]               │
│     木 35% | 火 20% | 土 15%    │
│     金 15% | 水 15%             │
│                                 │
│     ═══ 关键结论 ═══             │
│  ✓ 五行属性：木                  │
│  ✓ 综合评分：85/100             │
│  ✓ 性格特质：积极进取、善于沟通   │
│                                 │
├─────────────────────────────────┤
│   [二维码]    扫码体验AI命理分析  │
│              使用邀请码 QF1234   │
│              双方各得20积分       │
└─────────────────────────────────┘
```

#### 3.3.2 设计规范
- **尺寸**: 750 x 1334 (标准分享图尺寸，适配朋友圈)
- **格式**: PNG (支持透明背景)
- **文件大小**: < 500KB (压缩优化)
- **色彩**: 
  - 主色调：深色背景 (#1a1a2e) + 金色点缀 (#fbbf24)
  - 渐变：从紫色到蓝色
- **字体**:
  - 标题：思源黑体 Bold 48px
  - 正文：思源黑体 Regular 32px
  - 小字：思源黑体 Light 24px

### 3.4 技术实现方案

#### 方案A: Canvas API（前端生成，推荐）
```typescript
// src/lib/share/generate-poster.ts

async function generatePoster(analysisResult: AnalysisResult): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 750;
  canvas.height = 1334;
  const ctx = canvas.getContext('2d');
  
  // 1. 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, 1334);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 750, 1334);
  
  // 2. Logo
  const logo = await loadImage('/brand/logo-bazi.svg');
  ctx.drawImage(logo, 50, 50, 150, 30);
  
  // 3. 标题
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('我的八字分析结果', 375, 150);
  
  // 4. 四柱八字
  drawFourPillars(ctx, analysisResult.fourPillars, {
    x: 375,
    y: 250,
    width: 600,
    height: 150
  });
  
  // 5. 五行雷达图
  drawWuxingRadar(ctx, analysisResult.wuxing, {
    x: 375,
    y: 500,
    radius: 120
  });
  
  // 6. 关键结论
  ctx.font = '32px sans-serif';
  ctx.fillText(`五行属性：${analysisResult.wuxing.dominant}`, 375, 750);
  ctx.fillText(`综合评分：${analysisResult.scores.overall}/100`, 375, 810);
  ctx.fillText(`性格特质：${analysisResult.personality.summary}`, 375, 870);
  
  // 7. 二维码（邀请链接）
  const qrCode = await generateQRCode(inviteUrl);
  ctx.drawImage(qrCode, 275, 950, 200, 200);
  
  // 8. 底部文案
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('扫码体验AI八字分析', 375, 1200);
  ctx.fillText(`使用邀请码 ${referralCode} 双方各得20积分`, 375, 1240);
  
  // 9. 水印（防盗用）
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillText('QiFlow AI 提供技术支持', 375, 1300);
  
  return canvas.toDataURL('image/png');
}
```

#### 方案B: 服务端生成（备选）
```typescript
// src/app/api/share/generate-poster/route.ts

import { createCanvas, loadImage } from 'canvas';

export async function POST(req: Request) {
  const { analysisResult, userId } = await req.json();
  
  // 服务端Canvas绘制
  const canvas = createCanvas(750, 1334);
  const ctx = canvas.getContext('2d');
  
  // ...绘制逻辑（同上）...
  
  // 保存到文件系统或OSS
  const buffer = canvas.toBuffer('image/png');
  const fileName = `poster_${userId}_${Date.now()}.png`;
  await uploadToOSS(fileName, buffer);
  
  return Response.json({
    success: true,
    posterUrl: `https://cdn.example.com/posters/${fileName}`
  });
}
```

### 3.5 生成流程
```
用户点击"生成海报" → 显示"生成中"加载动画 → 
调用生成函数 → 渲染Canvas → 转换为图片 → 
显示预览Modal → 用户可选：下载/分享
```

### 3.6 分享集成
```typescript
// 1. 微信分享
async function shareToWechat(posterUrl: string) {
  // 调用微信JS-SDK
  wx.invoke('shareTimeline', {
    title: '我的八字分析结果',
    desc: '快来看看你的命理运势吧',
    link: inviteUrl,
    imgUrl: posterUrl
  });
}

// 2. 朋友圈分享（图片）
async function shareToMoments(posterDataUrl: string) {
  // 方案A: 下载图片到本地
  const link = document.createElement('a');
  link.href = posterDataUrl;
  link.download = `八字分析_${Date.now()}.png`;
  link.click();
  
  toast.success('海报已下载，请在相册中找到并分享到朋友圈');
}

// 3. 长按保存（移动端）
<PosterImage 
  src={posterUrl}
  onLongPress={handleLongPress}
  hint="长按保存图片"
/>
```

### 3.7 性能优化
```typescript
// 1. 图片缓存
const posterCache = new Map<string, string>();

async function generatePosterCached(analysisId: string): Promise<string> {
  if (posterCache.has(analysisId)) {
    return posterCache.get(analysisId)!;
  }
  
  const poster = await generatePoster(analysisResult);
  posterCache.set(analysisId, poster);
  return poster;
}

// 2. Web Worker（避免阻塞主线程）
const worker = new Worker('/workers/poster-generator.js');
worker.postMessage({ analysisResult });
worker.onmessage = (e) => {
  const posterUrl = e.data;
  displayPoster(posterUrl);
};

// 3. 预生成（分析完成后立即生成，不等用户点击）
useEffect(() => {
  if (analysisResult) {
    // 后台静默生成
    generatePoster(analysisResult).then(setPosterUrl);
  }
}, [analysisResult]);
```

### 3.8 验收标准
- [ ] 海报生成成功率 > 95%
- [ ] 生成时间 < 3秒
- [ ] 图片清晰度满足分享要求
- [ ] 二维码可正常扫描
- [ ] 支持下载到本地
- [ ] 移动端显示正常
- [ ] 分享意愿率提升 >80%

---

## 需求 4: 定价页面优化

### 4.1 需求描述
优化 **/pricing** 页面，增加**套餐对比表、使用场景说明、社会证明**，提升付费转化率。

### 4.2 当前问题
```typescript
// src/app/[locale]/(marketing)/pricing/page.tsx
// 当前代码只有 13 行，过于简陋

export default async function PricingPage() {
  return (
    <Container>
      <PricingTable />  // 只有这一个组件
      <FaqSection />
    </Container>
  );
}
```

### 4.3 优化后的页面结构

#### 4.3.1 页面头部
```typescript
<PricingPageHeader>
  <h1>选择适合您的套餐</h1>
  <p>所有套餐均享受：100%准确率、24小时客服、永久保存报告</p>
  
  <TrustBadges>
    <Badge>✓ 超过 127,843 人使用</Badge>
    <Badge>✓ 4.9/5 用户评分</Badge>
    <Badge>✓ 98% 算法准确率</Badge>
    <Badge>✓ 7天无理由退款</Badge>
  </TrustBadges>
</PricingPageHeader>
```

#### 4.3.2 套餐对比表
```typescript
<PricingTable>
  {/* 体验套餐 */}
  <PricingCard tier="starter">
    <Badge>💡 入门体验</Badge>
    <Title>体验套餐</Title>
    <Price>
      <Currency>¥</Currency>
      <Amount>19</Amount>
      <Period>/30天</Period>
    </Price>
    
    <Features>
      <Feature included>✓ 30 积分</Feature>
      <Feature included>✓ 3 次基础八字分析</Feature>
      <Feature included>✓ 或 1 次详细分析</Feature>
      <Feature included>✓ 10 次 AI 提问</Feature>
      <Feature included>✓ 有效期 30 天</Feature>
      <Feature>✗ 风水罗盘分析</Feature>
      <Feature>✗ PDF 高级报告</Feature>
    </Features>
    
    <UseCases>
      <Icon>👤</Icon>
      <Text>适合：初次尝试，想体验一下</Text>
    </UseCases>
    
    <Button variant="outline">选择体验套餐</Button>
  </PricingCard>
  
  {/* 标准套餐（推荐） */}
  <PricingCard tier="standard" featured>
    <Badge variant="hot">🔥 最受欢迎</Badge>
    <Title>标准套餐</Title>
    <Price>
      <Currency>¥</Currency>
      <Amount>49</Amount>
      <Period>/90天</Period>
      <Savings>节省 ¥30</Savings>
    </Price>
    
    <Features>
      <Feature included highlight>✓ 100 积分</Feature>
      <Feature included>✓ 10 次基础八字分析</Feature>
      <Feature included>✓ 或 3 次详细分析</Feature>
      <Feature included>✓ 或 2 次专业分析</Feature>
      <Feature included>✓ 30 次 AI 提问</Feature>
      <Feature included>✓ 有效期 90 天</Feature>
      <Feature included highlight>✓ 赠送 1 次风水罗盘分析</Feature>
      <Feature>✗ PDF 高级报告</Feature>
      <Feature>✗ 优先客服支持</Feature>
    </Features>
    
    <UseCases>
      <Icon>👨‍👩‍👧‍👦</Icon>
      <Text>适合：给自己和家人都分析一遍</Text>
    </UseCases>
    
    <Button variant="primary">立即购买</Button>
    
    <SavingsBadge>
      相比单次购买节省 ¥30 (38%)
    </SavingsBadge>
  </PricingCard>
  
  {/* 豪华套餐 */}
  <PricingCard tier="premium">
    <Badge variant="premium">💎 最超值</Badge>
    <Title>豪华套餐</Title>
    <Price>
      <Currency>¥</Currency>
      <Amount>99</Amount>
      <Period>/180天</Period>
      <Savings>节省 ¥80</Savings>
    </Price>
    
    <Features>
      <Feature included highlight>✓ 250 积分</Feature>
      <Feature included>✓ 25 次基础八字分析</Feature>
      <Feature included>✓ 或 8 次详细分析</Feature>
      <Feature included>✓ 或 5 次专业分析</Feature>
      <Feature included>✓ 100 次 AI 提问</Feature>
      <Feature included>✓ 有效期 180 天</Feature>
      <Feature included highlight>✓ 赠送 3 次风水罗盘分析</Feature>
      <Feature included highlight>✓ PDF 高级报告模板</Feature>
      <Feature included highlight>✓ 优先客服支持</Feature>
    </Features>
    
    <UseCases>
      <Icon>🏆</Icon>
      <Text>适合：命理爱好者，或为朋友提供咨询</Text>
    </UseCases>
    
    <Button variant="outline">选择豪华套餐</Button>
    
    <SavingsBadge>
      相比单次购买节省 ¥80 (45%)
    </SavingsBadge>
  </PricingCard>
</PricingTable>
```

#### 4.3.3 积分使用说明
```typescript
<UseCaseSection>
  <h2>积分可以用来做什么？</h2>
  <p className="subtitle">详细了解每种分析的价值</p>
  
  <UseCaseGrid>
    <UseCaseCard>
      <Icon>👤</Icon>
      <Title>个人命理分析</Title>
      <PriceList>
        <PriceItem>
          <Name>基础分析</Name>
          <Cost>10 积分</Cost>
          <Description>四柱八字、五行强弱、性格总结</Description>
        </PriceItem>
        <PriceItem>
          <Name>详细分析</Name>
          <Cost>30 积分</Cost>
          <Description>十神分析、用神喜忌、事业财运、婚姻感情</Description>
        </PriceItem>
        <PriceItem>
          <Name>专业分析</Name>
          <Cost>50 积分</Cost>
          <Description>完整分析报告、大运流年、详细建议</Description>
        </PriceItem>
      </PriceList>
    </UseCaseCard>
    
    <UseCaseCard>
      <Icon>🏠</Icon>
      <Title>风水测算</Title>
      <PriceList>
        <PriceItem>
          <Name>玄空飞星</Name>
          <Cost>20 积分</Cost>
          <Description>房屋风水分析、方位吉凶</Description>
        </PriceItem>
        <PriceItem>
          <Name>罗盘定位</Name>
          <Cost>15 积分</Cost>
          <Description>精确方位判断、布局建议</Description>
        </PriceItem>
      </PriceList>
    </UseCaseCard>
    
    <UseCaseCard>
      <Icon>💬</Icon>
      <Title>AI 智能咨询</Title>
      <PriceList>
        <PriceItem>
          <Name>AI 提问</Name>
          <Cost>5 积分/次</Cost>
          <Description>基于八字的智能问答</Description>
        </PriceItem>
        <PriceItem>
          <Name>深度解读</Name>
          <Cost>30 积分</Cost>
          <Description>某个问题的详细分析</Description>
        </PriceItem>
      </PriceList>
    </UseCaseCard>
    
    <UseCaseCard>
      <Icon>📄</Icon>
      <Title>报告导出</Title>
      <PriceList>
        <PriceItem>
          <Name>PDF 导出</Name>
          <Cost>5 积分</Cost>
          <Description>标准格式报告</Description>
        </PriceItem>
        <PriceItem>
          <Name>高级报告</Name>
          <Cost>10 积分</Cost>
          <Description>精美设计、完整内容</Description>
        </PriceItem>
      </PriceList>
    </UseCaseCard>
  </UseCaseGrid>
</UseCaseSection>
```

#### 4.3.4 套餐计算器
```typescript
<PricingCalculator>
  <h2>计算您需要的积分</h2>
  <p>根据您的使用场景，推荐最适合的套餐</p>
  
  <Calculator>
    <Input>
      <Label>基础八字分析</Label>
      <Counter value={basicCount} onChange={setBasicCount} />
      <Cost>{basicCount * 10} 积分</Cost>
    </Input>
    
    <Input>
      <Label>详细八字分析</Label>
      <Counter value={detailedCount} onChange={setDetailedCount} />
      <Cost>{detailedCount * 30} 积分</Cost>
    </Input>
    
    <Input>
      <Label>风水分析</Label>
      <Counter value={fengshuiCount} onChange={setFengshuiCount} />
      <Cost>{fengshuiCount * 20} 积分</Cost>
    </Input>
    
    <Input>
      <Label>AI 提问</Label>
      <Counter value={aiCount} onChange={setAiCount} />
      <Cost>{aiCount * 5} 积分</Cost>
    </Input>
    
    <Divider />
    
    <Total>
      <Label>总计需要</Label>
      <Amount>{totalCredits} 积分</Amount>
    </Total>
    
    <Recommendation>
      <Icon>💡</Icon>
      <Text>推荐购买：{recommendedPlan}</Text>
      <Button onClick={selectPlan}>选择此套餐</Button>
    </Recommendation>
  </Calculator>
</PricingCalculator>
```

#### 4.3.5 用户评价
```typescript
<TestimonialSection>
  <h2>用户评价</h2>
  <p className="subtitle">看看其他用户怎么说</p>
  
  <TestimonialGrid>
    <Testimonial>
      <Rating>⭐⭐⭐⭐⭐</Rating>
      <Quote>
        "给自己和家人都分析了，准得离谱！特别是事业运分析，
        和实际情况完全吻合。"
      </Quote>
      <Author>
        <Avatar src="/avatars/user1.jpg" />
        <Name>张女士</Name>
        <Plan>标准套餐用户</Plan>
      </Author>
    </Testimonial>
    
    <Testimonial>
      <Rating>⭐⭐⭐⭐⭐</Rating>
      <Quote>
        "之前在线下找大师看过，收费贵还不准。这个AI分析
        不仅便宜，而且细节很到位，很满意。"
      </Quote>
      <Author>
        <Avatar src="/avatars/user2.jpg" />
        <Name>李先生</Name>
        <Plan>豪华套餐用户</Plan>
      </Author>
    </Testimonial>
    
    <Testimonial>
      <Rating>⭐⭐⭐⭐⭐</Rating>
      <Quote>
        "风水罗盘功能很实用，帮我重新调整了家里的布局，
        感觉运气确实有改善。"
      </Quote>
      <Author>
        <Avatar src="/avatars/user3.jpg" />
        <Name>王女士</Name>
        <Plan>豪华套餐用户</Plan>
      </Author>
    </Testimonial>
  </TestimonialGrid>
</TestimonialSection>
```

#### 4.3.6 FAQ
```typescript
<FaqSection>
  <h2>常见问题</h2>
  
  <FaqList>
    <FaqItem>
      <Question>积分会过期吗？</Question>
      <Answer>
        积分本身不会过期，但套餐有有效期。例如标准套餐的100积分
        需要在90天内使用完，过期后剩余积分会清零。
      </Answer>
    </FaqItem>
    
    <FaqItem>
      <Question>可以退款吗？</Question>
      <Answer>
        如果对分析结果不满意，购买后7天内可申请无理由退款。
        已使用的积分会按比例扣除。
      </Answer>
    </FaqItem>
    
    <FaqItem>
      <Question>购买后如何使用？</Question>
      <Answer>
        支付成功后，积分会立即充值到您的账户。前往八字分析、
        风水分析或AI咨询页面，开始分析即可自动扣除相应积分。
      </Answer>
    </FaqItem>
    
    <FaqItem>
      <Question>有优惠活动吗？</Question>
      <Answer>
        新用户首次购买享8折优惠。定期会有限时促销活动，
        关注公众号可以第一时间获取优惠信息。
      </Answer>
    </FaqItem>
    
    <FaqItem>
      <Question>支持哪些支付方式？</Question>
      <Answer>
        支持微信支付、支付宝、银联卡、Visa/Mastercard等多种支付方式。
      </Answer>
    </FaqItem>
    
    <FaqItem>
      <Question>购买记录在哪里查看？</Question>
      <Answer>
        登录后进入"我的账户 > 订单记录"可以查看所有购买记录和发票。
      </Answer>
    </FaqItem>
  </FaqList>
</FaqSection>
```

#### 4.3.7 限时优惠
```typescript
<PromoBanner>
  <Badge>🔥 限时活动</Badge>
  <Title>新用户首次购买享 8 折优惠</Title>
  <Countdown>
    <Label>活动倒计时</Label>
    <Timer>
      <TimeUnit>{hours}<span>时</span></TimeUnit>
      <TimeUnit>{minutes}<span>分</span></TimeUnit>
      <TimeUnit>{seconds}<span>秒</span></TimeUnit>
    </Timer>
  </Countdown>
  <Button size="lg">立即购买</Button>
</PromoBanner>
```

### 4.4 购买流程优化
```typescript
// 1. 点击"立即购买" → 弹出确认Modal
<PurchaseConfirmModal>
  <Title>确认购买</Title>
  <Summary>
    <Item>
      <Label>套餐</Label>
      <Value>{planName}</Value>
    </Item>
    <Item>
      <Label>积分</Label>
      <Value>{credits} 积分</Value>
    </Item>
    <Item>
      <Label>有效期</Label>
      <Value>{validDays} 天</Value>
    </Item>
    <Item highlight>
      <Label>应付金额</Label>
      <Value>¥{price}</Value>
    </Item>
  </Summary>
  
  <PaymentMethods>
    <Method selected>
      <Icon>💬</Icon>
      <Name>微信支付</Name>
    </Method>
    <Method>
      <Icon>🔵</Icon>
      <Name>支付宝</Name>
    </Method>
    <Method>
      <Icon>💳</Icon>
      <Name>银行卡</Name>
    </Method>
  </PaymentMethods>
  
  <Actions>
    <Button onClick={handlePurchase}>确认支付</Button>
    <Button variant="ghost" onClick={close}>取消</Button>
  </Actions>
  
  <Agreement>
    <Checkbox checked={agreed} onChange={setAgreed} />
    <Text>我已阅读并同意<Link>《购买协议》</Link></Text>
  </Agreement>
</PurchaseConfirmModal>

// 2. 支付成功 → 跳转成功页
<PaymentSuccessPage>
  <Confetti />
  <Icon>🎉</Icon>
  <Title>购买成功！</Title>
  <Message>您已成功充值 {credits} 积分</Message>
  
  <NextSteps>
    <h3>接下来您可以：</h3>
    <Action>
      <Button href="/bazi-analysis">
        <Icon>📊</Icon> 开始八字分析
      </Button>
    </Action>
    <Action>
      <Button href="/xuankong" variant="outline">
        <Icon>🧭</Icon> 风水罗盘分析
      </Button>
    </Action>
    <Action>
      <Button href="/ai-chat" variant="outline">
        <Icon>💬</Icon> AI 智能咨询
      </Button>
    </Action>
  </NextSteps>
  
  <InvitePrompt>
    <Icon>🎁</Icon>
    <Title>邀请好友，双方各得 20 积分</Title>
    <Button onClick={goToInvite}>立即邀请</Button>
  </InvitePrompt>
</PaymentSuccessPage>
```

### 4.5 验收标准
- [ ] 页面加载速度 < 2秒
- [ ] 套餐对比清晰明了
- [ ] 计算器功能正常
- [ ] 购买流程顺畅
- [ ] 支付成功后跳转正确
- [ ] 移动端适配良好
- [ ] 付费转化率提升 >20%

---

## 需求 5: 用户Dashboard优化

### 5.1 需求描述
将当前的**管理员Dashboard**改造为**用户个性化中心**，增加邀请、签到、历史记录等功能。

### 5.2 当前问题
```typescript
// src/app/[locale]/(protected)/dashboard/page.tsx
// 当前：显示AdminWelcome、SectionCards、ChartAreaInteractive
// 这些都是给管理员看的，普通用户看到的是演示数据，完全没用
```

### 5.3 优化后的Dashboard结构

#### 5.3.1 欢迎区域
```typescript
<WelcomeSection>
  <Greeting>
    <Time>{getGreeting()}</Time> {/* 早上好/下午好/晚上好 */}
    <Name>，{userName}！</Name>
  </Greeting>
  
  <Stats>
    <Stat>
      <Icon>📅</Icon>
      <Label>连续签到</Label>
      <Value>{consecutiveDays} 天</Value>
    </Stat>
    <Stat>
      <Icon>💰</Icon>
      <Label>剩余积分</Label>
      <Value>{credits}</Value>
    </Stat>
    <Stat>
      <Icon>👥</Icon>
      <Label>邀请好友</Label>
      <Value>{invitedCount} 人</Value>
    </Stat>
  </Stats>
  
  <MemberTier>
    <Badge variant={tierColor}>{tierName}</Badge>
    {nextTier && (
      <Progress>
        <Text>距离 {nextTier} 还需 {toNextTier} 积分</Text>
        <ProgressBar value={tierProgress} max={100} />
      </Progress>
    )}
  </MemberTier>
</WelcomeSection>
```

#### 5.3.2 每日签到卡片
```typescript
<DailyCheckInCard>
  <Header>
    <Icon>📅</Icon>
    <Title>每日签到</Title>
    <Subtitle>连续签到领取更多奖励</Subtitle>
  </Header>
  
  <Calendar>
    <Week>
      {last7Days.map(day => (
        <Day key={day} checked={day.checkedIn}>
          <Date>{day.date}</Date>
          <Status>{day.checkedIn ? '✓' : '○'}</Status>
        </Day>
      ))}
    </Week>
  </Calendar>
  
  <CheckInButton>
    {todayCheckedIn ? (
      <Button disabled>
        <Icon>✓</Icon> 今日已签到
      </Button>
    ) : (
      <Button onClick={handleCheckIn}>
        <Icon>📅</Icon> 立即签到（+2积分）
      </Button>
    )}
  </CheckInButton>
  
  <Milestones>
    <Milestone completed={consecutiveDays >= 7}>
      <Icon>{consecutiveDays >= 7 ? '✓' : '○'}</Icon>
      <Text>7天</Text>
    </Milestone>
    <Milestone completed={consecutiveDays >= 15}>
      <Icon>{consecutiveDays >= 15 ? '✓' : '○'}</Icon>
      <Text>15天</Text>
    </Milestone>
    <Milestone completed={consecutiveDays >= 30}>
      <Icon>{consecutiveDays >= 30 ? '✓' : '○'}</Icon>
      <Text>30天</Text>
    </Milestone>
    <Milestone completed={consecutiveDays >= 60}>
      <Icon>{consecutiveDays >= 60 ? '✓' : '○'}</Icon>
      <Text>60天</Text>
    </Milestone>
    <Milestone completed={consecutiveDays >= 90}>
      <Icon>{consecutiveDays >= 90 ? '✓' : '○'}</Icon>
      <Text>90天</Text>
    </Milestone>
  </Milestones>
</DailyCheckInCard>
```

#### 5.3.3 快速操作
```typescript
<QuickActions>
  <h2>快速操作</h2>
  
  <ActionGrid>
    <ActionCard href="/bazi-analysis">
      <Icon>📊</Icon>
      <Title>八字分析</Title>
      <Description>深入了解您的命理</Description>
      <Cost>10-50 积分</Cost>
    </ActionCard>
    
    <ActionCard href="/xuankong">
      <Icon>🧭</Icon>
      <Title>风水罗盘</Title>
      <Description>房屋方位吉凶分析</Description>
      <Cost>20 积分</Cost>
    </ActionCard>
    
    <ActionCard href="/ai-chat">
      <Icon>💬</Icon>
      <Title>AI 咨询</Title>
      <Description>智能命理问答</Description>
      <Cost>5 积分/次</Cost>
    </ActionCard>
    
    <ActionCard href="/invite">
      <Icon>🎁</Icon>
      <Title>邀请好友</Title>
      <Description>双方各得积分奖励</Description>
      <Badge>免费获取积分</Badge>
    </ActionCard>
  </ActionGrid>
</QuickActions>
```

#### 5.3.4 最近分析
```typescript
<RecentAnalysis>
  <Header>
    <h2>最近分析记录</h2>
    <Link href="/history">查看全部 →</Link>
  </Header>
  
  <AnalysisList>
    {recentAnalyses.map(analysis => (
      <AnalysisCard key={analysis.id}>
        <Icon>{getAnalysisIcon(analysis.type)}</Icon>
        
        <Info>
          <Title>{analysis.name}</Title>
          <Meta>
            <Type>{analysis.type}</Type>
            <Date>{formatDate(analysis.createdAt)}</Date>
          </Meta>
        </Info>
        
        <Actions>
          <Button href={`/analysis/${analysis.id}`} size="sm">
            查看报告
          </Button>
          <IconButton onClick={() => shareAnalysis(analysis.id)}>
            <Icon>🔗</Icon>
          </IconButton>
        </Actions>
      </AnalysisCard>
    ))}
  </AnalysisList>
  
  {recentAnalyses.length === 0 && (
    <EmptyState>
      <Icon>📊</Icon>
      <Title>还没有分析记录</Title>
      <Description>开始您的第一次命理分析吧</Description>
      <Button href="/bazi-analysis">立即分析</Button>
    </EmptyState>
  )}
</RecentAnalysis>
```

#### 5.3.5 邀请卡片
```typescript
<InviteSection>
  <Header>
    <Icon>🎁</Icon>
    <Title>邀请好友，双方各得积分</Title>
  </Header>
  
  <InviteStats>
    <Stat>
      <Label>已邀请</Label>
      <Value>{invitedCount} 人</Value>
    </Stat>
    <Stat>
      <Label>已激活</Label>
      <Value>{activatedCount} 人</Value>
    </Stat>
    <Stat>
      <Label>已获得</Label>
      <Value>{earnedCredits} 积分</Value>
    </Stat>
  </InviteStats>
  
  <InviteCode>
    <Label>您的专属邀请码</Label>
    <InputGroup>
      <Input value={referralCode} readonly />
      <CopyButton onClick={copyCode}>复制</CopyButton>
    </InputGroup>
  </InviteCode>
  
  <Actions>
    <Button href="/invite" variant="primary">
      查看详情
    </Button>
    <Button onClick={shareInvite} variant="outline">
      <Icon>🔗</Icon> 分享
    </Button>
  </Actions>
  
  {nextMilestone && (
    <Milestone>
      <Progress value={progress} max={nextMilestone.target} />
      <Text>
        再邀请 {nextMilestone.remaining} 人可获得 {nextMilestone.reward} 积分
      </Text>
    </Milestone>
  )}
</InviteSection>
```

#### 5.3.6 积分动态
```typescript
<CreditsActivity>
  <Header>
    <h2>积分变动</h2>
    <Link href="/credits">详细记录 →</Link>
  </Header>
  
  <Timeline>
    {recentTransactions.map(tx => (
      <TimelineItem key={tx.id}>
        <Time>{formatTime(tx.createdAt)}</Time>
        
        <Content>
          <Icon>{getTransactionIcon(tx.type)}</Icon>
          <Description>{tx.description}</Description>
        </Content>
        
        <Amount positive={tx.amount > 0}>
          {tx.amount > 0 ? '+' : ''}{tx.amount}
        </Amount>
      </TimelineItem>
    ))}
  </Timeline>
  
  <Summary>
    <Item>
      <Label>今日获得</Label>
      <Value>+{todayEarned} 积分</Value>
    </Item>
    <Item>
      <Label>今日消耗</Label>
      <Value>-{todaySpent} 积分</Value>
    </Item>
  </Summary>
</CreditsActivity>
```

#### 5.3.7 推荐内容
```typescript
<Recommendations>
  <Header>
    <h2>为您推荐</h2>
  </Header>
  
  <RecommendationGrid>
    <ArticleCard>
      <Image src="/articles/career.jpg" />
      <Category>事业运</Category>
      <Title>如何通过八字选择职业</Title>
      <Excerpt>根据五行属性，找到最适合自己的职业方向...</Excerpt>
      <Link href="/blog/career-guidance">阅读全文 →</Link>
    </ArticleCard>
    
    <ArticleCard>
      <Image src="/articles/2025.jpg" />
      <Category>流年运势</Category>
      <Title>2025年运势分析</Title>
      <Excerpt>蛇年运势如何？如何趋吉避凶...</Excerpt>
      <Link href="/blog/2025-forecast">阅读全文 →</Link>
    </ArticleCard>
    
    <ArticleCard>
      <Image src="/articles/fengshui.jpg" />
      <Category>风水知识</Category>
      <Title>家居风水布局要点</Title>
      <Excerpt>简单实用的风水布局技巧...</Excerpt>
      <Link href="/blog/fengshui-tips">阅读全文 →</Link>
    </ArticleCard>
  </RecommendationGrid>
</Recommendations>
```

### 5.4 验收标准
- [ ] 页面加载速度 < 1.5秒
- [ ] 所有数据实时更新
- [ ] 签到功能正常
- [ ] 邀请卡片显示正确
- [ ] 历史记录加载正常
- [ ] 移动端适配良好
- [ ] 用户参与度提升 >30%

---

## 用户故事

### 故事 1: 首次访问用户
**作为** 一个首次访问网站的用户  
**我想要** 快速体验产品的价值  
**以便** 决定是否注册使用

**验收标准**:
- [ ] 用户可以在首页直接输入生日
- [ ] 立即看到真实的八字数据（日柱、五行）
- [ ] 看到精美的五行雷达图
- [ ] 看到今日运势和宜忌
- [ ] 看到"模糊化"的完整报告预览
- [ ] 被吸引点击"立即解锁"按钮

### 故事 2: 注册用户想邀请好友
**作为** 一个已注册用户  
**我想要** 轻松地邀请好友  
**以便** 获得积分奖励

**验收标准**:
- [ ] 用户可以轻松找到邀请入口
- [ ] 看到清晰的奖励说明
- [ ] 看到自己的邀请进度
- [ ] 一键复制邀请码或链接
- [ ] 可以生成精美的邀请海报
- [ ] 可以直接分享到社交平台

### 故事 3: 用户想分享分析结果
**作为** 一个完成分析的用户  
**我想要** 分享我的分析结果  
**以便** 让朋友也了解我的命理

**验收标准**:
- [ ] 用户可以在结果页看到"生成海报"按钮
- [ ] 点击后快速生成精美海报
- [ ] 海报包含八字盘、五行图、关键结论
- [ ] 海报包含二维码和邀请码
- [ ] 用户可以下载或直接分享
- [ ] 朋友扫码后可以直接注册

### 故事 4: 用户想购买积分
**作为** 一个积分不足的用户  
**我想要** 了解不同套餐的价值  
**以便** 选择最适合我的套餐

**验收标准**:
- [ ] 用户可以清楚地看到每个套餐包含什么
- [ ] 可以使用计算器估算所需积分
- [ ] 看到其他用户的评价
- [ ] 看到明确的使用场景说明
- [ ] 购买流程简单快捷
- [ ] 支付成功后立即看到积分到账

### 故事 5: 用户每天打开App
**作为** 一个老用户  
**我想要** 看到个性化的Dashboard  
**以便** 快速访问我需要的功能

**验收标准**:
- [ ] 用户看到个性化的欢迎信息
- [ ] 看到签到状态和连续天数
- [ ] 看到剩余积分和会员等级
- [ ] 看到邀请进度
- [ ] 看到最近的分析记录
- [ ] 可以快速进入各项功能

---

## 设计要求

### 视觉设计
1. **色彩方案**
   - 主色：深紫色 (#7c3aed) - 神秘、智慧
   - 辅色：金色 (#fbbf24) - 尊贵、吉祥
   - 背景：深色 (#1a1a2e) + 白色 (#ffffff)
   - 渐变：紫色 → 蓝色 → 天蓝色

2. **图标风格**
   - 使用 Lucide Icons 或 Heroicons
   - 统一尺寸 (24x24 默认)
   - 配合文字使用

3. **排版**
   - 中文字体：思源黑体 / 苹方
   - 英文字体：Inter / Poppins
   - 标题层级清晰（H1-H6）
   - 行高 1.6-1.8

### 交互设计
1. **加载状态**
   - 使用Skeleton加载占位
   - 显示进度提示
   - 避免空白页面

2. **反馈机制**
   - 成功：Toast提示 + 绿色图标
   - 错误：Toast提示 + 红色图标
   - 等待：加载动画

3. **动画效果**
   - 淡入淡出 (fade)
   - 滑动 (slide)
   - 缩放 (scale)
   - 过渡时间 200-300ms

### 响应式设计
1. **断点**
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: > 1024px

2. **适配原则**
   - Mobile First
   - 触摸友好（按钮 > 44x44）
   - 避免悬停效果（移动端）

---

## 技术要求

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks + Context
- **图表**: Recharts (五行雷达图等)
- **Canvas**: HTML5 Canvas API (海报生成)
- **图片处理**: html2canvas (可选)

### API设计

#### 1. 即时体验API
```typescript
POST /api/instant-preview
Request: {
  birthDate: string; // "1990-01-01"
}
Response: {
  success: boolean;
  data: {
    dayPillar: string;
    wuxing: string;
    wuxingStrength: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    todayFortune: string;
    favorable: string[];
    unfavorable: string[];
  };
}
```

#### 2. 邀请数据API
```typescript
GET /api/invite/stats
Response: {
  success: boolean;
  data: {
    user: {...};
    stats: {...};
    invites: [...];
    leaderboard: [...];
    userRank: {...};
  };
}
```

#### 3. 海报生成API
```typescript
POST /api/share/generate-poster
Request: {
  analysisId: string;
}
Response: {
  success: boolean;
  posterUrl: string;
}
```

#### 4. Dashboard数据API
```typescript
GET /api/dashboard/overview
Response: {
  success: boolean;
  data: {
    user: {...};
    credits: {...};
    checkIn: {...};
    invites: {...};
    recentAnalyses: [...];
    recentTransactions: [...];
  };
}
```

### 性能要求
- **首屏加载**: < 2秒
- **API响应**: < 500ms (P95)
- **图片生成**: < 3秒
- **页面切换**: < 300ms

### 安全要求
- **API鉴权**: JWT Token
- **频率限制**: IP + User限流
- **输入验证**: Zod Schema
- **XSS防护**: 转义用户输入
- **CSRF防护**: Token验证

### 兼容性要求
- **浏览器**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **移动端**: iOS 14+, Android 10+
- **屏幕**: 320px - 2560px

---

## 验收标准

### 功能验收
- [ ] 所有新功能正常工作
- [ ] 无阻塞性bug
- [ ] 关键流程通畅
- [ ] 数据准确无误

### 性能验收
- [ ] Lighthouse评分 > 85
- [ ] 首屏加载 < 2秒
- [ ] API响应 < 500ms
- [ ] 无内存泄漏

### 用户体验验收
- [ ] UI符合设计稿
- [ ] 交互流畅自然
- [ ] 反馈及时明确
- [ ] 移动端体验良好

### 业务指标验收
- [ ] 首页转化率 +15%
- [ ] 邀请操作数 +50%
- [ ] 分享意愿率 +80%
- [ ] 付费转化率 +20%
- [ ] 用户参与度 +30%

---

## 风险与依赖

### 风险
1. **技术风险**
   - Canvas兼容性问题
   - 图片生成性能
   - 移动端适配

2. **业务风险**
   - 用户接受度
   - 转化率不达预期
   - 竞品跟进

3. **资源风险**
   - 开发时间紧张
   - 设计资源不足
   - 测试覆盖不够

### 依赖
1. **技术依赖**
   - Next.js 14稳定性
   - 第三方库兼容性
   - 支付接口可用性

2. **团队依赖**
   - 设计师（UI设计）
   - 前端工程师（实现）
   - 后端工程师（API）
   - 测试工程师（QA）

3. **外部依赖**
   - 微信分享SDK
   - 支付宝SDK
   - CDN稳定性

---

## 附录

### 参考资料
- [用户旅程评审报告](/@USER_JOURNEY_ANALYSIS_CORRECTED_v5.1.1.md)
- [Growth P0 文档](/docs/optimization/growth-p0-summary-v5.1.1.md)
- [现有积分系统](/src/credits/)
- [现有推荐系统](/src/credits/referral.ts)

### 相关页面
- 首页: `/src/app/[locale]/(marketing)/(home)/page.tsx`
- 定价页: `/src/app/[locale]/(marketing)/pricing/page.tsx`
- Dashboard: `/src/app/[locale]/(protected)/dashboard/page.tsx`

### 变更记录
| 版本 | 日期 | 变更内容 | 负责人 |
|------|------|---------|--------|
| v5.1.1 | 2025-10-12 | 初始版本 | 产品团队 |

---

**文档状态**: ✅ 已完成  
**下一步**: 创建技术设计文档 → TaskMaster任务分解
