/**
 * 风水分析结果展示组件
 *
 * 提供飞星盘可视化、九宫格吉凶颜色标识
 * 支持房间评分和建议显示
 */

'use client';

import type { EnhancedBaziResult } from '@/lib/bazi/enhanced-calculator';
import {
  PALACE_PROFILES,
  buildStackedPlates,
  computeLayeredEvaluation,
} from '@/lib/qiflow/xuankong';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
// TODO: 房屋分析相关类型 - 暂时定义占位
type Room = {
  id: string;
  name?: string;
  type: string;
  area: number;
};
type Door = any;
type Wall = any;
type Window = any;
type RoomMappingResult = {
  roomId: string;
  palaceIndex: number;
};
type SpaceMappingResult = {
  roomMappings: RoomMappingResult[];
};

interface FengshuiDisplayProps {
  spaceMapping: SpaceMappingResult;
  rooms: Room[];
  walls?: Wall[];
  doors?: Door[];
  windows?: Window[];
  // 个性化：传入八字分析结果（可选）
  bazi?: EnhancedBaziResult | null;
  onRoomSelect?: (roomId: string | null) => void;
  className?: string;
}

interface FlyingStarData {
  palaceIndex: number;
  mountainStar: number;
  facingStar: number;
  periodStar: number;
  score: number;
  color: string;
  description: string;
}

interface RoomAnalysis {
  roomId: string;
  palaceIndex: number;
  score: number;
  color: string;
  suggestions: string[];
  warnings: string[];
  favorableElements: string[];
  unfavorableElements: string[];
}

interface FengshuiState {
  flyingStars: FlyingStarData[];
  roomAnalyses: RoomAnalysis[];
  selectedPalace: number | null;
  selectedRoom: string | null;
  showDetails: boolean;
  viewMode: 'overview' | 'detailed' | 'comparison';
}

export const FengshuiDisplay: React.FC<FengshuiDisplayProps> = ({
  spaceMapping,
  rooms,
  // walls,
  // doors,
  // windows,
  bazi,
  onRoomSelect,
  className = '',
}) => {
  const [state, setState] = useState<FengshuiState>({
    flyingStars: [],
    roomAnalyses: [],
    selectedPalace: null,
    selectedRoom: null,
    showDetails: false,
    viewMode: 'overview',
  });
  const [weights, setWeights] = useState<{
    year: number;
    month: number;
    day: number;
  }>({ year: 0.3, month: 0.2, day: 0.1 });

  // 生成飞星数据
  const generateFlyingStars = useCallback((): FlyingStarData[] => {
    // 使用真实分层：构建 period/year/month/day 盘
    const now = new Date();
    const seed =
      now.getUTCFullYear() * 10000 +
      (now.getUTCMonth() + 1) * 100 +
      now.getUTCDate();
    const plates = buildStackedPlates(seed, false, false);

    const personalization = (bazi as any)?.yongshen
      ? {
          favorableElements: (bazi as any).yongshen.favorable,
          unfavorableElements: (bazi as any).yongshen.unfavorable,
        }
      : undefined;

    const layered = computeLayeredEvaluation({
      periodPlate: plates.period,
      yearPlate: plates.year,
      monthPlate: plates.month,
      dayPlate: plates.day,
      temporalWeights: {
        year: weights.year,
        month: weights.month,
        day: weights.day,
      },
      personalization,
    } as any);

    // 将层叠结果同步到本地，供报告页读取
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        const payload = {
          perPalace: layered.perPalace,
          notes: layered.notes,
          weights,
          personalization,
          timestamp: new Date().toISOString(),
        };
        window.localStorage.setItem(
          'fengshui_layered',
          JSON.stringify(payload)
        );
      }
    } catch {}

    const stars: FlyingStarData[] = [];
    for (let i = 1; i <= 9; i++) {
      const cell =
        (plates.period as any).find((c: any) => c.palace === i) || {};
      const mountainStar = cell.mountainStar ?? ((i + 2) % 9) + 1;
      const facingStar = cell.facingStar ?? ((i + 4) % 9) + 1;
      const periodStar = cell.periodStar ?? i;
      const score =
        (layered.perPalace as any)[i]?.score ??
        calculatePalaceScore(mountainStar, facingStar, periodStar);
      const color = getScoreColor(score);
      const description = getPalaceDescription(i, score);

      stars.push({
        palaceIndex: i,
        mountainStar,
        facingStar,
        periodStar,
        score,
        color,
        description,
      });
    }

    return stars;
  }, [bazi]);

  // 生成房间分析
  const generateRoomAnalyses = useCallback(
    (rooms: Room[], roomMappings: RoomMappingResult[]): RoomAnalysis[] => {
      return rooms.map((room) => {
        const mapping = roomMappings.find((m) => m.roomId === room.id);
        const palaceIndex = mapping?.palaceIndex || 1;

        const score = calculateRoomScore(room, palaceIndex);
        const color = getScoreColor(score);
        const suggestions = generateRoomSuggestions(room, palaceIndex, score);
        const warnings = generateRoomWarnings(room, palaceIndex, score);
        const favorableElements = getFavorableElements(room, palaceIndex);
        const unfavorableElements = getUnfavorableElements(room, palaceIndex);

        return {
          roomId: room.id,
          palaceIndex,
          score,
          color,
          suggestions,
          warnings,
          favorableElements,
          unfavorableElements,
        };
      });
    },
    []
  );

  // 计算宫位得分
  const calculatePalaceScore = (
    mountainStar: number,
    facingStar: number,
    periodStar: number
  ): number => {
    // 简化的飞星评分算法
    let score = 50; // 基础分

    // 山星评分
    if (mountainStar === 1 || mountainStar === 6 || mountainStar === 8)
      score += 20;
    else if (mountainStar === 2 || mountainStar === 5 || mountainStar === 7)
      score -= 15;

    // 向星评分
    if (facingStar === 1 || facingStar === 6 || facingStar === 8) score += 20;
    else if (facingStar === 2 || facingStar === 5 || facingStar === 7)
      score -= 15;

    // 运星评分
    if (periodStar === 1 || periodStar === 6 || periodStar === 8) score += 10;
    else if (periodStar === 2 || periodStar === 5 || periodStar === 7)
      score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  // 计算房间得分
  const calculateRoomScore = (room: Room, palaceIndex: number): number => {
    // 基于房间类型和宫位的评分
    let score = 50;

    // 房间类型评分
    const roomTypeScores: Record<string, number> = {
      living_room: 80,
      bedroom: 75,
      kitchen: 70,
      study: 85,
      dining_room: 75,
      bathroom: 60,
      storage: 50,
      balcony: 65,
      corridor: 40,
      unknown: 50,
    };

    score += (roomTypeScores[room.type] || 50) - 50;

    // 宫位评分
    const palaceScores = [0, 80, 60, 70, 50, 40, 75, 85, 90, 65]; // 1-9宫位
    score += palaceScores[palaceIndex] - 50;

    // 面积评分
    if (room.area > 20000)
      score += 10; // 大房间
    else if (room.area < 5000) score -= 10; // 小房间

    return Math.max(0, Math.min(100, score));
  };

  // 获取得分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // 绿色 - 优秀
    if (score >= 60) return '#8BC34A'; // 浅绿 - 良好
    if (score >= 40) return '#FFC107'; // 黄色 - 一般
    if (score >= 20) return '#FF9800'; // 橙色 - 较差
    return '#F44336'; // 红色 - 很差
  };

  // 获取宫位描述
  const getPalaceDescription = (palaceIndex: number, score: number): string => {
    const profile =
      PALACE_PROFILES[palaceIndex as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9];
    const quality =
      score >= 80
        ? '极佳'
        : score >= 60
          ? '良好'
          : score >= 40
            ? '一般'
            : '较差';
    if (!profile) return `第${palaceIndex}宫 - ${quality}`;
    return `${profile.name} · 主：${profile.governs} · 评估：${quality}`;
  };

  // 生成房间建议
  const generateRoomSuggestions = (
    room: Room,
    palaceIndex: number,
    score: number
  ): string[] => {
    const suggestions: string[] = [];

    if (score < 60) {
      suggestions.push('建议调整房间布局以改善风水');
      suggestions.push('可考虑添加风水摆件');
    }

    if (room.type === 'bedroom' && palaceIndex === 2) {
      suggestions.push('卧室位于东北宫位，适合学习区域');
    }

    if (room.type === 'kitchen' && palaceIndex === 4) {
      suggestions.push('厨房位于东南宫位，财运较佳');
    }

    return suggestions;
  };

  // 生成房间警告
  const generateRoomWarnings = (
    room: Room,
    palaceIndex: number,
    score: number
  ): string[] => {
    const warnings: string[] = [];

    if (score < 30) {
      warnings.push('此房间风水较差，需要重点关注');
    }

    if (room.type === 'bathroom' && palaceIndex === 1) {
      warnings.push('卫生间位于正北宫位，可能影响事业运');
    }

    return warnings;
  };

  // 获取有利元素
  const getFavorableElements = (room: Room, palaceIndex: number): string[] => {
    const elements: string[] = [];

    if (palaceIndex === 1 || palaceIndex === 6) elements.push('水');
    if (palaceIndex === 2 || palaceIndex === 7) elements.push('土');
    if (palaceIndex === 3 || palaceIndex === 8) elements.push('木');
    if (palaceIndex === 4 || palaceIndex === 9) elements.push('木');
    if (palaceIndex === 5) elements.push('土');

    return elements;
  };

  // 获取不利元素
  const getUnfavorableElements = (
    room: Room,
    palaceIndex: number
  ): string[] => {
    const elements: string[] = [];

    if (palaceIndex === 1 || palaceIndex === 6) elements.push('火');
    if (palaceIndex === 2 || palaceIndex === 7) elements.push('木');
    if (palaceIndex === 3 || palaceIndex === 8) elements.push('金');
    if (palaceIndex === 4 || palaceIndex === 9) elements.push('金');
    if (palaceIndex === 5) elements.push('水');

    return elements;
  };

  // 初始化风水分析
  const initializeFengshuiAnalysis = useCallback(() => {
    // 生成飞星数据
    const flyingStars = generateFlyingStars();

    // 生成房间分析
    const roomAnalyses = generateRoomAnalyses(rooms, spaceMapping.roomMappings);

    setState((prev) => ({
      ...prev,
      flyingStars,
      roomAnalyses,
    }));
  }, [
    rooms,
    spaceMapping.roomMappings,
    generateFlyingStars,
    generateRoomAnalyses,
  ]);

  // 初始化风水分析数据
  useEffect(() => {
    initializeFengshuiAnalysis();
  }, [initializeFengshuiAnalysis]);

  // 处理宫位点击
  const handlePalaceClick = useCallback((palaceIndex: number) => {
    setState((prev) => ({
      ...prev,
      selectedPalace: prev.selectedPalace === palaceIndex ? null : palaceIndex,
    }));
  }, []);

  // 处理房间点击
  const handleRoomClick = useCallback(
    (roomId: string) => {
      setState((prev) => ({
        ...prev,
        selectedRoom: prev.selectedRoom === roomId ? null : roomId,
      }));

      if (onRoomSelect) {
        onRoomSelect(roomId);
      }
    },
    [onRoomSelect]
  );

  // 切换视图模式
  const handleViewModeChange = useCallback(
    (mode: 'overview' | 'detailed' | 'comparison') => {
      setState((prev) => ({ ...prev, viewMode: mode }));
    },
    []
  );

  // 获取选中的宫位数据
  const selectedPalaceData = state.selectedPalace
    ? state.flyingStars.find((s) => s.palaceIndex === state.selectedPalace)
    : null;

  // 获取选中的房间数据
  const selectedRoomData = state.selectedRoom
    ? state.roomAnalyses.find((r) => r.roomId === state.selectedRoom)
    : null;

  return (
    <div className={`fengshui-display ${className}`}>
      {/* 控制面板 */}
      <div className="control-panel bg-white p-4 shadow-lg rounded-lg mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">风水分析结果</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleViewModeChange('overview')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                state.viewMode === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              总览
            </button>
            <button
              onClick={() => handleViewModeChange('detailed')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                state.viewMode === 'detailed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              详细
            </button>
            <button
              onClick={() => handleViewModeChange('comparison')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                state.viewMode === 'comparison'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              对比
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">总房间数:</span> {rooms.length}
          </div>
          <div>
            <span className="font-medium">平均得分:</span>{' '}
            {Math.round(
              state.roomAnalyses.reduce((sum, r) => sum + r.score, 0) /
                state.roomAnalyses.length || 0
            )}
          </div>
          <div>
            <span className="font-medium">优秀房间:</span>{' '}
            {state.roomAnalyses.filter((r) => r.score >= 80).length}
          </div>
          <div>
            <span className="font-medium">需要改善:</span>{' '}
            {state.roomAnalyses.filter((r) => r.score < 60).length}
          </div>
        </div>
        {/* 分层权重调节 */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="font-medium">分层权重:</div>
          <label className="flex items-center gap-1">
            年
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={weights.year}
              onChange={(e) =>
                setWeights((w) => ({
                  ...w,
                  year: Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                }))
              }
              className="w-20 px-2 py-1 border rounded"
            />
          </label>
          <label className="flex items-center gap-1">
            月
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={weights.month}
              onChange={(e) =>
                setWeights((w) => ({
                  ...w,
                  month: Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                }))
              }
              className="w-20 px-2 py-1 border rounded"
            />
          </label>
          <label className="flex items-center gap-1">
            日
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={weights.day}
              onChange={(e) =>
                setWeights((w) => ({
                  ...w,
                  day: Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                }))
              }
              className="w-20 px-2 py-1 border rounded"
            />
          </label>
          <div className="text-gray-500">
            建议总和≤0.6，基础盘权重自动占余量
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => setWeights({ year: 0.3, month: 0.2, day: 0.1 })}
            >
              重置权重
            </button>
            <button
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                try {
                  if (
                    typeof window !== 'undefined' &&
                    (window as any).localStorage
                  ) {
                    (window as any).localStorage.setItem(
                      'fengshui_layer_weights',
                      JSON.stringify(weights)
                    );
                    alert('已保存权重偏好');
                  }
                } catch {}
              }}
            >
              保存偏好
            </button>
          </div>
        </div>
      </div>

      {/* 九宫飞星盘 */}
      <div className="flying-star-plate bg-white p-6 shadow-lg rounded-lg mb-4">
        <h4 className="text-lg font-semibold mb-4">九宫飞星盘</h4>
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {state.flyingStars.map((star) => (
            <div
              key={star.palaceIndex}
              onClick={() => handlePalaceClick(star.palaceIndex)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                state.selectedPalace === star.palaceIndex
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: star.color + '20' }}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{star.palaceIndex}</div>
                <div className="text-xs text-gray-600 mt-1">
                  山:{star.mountainStar} 向:{star.facingStar}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(star.score)}分
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 房间分析列表 */}
      <div className="room-analysis bg-white p-6 shadow-lg rounded-lg mb-4">
        <h4 className="text-lg font-semibold mb-4">房间分析</h4>
        <div className="space-y-3">
          {state.roomAnalyses.map((analysis) => (
            <div
              key={analysis.roomId}
              onClick={() => handleRoomClick(analysis.roomId)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                state.selectedRoom === analysis.roomId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: analysis.color }}
                  />
                  <div>
                    <div className="font-medium">
                      {rooms.find((r) => r.id === analysis.roomId)?.name ||
                        analysis.roomId}
                    </div>
                    <div className="text-sm text-gray-600">
                      第{analysis.palaceIndex}宫 · {Math.round(analysis.score)}
                      分
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {analysis.suggestions.length} 建议 ·{' '}
                    {analysis.warnings.length} 警告
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 详细信息面板 */}
      {(selectedPalaceData || selectedRoomData) && (
        <div className="detail-panel bg-white p-6 shadow-lg rounded-lg">
          <h4 className="text-lg font-semibold mb-4">详细信息</h4>

          {selectedPalaceData && (
            <div className="mb-6">
              <h5 className="font-medium mb-2">宫位信息</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">宫位:</span> 第
                  {selectedPalaceData.palaceIndex}宫
                </div>
                <div>
                  <span className="text-gray-600">得分:</span>{' '}
                  {Math.round(selectedPalaceData.score)}分
                </div>
                <div>
                  <span className="text-gray-600">山星:</span>{' '}
                  {selectedPalaceData.mountainStar}
                </div>
                <div>
                  <span className="text-gray-600">向星:</span>{' '}
                  {selectedPalaceData.facingStar}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">描述:</span>{' '}
                  {selectedPalaceData.description}
                </div>
                {(() => {
                  const p =
                    PALACE_PROFILES[
                      selectedPalaceData.palaceIndex as
                        | 1
                        | 2
                        | 3
                        | 4
                        | 5
                        | 6
                        | 7
                        | 8
                        | 9
                    ];
                  if (!p) return null;
                  return (
                    <>
                      <div className="col-span-2 mt-2">
                        <span className="text-gray-600">主事:</span> {p.governs}
                      </div>
                      <div className="col-span-2">
                        <span className="text-green-700 font-medium">
                          吉象:
                        </span>
                        <ul className="list-disc list-inside text-green-700 mt-1">
                          {p.auspicious.map((it, idx) => (
                            <li key={idx}>{it}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-span-2">
                        <span className="text-red-700 font-medium">凶象:</span>
                        <ul className="list-disc list-inside text-red-700 mt-1">
                          {p.inauspicious.map((it, idx) => (
                            <li key={idx}>{it}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-span-2">
                        <span className="text-orange-700 font-medium">
                          化解建议:
                        </span>
                        <ul className="list-disc list-inside text-orange-700 mt-1">
                          {p.mitigation.map((it, idx) => (
                            <li key={idx}>{it}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="col-span-2">
                        <span className="text-blue-700 font-medium">
                          催旺建议:
                        </span>
                        <ul className="list-disc list-inside text-blue-700 mt-1">
                          {p.enhancement.map((it, idx) => (
                            <li key={idx}>{it}</li>
                          ))}
                        </ul>
                      </div>
                      {bazi?.yongshen && (
                        <div className="col-span-2 mt-1">
                          <div className="text-xs text-gray-500">
                            分层来源：基础运盘结合年/月/日权重与个人喜忌（喜{' '}
                            {bazi.yongshen.favorable?.join('、') || '未知'} / 忌{' '}
                            {bazi.yongshen.unfavorable?.join('、') || '未知'}）动态加权。
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {selectedRoomData && (
            <div>
              <h5 className="font-medium mb-2">房间分析</h5>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">房间:</span>{' '}
                    {rooms.find((r) => r.id === selectedRoomData.roomId)?.name}
                  </div>
                  <div>
                    <span className="text-gray-600">宫位:</span> 第
                    {selectedRoomData.palaceIndex}宫
                  </div>
                  <div>
                    <span className="text-gray-600">得分:</span>{' '}
                    {Math.round(selectedRoomData.score)}分
                  </div>
                  <div>
                    <span className="text-gray-600">类型:</span>{' '}
                    {rooms.find((r) => r.id === selectedRoomData.roomId)?.type}
                  </div>
                </div>

                {selectedRoomData.suggestions.length > 0 && (
                  <div>
                    <h6 className="font-medium text-green-700 mb-2">建议</h6>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-600">
                      {selectedRoomData.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRoomData.warnings.length > 0 && (
                  <div>
                    <h6 className="font-medium text-red-700 mb-2">警告</h6>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                      {selectedRoomData.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-medium text-blue-700 mb-2">有利元素</h6>
                    <div className="flex flex-wrap gap-1">
                      {selectedRoomData.favorableElements.map(
                        (element, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {element}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h6 className="font-medium text-orange-700 mb-2">
                      不利元素
                    </h6>
                    <div className="flex flex-wrap gap-1">
                      {selectedRoomData.unfavorableElements.map(
                        (element, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                          >
                            {element}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FengshuiDisplay;
