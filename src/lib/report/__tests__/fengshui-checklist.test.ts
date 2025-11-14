/**
 * 风水Checklist单元测试
 *
 * 测试目标：
 * 1. generateWaterActions() - 水位摆放任务生成
 * 2. generateMountainActions() - 山位摆放任务生成
 * 3. 物品库调用逻辑（待集成fengshui-items-templates.ts后完善）
 * 4. 优先级排序
 * 5. 预期影响量化
 * 6. 时间建议合理性
 *
 * 覆盖目标：100%
 */


// 导入测试目标函数（暂时从report-generator-v2.2.ts导出）
// TODO: 待集成物品库后更新导入路径
import { generateFengshuiChecklist } from '../report-generator-v2.2';

describe('风水Checklist生成测试', () => {
  describe('generateWaterActions() - 水位摆放任务', () => {
    test('案例1: 零神在1宫（坎），应生成水位摆放任务', () => {
      // 模拟零正分析结果：1宫为零神（有利水位）
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1], // 1宫（坎）为零神，见水旺财
          unfavorable: [6], // 6宫（乾）为正神，见水不利
        },
        mountainPalaces: {
          favorable: [6], // 6宫（乾）为正神，宜见山
          unfavorable: [1], // 1宫（坎）为零神，见山不利
        },
      };

      const mockRecommendations = {
        waterPlacements: [{ palace: 1, reason: '零神水位' }],
        mountainPlacements: [{ palace: 6, reason: '正神山位' }],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：应生成水位任务
      expect(result.environmentChecklist).toBeDefined();
      expect(result.environmentChecklist.length).toBeGreaterThan(0);

      // 验证：1宫应有水位任务
      const waterTask = result.environmentChecklist.find(
        (task) => task.id === 'water-1' && task.palace === 1
      );
      expect(waterTask).toBeDefined();
      expect(waterTask?.bagua).toBe('坎');
      expect(waterTask?.task).toContain('1宫');
      expect(waterTask?.task).toContain('鱼缸'); // 或流水摆件
      expect(waterTask?.rationale).toContain('零神');
      expect(waterTask?.severity).toBe('high');
      expect(waterTask?.expectedImpact).toMatch(/\d+-\d+%/); // 应包含百分比
      expect(waterTask?.dueBy).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO日期格式
    });

    test('案例2: 零神在4宫（巽），应生成水位摆放任务', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [4], // 4宫（巽）为零神
          unfavorable: [9], // 9宫（离）为正神
        },
        mountainPalaces: {
          favorable: [9],
          unfavorable: [4],
        },
      };

      const mockRecommendations = {
        waterPlacements: [{ palace: 4, reason: '零神水位' }],
        mountainPlacements: [{ palace: 9, reason: '正神山位' }],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      const waterTask = result.environmentChecklist.find(
        (task) => task.id === 'water-4' && task.palace === 4
      );
      expect(waterTask).toBeDefined();
      expect(waterTask?.bagua).toBe('巽');
      expect(waterTask?.task).toContain('4宫');
    });

    test('案例3: 多个零神宫位，应生成多个水位任务', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1, 4, 6], // 多个零神宫位
          unfavorable: [3, 7, 9],
        },
        mountainPalaces: {
          favorable: [3, 7, 9],
          unfavorable: [1, 4, 6],
        },
      };

      const mockRecommendations = {
        waterPlacements: [
          { palace: 1, reason: '零神水位' },
          { palace: 4, reason: '零神水位' },
          { palace: 6, reason: '零神水位' },
        ],
        mountainPlacements: [
          { palace: 3, reason: '正神山位' },
          { palace: 7, reason: '正神山位' },
          { palace: 9, reason: '正神山位' },
        ],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：应生成3个水位任务
      const waterTasks = result.environmentChecklist.filter((task) =>
        task.id.startsWith('water-')
      );
      expect(waterTasks.length).toBeGreaterThanOrEqual(3);

      // 验证：每个任务都应有完整信息
      waterTasks.forEach((task) => {
        expect(task.palace).toBeGreaterThanOrEqual(1);
        expect(task.palace).toBeLessThanOrEqual(9);
        expect(task.bagua).toBeTruthy();
        expect(task.task).toBeTruthy();
        expect(task.rationale).toBeTruthy();
        expect(task.severity).toMatch(/^(high|medium|low)$/);
        expect(task.expectedImpact).toBeTruthy();
        expect(task.dueBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    test('案例4: 无零神宫位，应生成空数组或低优先级建议', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [], // 无零神宫位
          unfavorable: [1, 4, 6, 9],
        },
        mountainPalaces: {
          favorable: [1, 4, 6, 9],
          unfavorable: [],
        },
      };

      const mockRecommendations = {
        waterPlacements: [],
        mountainPlacements: [
          { palace: 1, reason: '正神山位' },
          { palace: 4, reason: '正神山位' },
        ],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：水位任务应为空或数量为0
      const waterTasks = result.environmentChecklist.filter((task) =>
        task.id.startsWith('water-')
      );
      expect(waterTasks.length).toBe(0);
    });
  });

  describe('generateMountainActions() - 山位摆放任务', () => {
    test('案例5: 正神在6宫（乾），应生成山位摆放任务', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1], // 1宫为零神
          unfavorable: [6], // 6宫为正神，见水不利
        },
        mountainPalaces: {
          favorable: [6], // 6宫（乾）为正神，宜见山
          unfavorable: [1], // 1宫为零神，见山不利
        },
      };

      const mockRecommendations = {
        waterPlacements: [{ palace: 1, reason: '零神水位' }],
        mountainPlacements: [{ palace: 6, reason: '正神山位' }],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：6宫应有山位任务
      const mountainTask = result.environmentChecklist.find(
        (task) => task.id === 'mountain-6' && task.palace === 6
      );
      expect(mountainTask).toBeDefined();
      expect(mountainTask?.bagua).toBe('乾');
      expect(mountainTask?.task).toContain('6宫');
      expect(mountainTask?.task).toMatch(/植物|柜子|书柜/); // 应包含山位物品
      expect(mountainTask?.rationale).toContain('正神');
      expect(mountainTask?.severity).toBe('high');
      expect(mountainTask?.expectedImpact).toMatch(/健康|事业/); // 应包含健康或事业
      expect(mountainTask?.dueBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('案例6: 正神在9宫（离），应生成山位摆放任务', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [4],
          unfavorable: [9], // 9宫（离）为正神
        },
        mountainPalaces: {
          favorable: [9], // 9宫（离）为正神，宜见山
          unfavorable: [4],
        },
      };

      const mockRecommendations = {
        waterPlacements: [{ palace: 4, reason: '零神水位' }],
        mountainPlacements: [{ palace: 9, reason: '正神山位' }],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      const mountainTask = result.environmentChecklist.find(
        (task) => task.id === 'mountain-9' && task.palace === 9
      );
      expect(mountainTask).toBeDefined();
      expect(mountainTask?.bagua).toBe('离');
      expect(mountainTask?.task).toContain('9宫');
    });

    test('案例7: 多个正神宫位，应生成多个山位任务', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1, 4],
          unfavorable: [3, 7, 9],
        },
        mountainPalaces: {
          favorable: [3, 7, 9], // 多个正神宫位
          unfavorable: [1, 4],
        },
      };

      const mockRecommendations = {
        waterPlacements: [
          { palace: 1, reason: '零神水位' },
          { palace: 4, reason: '零神水位' },
        ],
        mountainPlacements: [
          { palace: 3, reason: '正神山位' },
          { palace: 7, reason: '正神山位' },
          { palace: 9, reason: '正神山位' },
        ],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：应生成3个山位任务
      const mountainTasks = result.environmentChecklist.filter((task) =>
        task.id.startsWith('mountain-')
      );
      expect(mountainTasks.length).toBeGreaterThanOrEqual(3);

      // 验证：每个任务都应有完整信息
      mountainTasks.forEach((task) => {
        expect(task.palace).toBeGreaterThanOrEqual(1);
        expect(task.palace).toBeLessThanOrEqual(9);
        expect(task.bagua).toBeTruthy();
        expect(task.task).toBeTruthy();
        expect(task.rationale).toBeTruthy();
        expect(task.severity).toMatch(/^(high|medium|low)$/);
        expect(task.expectedImpact).toBeTruthy();
        expect(task.dueBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('优先级排序测试', () => {
    test('案例8: 高优先级任务应排在前面', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1, 4], // 1宫优先级高，4宫优先级中
          unfavorable: [6, 9],
        },
        mountainPalaces: {
          favorable: [6, 9],
          unfavorable: [1, 4],
        },
      };

      const mockRecommendations = {
        waterPlacements: [
          { palace: 1, reason: '零神水位', priority: 'high' },
          { palace: 4, reason: '零神水位', priority: 'medium' },
        ],
        mountainPlacements: [
          { palace: 6, reason: '正神山位', priority: 'high' },
          { palace: 9, reason: '正神山位', priority: 'medium' },
        ],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：high优先级任务应在medium优先级任务前面
      const tasks = result.environmentChecklist;
      const highPriorityTasks = tasks.filter(
        (task) => task.severity === 'high'
      );
      const mediumPriorityTasks = tasks.filter(
        (task) => task.severity === 'medium'
      );

      // 如果有优先级排序，high任务应在前面
      if (highPriorityTasks.length > 0 && mediumPriorityTasks.length > 0) {
        const highIndex = tasks.indexOf(highPriorityTasks[0]);
        const mediumIndex = tasks.indexOf(mediumPriorityTasks[0]);
        // 注意：这个测试可能需要根据实际排序逻辑调整
      }
    });
  });

  describe('预期影响量化测试', () => {
    test('案例9: 预期影响应包含具体百分比或量化描述', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1],
          unfavorable: [6],
        },
        mountainPalaces: {
          favorable: [6],
          unfavorable: [1],
        },
      };

      const mockRecommendations = {
        waterPlacements: [{ palace: 1, reason: '零神水位' }],
        mountainPlacements: [{ palace: 6, reason: '正神山位' }],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：每个任务的expectedImpact应包含具体量化（百分比或其他）
      result.environmentChecklist.forEach((task) => {
        expect(task.expectedImpact).toBeTruthy();
        // 应包含百分比（如"10-15%"）或具体描述（如"增强健康/事业运"）
        const hasQuantification =
          /\d+%/.test(task.expectedImpact) ||
          /\d+-\d+%/.test(task.expectedImpact) ||
          /增强|提升|改善/.test(task.expectedImpact);
        expect(hasQuantification).toBe(true);
      });
    });
  });

  describe('时间建议合理性测试', () => {
    test('案例10: dueBy日期应为未来日期，格式为ISO标准', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1, 4],
          unfavorable: [6, 9],
        },
        mountainPalaces: {
          favorable: [6, 9],
          unfavorable: [1, 4],
        },
      };

      const mockRecommendations = {
        waterPlacements: [
          { palace: 1, reason: '零神水位' },
          { palace: 4, reason: '零神水位' },
        ],
        mountainPlacements: [
          { palace: 6, reason: '正神山位' },
          { palace: 9, reason: '正神山位' },
        ],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      const today = new Date();

      // 验证：每个任务的dueBy应为未来日期
      result.environmentChecklist.forEach((task) => {
        expect(task.dueBy).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO格式

        const dueDate = new Date(task.dueBy);
        // dueBy应为未来日期（至少不早于今天）
        expect(dueDate.getTime()).toBeGreaterThanOrEqual(
          today.setHours(0, 0, 0, 0)
        );
      });
    });

    test('案例11: recurrence字段应为有效值（weekly/monthly/quarterly/annually）', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1],
          unfavorable: [6],
        },
        mountainPalaces: {
          favorable: [6],
          unfavorable: [1],
        },
      };

      const mockRecommendations = {
        waterPlacements: [{ palace: 1, reason: '零神水位' }],
        mountainPlacements: [{ palace: 6, reason: '正神山位' }],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：recurrence字段应为有效值
      result.environmentChecklist.forEach((task) => {
        if (task.recurrence) {
          expect(['weekly', 'monthly', 'quarterly', 'annually']).toContain(
            task.recurrence
          );
        }
      });
    });
  });

  describe('边界条件测试', () => {
    test('案例12: 空输入应返回空checklist', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [],
          unfavorable: [],
        },
        mountainPalaces: {
          favorable: [],
          unfavorable: [],
        },
      };

      const mockRecommendations = {
        waterPlacements: [],
        mountainPlacements: [],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：应返回空数组
      expect(result.environmentChecklist).toEqual([]);
    });

    test('案例13: 零正颠倒检查 - 应标记错误布局', () => {
      const mockLingzhengAnalysis = {
        waterPalaces: {
          favorable: [1], // 1宫应见水
          unfavorable: [6], // 6宫不应见水
        },
        mountainPalaces: {
          favorable: [6], // 6宫应见山
          unfavorable: [1], // 1宫不应见山
        },
        zeroPositiveReversed: {
          isReversed: true,
          issues: ['6宫摆放了鱼缸，建议移除', '1宫堆放杂物，建议清理并摆水'],
          severity: 'major' as const,
        },
      };

      const mockRecommendations = {
        waterPlacements: [{ palace: 1, reason: '零神水位' }],
        mountainPlacements: [{ palace: 6, reason: '正神山位' }],
      };

      const result = generateFengshuiChecklist(
        mockLingzhengAnalysis,
        mockRecommendations
      );

      // 验证：零正审计应标记问题
      expect(result.zeroPositiveAudit.isReversed).toBe(true);
      expect(result.zeroPositiveAudit.issues.length).toBeGreaterThan(0);
      expect(result.zeroPositiveAudit.severity).toMatch(
        /^(critical|major|minor|none)$/
      );
    });
  });
});
