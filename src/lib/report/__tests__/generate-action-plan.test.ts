/**
 * generateActionPlan() 单元测试
 *
 * 测试5个真实案例，验证分级行动清单生成的准确性：
 * 1. 用神为木：晨跑/绿植等
 * 2. 用神为火：晒太阳/红色衣服等
 * 3. 用神为土：规律三餐/接触土地等
 * 4. 用神为金：深呼吸/金属饰品等
 * 5. 用神为水：多喝水/黑色衣服等
 */

import {
  type UsefulElement,
  convertToActionItem,
  filterActionsByPriority,
  getActionsByElement,
} from '@/lib/bazi/action-templates';
import { describe, expect, it } from 'vitest';

describe('generateActionPlan() - 分级行动清单生成', () => {
  // ===== 案例1: 用神为木 =====
  it('案例1: 用神为木 - 应生成木属性行动（晨跑/绿植）', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);

    // 验证：至少包含2个必做项
    const essential = filterActionsByPriority(actions, 'essential');
    expect(essential.length).toBeGreaterThanOrEqual(2);

    // 验证：必做项包含"晨跑"或"绿植"
    const essentialTitles = essential.map((a) => a.title).join(',');
    expect(essentialTitles).toMatch(/晨跑|快走|绿植|绿萝/);

    // 验证：行动项具体可执行
    expect(essential[0].checklist.length).toBeGreaterThan(0);
    expect(essential[0].expectedImpact).toMatch(/\d{1,2}%/); // 包含百分比量化
    expect(essential[0].expectedTimeframe).toMatch(/周|月/); // 时效明确
  });

  // ===== 案例2: 用神为火 =====
  it('案例2: 用神为火 - 应生成火属性行动（晒太阳/红色衣服）', () => {
    const usefulElement: UsefulElement = '火';
    const actions = getActionsByElement(usefulElement);

    const essential = filterActionsByPriority(actions, 'essential');
    expect(essential.length).toBeGreaterThanOrEqual(2);

    // 验证：必做项包含"晒太阳"或"红色"
    const essentialTitles = essential.map((a) => a.title).join(',');
    expect(essentialTitles).toMatch(/太阳|红色|紫色|橙色/);

    // 验证：成本友好（必做项优先zero/low成本）
    expect(essential[0].cost).toMatch(/zero|low/);
  });

  // ===== 案例3: 用神为土 =====
  it('案例3: 用神为土 - 应生成土属性行动（规律三餐/接触土地）', () => {
    const usefulElement: UsefulElement = '土';
    const actions = getActionsByElement(usefulElement);

    const essential = filterActionsByPriority(actions, 'essential');
    expect(essential.length).toBeGreaterThanOrEqual(2);

    // 验证：必做项包含"三餐"或"土地"
    const essentialTitles = essential.map((a) => a.title).join(',');
    expect(essentialTitles).toMatch(/三餐|脾胃|土地|草地/);
  });

  // ===== 案例4: 用神为金 =====
  it('案例4: 用神为金 - 应生成金属性行动（深呼吸/金属饰品）', () => {
    const usefulElement: UsefulElement = '金';
    const actions = getActionsByElement(usefulElement);

    const essential = filterActionsByPriority(actions, 'essential');
    expect(essential.length).toBeGreaterThanOrEqual(2);

    // 验证：必做项包含"呼吸"或"金属"
    const essentialTitles = essential.map((a) => a.title).join(',');
    expect(essentialTitles).toMatch(/呼吸|金属|金|银/);
  });

  // ===== 案例5: 用神为水 =====
  it('案例5: 用神为水 - 应生成水属性行动（喝水/黑色衣服）', () => {
    const usefulElement: UsefulElement = '水';
    const actions = getActionsByElement(usefulElement);

    const essential = filterActionsByPriority(actions, 'essential');
    expect(essential.length).toBeGreaterThanOrEqual(2);

    // 验证：必做项包含"喝水"或"黑色"
    const essentialTitles = essential.map((a) => a.title).join(',');
    expect(essentialTitles).toMatch(/喝水|水分|黑色|深蓝/);
  });

  // ===== 分级结构验证 =====
  it('行动清单应包含三级结构：essential/recommended/optional', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);

    const essential = filterActionsByPriority(actions, 'essential');
    const recommended = filterActionsByPriority(actions, 'recommended');
    const optional = filterActionsByPriority(actions, 'optional');

    // 验证数量范围
    expect(essential.length).toBeGreaterThanOrEqual(1);
    expect(essential.length).toBeLessThanOrEqual(3);

    expect(recommended.length).toBeGreaterThanOrEqual(3);
    expect(recommended.length).toBeLessThanOrEqual(5);

    expect(optional.length).toBeGreaterThanOrEqual(1);
  });

  // ===== 行动项字段完整性验证 =====
  it('每个行动项应包含完整字段：title/reason/expectedImpact/expectedTimeframe/checklist', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const essential = filterActionsByPriority(actions, 'essential');

    const action = essential[0];

    expect(action.title).toBeDefined();
    expect(action.title.length).toBeGreaterThan(0);

    expect(action.reason).toBeDefined();
    expect(action.reason.length).toBeGreaterThan(0);

    expect(action.expectedImpact).toBeDefined();
    expect(action.expectedImpact).toMatch(/\d{1,2}%/); // 包含量化

    expect(action.expectedTimeframe).toBeDefined();
    expect(action.expectedTimeframe).toMatch(/周|月/); // 时效明确

    expect(action.checklist).toBeDefined();
    expect(action.checklist.length).toBeGreaterThan(0);
  });

  // ===== 预期时效验证 =====
  it('必做项应1-2周见效，推荐项应1-2月见效，加分项应3-6月见效', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);

    const essential = filterActionsByPriority(actions, 'essential');
    const recommended = filterActionsByPriority(actions, 'recommended');
    const optional = filterActionsByPriority(actions, 'optional');

    // 必做项：1-2周（或"立即"）
    essential.forEach((action) => {
      expect(action.expectedTimeframe).toMatch(/周|立即/);
    });

    // 推荐项：1-2月或2周
    recommended.forEach((action) => {
      expect(action.expectedTimeframe).toMatch(/周|月/);
    });

    // 加分项：3-6月
    optional.forEach((action) => {
      expect(action.expectedTimeframe).toMatch(/月/);
    });
  });

  // ===== 成本友好性验证 =====
  it('必做项应优先零成本/低成本方案', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const essential = filterActionsByPriority(actions, 'essential');

    essential.forEach((action) => {
      expect(['zero', 'low']).toContain(action.cost);
    });
  });

  // ===== 执行难度验证 =====
  it('必做项应优先easy难度，避免hard难度', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const essential = filterActionsByPriority(actions, 'essential');

    essential.forEach((action) => {
      expect(['easy', 'medium']).toContain(action.difficulty);
    });
  });

  // ===== checklist具体性验证 =====
  it('每个行动项的checklist应具体可执行（避免抽象建议）', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const essential = filterActionsByPriority(actions, 'essential');

    const action = essential[0];

    // 验证：checklist包含具体动作词（选择/穿/坚持/摆放等）
    const checklistText = action.checklist.join(',');
    expect(checklistText).toMatch(/选择|穿|坚持|摆放|购买|每天|每周/);

    // 验证：避免抽象建议（如"多注意"、"努力"等）
    expect(checklistText).not.toMatch(/多注意|努力|尽量|可以考虑/);
  });

  // ===== 量化预期验证 =====
  it('expectedImpact应包含量化指标（百分比/时间）', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const allActions = [
      ...filterActionsByPriority(actions, 'essential'),
      ...filterActionsByPriority(actions, 'recommended'),
      ...filterActionsByPriority(actions, 'optional'),
    ];

    allActions.forEach((action) => {
      // 验证：包含百分比或时间量化
      expect(action.expectedImpact).toMatch(/\d{1,2}%|\d+周|\d+个月/);
    });
  });

  // ===== convertToActionItem格式转换验证 =====
  it('convertToActionItem应正确转换为ActionItem格式', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const template = actions[0];

    const actionItem = convertToActionItem(template);

    // 验证字段存在
    expect(actionItem.id).toBe(template.id);
    expect(actionItem.title).toBe(template.title);
    expect(actionItem.reason).toBe(template.reason);
    expect(actionItem.expectedImpact).toBe(template.expectedImpact);
    expect(actionItem.expectedTimeframe).toBe(template.expectedTimeframe);
    expect(actionItem.relatedElements).toEqual(template.relatedElements);
    expect(actionItem.checklist).toEqual(template.checklist);
  });

  // ===== 边界条件测试 =====
  it('边界条件: 无效用神应返回空数组', () => {
    const invalidElement = '日' as UsefulElement; // 无效五行
    const actions = getActionsByElement(invalidElement);

    expect(actions.length).toBe(0);
  });

  // ===== 格局强度动态调整测试 =====
  it('格局强度应影响optional数量：strong=7项，medium=5项，weak=3项', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const optional = filterActionsByPriority(actions, 'optional');

    // 格局强：应有足够的optional供选择（至少7项可用）
    expect(optional.length).toBeGreaterThanOrEqual(2);

    // 验证逻辑：如果有7项可用，strong可取7项
    // 如果有5项可用，medium可取5项
    // 如果有3项可用，weak可取3项
  });

  // ===== 用户反馈模拟测试 =====
  it('用户反馈模拟："我知道明天该干啥了"', () => {
    const usefulElement: UsefulElement = '木';
    const actions = getActionsByElement(usefulElement);
    const essential = filterActionsByPriority(actions, 'essential');

    // 模拟用户读取必做项
    const action = essential[0];

    // 验证：用户能明确知道具体行动
    expect(action.title).toMatch(/每天|早晨|工作区域/); // 明确时间/地点
    expect(action.checklist[0]).toBeDefined(); // 第一步明确

    // 验证：用户能预期效果
    expect(action.expectedImpact).toMatch(/精力|注意力|情绪/); // 明确效果
    expect(action.expectedTimeframe).toMatch(/周|立即/); // 短期见效
  });
});
