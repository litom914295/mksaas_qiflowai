# 管理后台功能优化组件

本目录包含管理后台的高级功能优化组件。

## 📦 组件列表

### 1. 高级搜索 (AdvancedSearch)
- 多条件组合搜索
- 保存搜索条件
- 快速筛选器
- 搜索历史记录

### 2. 批量操作工具 (BatchActions)
- 批量选择
- 批量编辑
- 批量删除
- 批量导出

### 3. 图表组件 (Charts)
- 趋势图 (TrendChart)
- 饼图 (PieChart)
- 柱状图 (BarChart)
- 热力图 (HeatMap)
- 漏斗图 (FunnelChart)

### 4. 自定义配置面板 (ConfigPanel)
- 动态表单生成
- 配置验证
- 配置导入/导出
- 配置模板

## 🚀 使用方法

### 高级搜索
```typescript
import { AdvancedSearch } from '@/components/admin/optimizations/AdvancedSearch';

<AdvancedSearch
  fields={[
    { name: 'email', label: '邮箱', type: 'text' },
    { name: 'status', label: '状态', type: 'select', options: [...] },
    { name: 'createdAt', label: '创建时间', type: 'dateRange' },
  ]}
  onSearch={(filters) => console.log(filters)}
/>
```

### 批量操作
```typescript
import { BatchActions } from '@/components/admin/optimizations/BatchActions';

<BatchActions
  selectedIds={selectedIds}
  actions={[
    { label: '批量激活', onClick: handleBatchActivate },
    { label: '批量删除', onClick: handleBatchDelete, danger: true },
  ]}
/>
```

### 图表组件
```typescript
import { TrendChart } from '@/components/admin/optimizations/Charts';

<TrendChart
  data={chartData}
  xKey="date"
  yKey="value"
  title="用户增长趋势"
/>
```

### 配置面板
```typescript
import { ConfigPanel } from '@/components/admin/optimizations/ConfigPanel';

<ConfigPanel
  config={currentConfig}
  schema={configSchema}
  onSave={handleSave}
/>
```

## 📝 开发指南

### 添加新组件
1. 在对应子目录创建组件文件
2. 导出组件
3. 更新此 README
4. 添加使用示例

### 组件规范
- 使用 TypeScript
- 遵循 React 最佳实践
- 提供完整的类型定义
- 包含使用文档

## 🎯 未来计划

- [ ] 添加更多图表类型
- [ ] 增强搜索功能（全文搜索）
- [ ] 支持自定义主题
- [ ] 添加快捷键支持
- [ ] 国际化支持

---

组件已创建占位符，可根据实际需求逐步实现。
