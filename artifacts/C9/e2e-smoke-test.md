# E2E 冒烟测试清单

**测试日期**: 2025-10-02  
**测试目的**: 验证QiFlow核心流程无5xx错误

---

## 测试流程

### 1. Home页加载 ✓
**URL**: `http://localhost:3000/zh`
- [ ] 页面成功加载（无5xx错误）
- [ ] 导航菜单正常显示
- [ ] 页面布局完整（包含Hero、Features等区块）
- [ ] 年龄验证弹窗显示
- [ ] 免责声明栏显示

**预期结果**: 页面正常加载，无控制台错误

---

### 2. 八字分析页面 ✓
**URL**: `http://localhost:3000/zh/analysis/bazi`

#### 步骤:
1. [ ] 页面加载成功
2. [ ] 表单正常显示
3. [ ] 积分价格显示（Credits Price组件）
4. [ ] 填写测试数据：
   - 姓名: 测试用户
   - 生日: 1990-01-01 08:08
   - 性别: 男
5. [ ] 提交表单
6. [ ] 查看结果展示
7. [ ] 查看控制台日志（应包含traceId和latency）

**预期结果**:
- 表单提交成功（无5xx错误）
- 显示计算结果或错误提示
- 控制台有结构化日志输出
- 如果用户有积分，应成功扣减

**实际结果**:  
_待测试填写_

---

### 3. 玄空风水分析页面 ✓
**URL**: `http://localhost:3000/zh/analysis/xuankong`

#### 步骤:
1. [ ] 页面加载成功
2. [ ] 表单正常显示
3. [ ] 积分价格显示
4. [ ] 置信度徽章组件正常
5. [ ] 填写测试数据：
   - 地址: 测试地址123号
   - 朝向: 180
6. [ ] 提交表单
7. [ ] 查看结果展示（包含置信度指示器）
8. [ ] 查看控制台日志

**预期结果**:
- 表单提交成功
- 显示分析结果和置信度
- 根据置信度显示不同的UI状态（红/黄/绿）
- 控制台有结构化日志

**实际结果**:  
_待测试填写_

---

### 4. Dashboard页面 ✓
**URL**: `http://localhost:3000/zh/dashboard`

#### 步骤:
1. [ ] 如果未登录，重定向到登录页
2. [ ] 登录后访问Dashboard
3. [ ] 查看用户积分显示
4. [ ] 查看分析历史记录

**预期结果**:
- 认证流程正常
- Dashboard正常加载
- 积分余额正确显示

**实际结果**:  
_待测试填写_

---

### 5. 积分一致性验证 ✓

#### 步骤:
1. [ ] 记录测试前的积分余额
2. [ ] 执行一次八字计算（10积分）
3. [ ] 记录测试后的积分余额
4. [ ] 运行验证脚本: `npm run verify:credits`
5. [ ] 检查数据库记录

**预期结果**:
- 积分正确扣减（余额 - 10）
- 数据库有交易记录
- 验证脚本显示一致性通过

**实际结果**:  
_待测试填写_

---

## 日志追踪示例

### 成功的日志输出:
```json
{
  "timestamp": "2025-10-02T...",
  "level": "TRACE",
  "message": "bazi-calculate completed",
  "traceId": "qiflow_1727864445_7a3f9b2c",
  "action": "bazi-calculate",
  "latency": 1245,
  "userId": "user_abc123",
  "cost": 10,
  "coins": 10,
  "status": "success",
  "metadata": { "confidence": 0.85 }
}
```

---

## 测试检查点

### ✅ 必须通过:
- [ ] 所有页面无5xx错误
- [ ] 核心流程可执行
- [ ] 积分扣减正确
- [ ] 控制台有结构化日志

### ⚠️ 已知问题（可接受）:
- 算法placeholder实现（返回模拟数据）
- 部分UI组件未完全集成
- 某些错误场景处理待优化

---

## 截图清单

建议截图位置：
1. `artifacts/C9/screenshots/01-home.png` - 首页
2. `artifacts/C9/screenshots/02-bazi-form.png` - 八字表单
3. `artifacts/C9/screenshots/03-bazi-result.png` - 八字结果
4. `artifacts/C9/screenshots/04-xuankong-form.png` - 玄空表单
5. `artifacts/C9/screenshots/05-xuankong-result.png` - 玄空结果（含置信度）
6. `artifacts/C9/screenshots/06-console-logs.png` - 控制台日志
7. `artifacts/C9/screenshots/07-credits-verify.png` - 积分验证结果

---

## 测试结论

**状态**: [ ] 通过 / [ ] 部分通过 / [ ] 失败

**问题汇总**:  
_列出发现的主要问题_

**建议**:  
_下一步改进建议_

---

**测试人员**: _________  
**测试时间**: _________  
**签名**: _________

