/**
 * 交互式叠加界面组件
 *
 * 整合户型图、飞星盘、房间叠加等功能
 * 提供完整的交互式风水分析界面
 */

'use client';

import { ImageAnalysisResult, ImageProcessor } from '@/lib/image-processing';
import { KonvaEngine } from '@/lib/konva-engine';
import { SpaceMapper, SpaceMappingResult } from '@/lib/space-mapping';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface OverlayInterfaceProps {
  imageFile?: File;
  onAnalysisComplete?: (result: ImageAnalysisResult) => void;
  onRoomSelect?: (roomId: string | null) => void;
  onFlyingStarUpdate?: (palaceIndex: number, stars: any[]) => void;
  className?: string;
}

interface OverlayState {
  imageUrl: string | null;
  imageAnalysis: ImageAnalysisResult | null;
  spaceMapping: SpaceMappingResult | null;
  selectedRoom: string | null;
  flyingStarOpacity: number;
  showFlyingStars: boolean;
  showRoomLabels: boolean;
  showGrid: boolean;
  isProcessing: boolean;
  processingProgress: number;
  processingMessage: string;
}

export const OverlayInterface: React.FC<OverlayInterfaceProps> = ({
  imageFile,
  onAnalysisComplete,
  onRoomSelect,
  // onFlyingStarUpdate,
  className = '',
}) => {
  // 状态管理
  const [state, setState] = useState<OverlayState>({
    imageUrl: null,
    imageAnalysis: null,
    spaceMapping: null,
    selectedRoom: null,
    flyingStarOpacity: 0.8,
    showFlyingStars: true,
    showRoomLabels: true,
    showGrid: true,
    isProcessing: false,
    processingProgress: 0,
    processingMessage: '',
  });

  // 引用
  // const stageRef = useRef<any>(null);
  const imageProcessorRef = useRef<ImageProcessor | null>(null);
  const konvaEngineRef = useRef<KonvaEngine | null>(null);
  const spaceMapperRef = useRef<SpaceMapper | null>(null);

  // 初始化处理器
  useEffect(() => {
    const initializeProcessors = async () => {
      try {
        // 初始化图像处理器
        imageProcessorRef.current = new ImageProcessor({
          enableOCR: true,
          enableRoomDetection: true,
          enableWallDetection: true,
          confidenceThreshold: 0.5,
          maxProcessingTime: 30000,
        });

        // 初始化Konva引擎
        konvaEngineRef.current = new KonvaEngine({
          enableDrag: true,
          enableZoom: true,
          enableRotation: true,
          enableSelection: true,
          enableHover: true,
          showGrid: state.showGrid,
        });

        // 初始化空间映射器
        spaceMapperRef.current = new SpaceMapper({
          enableAutoRotation: true,
          enablePreciseAlignment: true,
          toleranceAngle: 1,
          toleranceDistance: 5,
          enableGridSnapping: true,
        });

        console.log('处理器初始化完成');
      } catch (error) {
        console.error('处理器初始化失败:', error);
      }
    };

    initializeProcessors();
  }, []);

  // 处理图像文件
  useEffect(() => {
    if (imageFile) {
      processImage(imageFile);
    }
  }, [imageFile]);

  // 处理图像
  const processImage = async (file: File) => {
    if (!imageProcessorRef.current) return;

    setState(prev => ({
      ...prev,
      isProcessing: true,
      processingProgress: 0,
      processingMessage: '正在处理图像...',
    }));

    try {
      // 设置进度回调
      imageProcessorRef.current.setProgressCallback(progress => {
        setState(prev => ({
          ...prev,
          processingProgress: progress.progress,
          processingMessage: progress.message,
        }));
      });

      // 处理图像
      const analysis = await imageProcessorRef.current.processImage(file);

      setState(prev => ({
        ...prev,
        imageAnalysis: analysis,
        imageUrl: analysis.imageData.url,
      }));

      // 执行空间映射
      if (analysis.roomDetection && analysis.roomDetection.rooms.length > 0) {
        await performSpaceMapping(analysis);
      }

      // 通知父组件
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }
    } catch (error) {
      console.error('图像处理失败:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingMessage: '图像处理失败',
      }));
    }
  };

  // 执行空间映射
  const performSpaceMapping = async (analysis: ImageAnalysisResult) => {
    if (!spaceMapperRef.current || !analysis.roomDetection) return;

    try {
      setState(prev => ({
        ...prev,
        processingMessage: '正在执行空间映射...',
      }));

      const mapping = await spaceMapperRef.current.mapSpace(
        analysis.roomDetection.rooms,
        analysis.roomDetection.walls,
        {
          width: analysis.imageData.width,
          height: analysis.imageData.height,
        }
      );

      setState(prev => ({
        ...prev,
        spaceMapping: mapping,
      }));

      // 渲染到Konva
      await renderToKonva(analysis, mapping);
    } catch (error) {
      console.error('空间映射失败:', error);
    }
  };

  // 渲染到Konva
  const renderToKonva = async (
    analysis: ImageAnalysisResult,
    mapping: SpaceMappingResult
  ) => {
    if (!konvaEngineRef.current || !state.imageUrl) return;

    try {
      // 初始化Konva舞台
      const container = document.getElementById('konva-container');
      if (!container) return;

      konvaEngineRef.current.initialize({
        container: container as HTMLDivElement,
        width: container.clientWidth,
        height: container.clientHeight,
        draggable: true,
        zoomable: true,
        rotatable: true,
      });

      // 设置事件处理器
      konvaEngineRef.current.setEventHandlers({
        onRoomSelect: roomId => {
          setState(prev => ({ ...prev, selectedRoom: roomId }));
          if (onRoomSelect) {
            onRoomSelect(roomId);
          }
        },
        onRoomHover: roomId => {
          // 处理房间悬停
        },
        onTransform: transform => {
          // 处理变换
        },
        onZoom: scale => {
          // 处理缩放
        },
      });

      // 渲染房间叠加层
      if (analysis.roomDetection) {
        konvaEngineRef.current.renderRoomOverlays(analysis.roomDetection.rooms);
      }

      // 渲染飞星盘
      konvaEngineRef.current.renderFlyingStars();

      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingMessage: '渲染完成',
      }));
    } catch (error) {
      console.error('Konva渲染失败:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        processingMessage: '渲染失败',
      }));
    }
  };

  // 处理透明度变化
  const handleOpacityChange = useCallback((opacity: number) => {
    setState(prev => ({ ...prev, flyingStarOpacity: opacity }));
    if (konvaEngineRef.current) {
      konvaEngineRef.current.setFlyingStarOpacity(opacity);
    }
  }, []);

  // 处理显示切换
  const handleToggleFlyingStars = useCallback(() => {
    setState(prev => ({ ...prev, showFlyingStars: !prev.showFlyingStars }));
  }, []);

  const handleToggleRoomLabels = useCallback(() => {
    setState(prev => ({ ...prev, showRoomLabels: !prev.showRoomLabels }));
  }, []);

  const handleToggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  // 处理房间点击
  const handleRoomClick = useCallback(
    (roomId: string) => {
      setState(prev => ({ ...prev, selectedRoom: roomId }));
      if (onRoomSelect) {
        onRoomSelect(roomId);
      }
    },
    [onRoomSelect]
  );

  return (
    <div className={`overlay-interface ${className}`}>
      {/* 控制面板 */}
      <div className='control-panel bg-white p-4 shadow-lg rounded-lg mb-4'>
        <div className='flex flex-wrap gap-4 items-center'>
          {/* 透明度控制 */}
          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>飞星透明度:</label>
            <input
              type='range'
              min='0'
              max='1'
              step='0.1'
              value={state.flyingStarOpacity}
              onChange={e => handleOpacityChange(parseFloat(e.target.value))}
              className='w-20'
            />
            <span className='text-xs text-gray-500'>
              {Math.round(state.flyingStarOpacity * 100)}%
            </span>
          </div>

          {/* 显示控制 */}
          <div className='flex gap-2'>
            <button
              onClick={handleToggleFlyingStars}
              className={`px-3 py-1 text-xs rounded ${
                state.showFlyingStars
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              飞星盘
            </button>
            <button
              onClick={handleToggleRoomLabels}
              className={`px-3 py-1 text-xs rounded ${
                state.showRoomLabels
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              房间标签
            </button>
            <button
              onClick={handleToggleGrid}
              className={`px-3 py-1 text-xs rounded ${
                state.showGrid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              网格
            </button>
          </div>

          {/* 处理状态 */}
          {state.isProcessing && (
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              <span className='text-sm text-gray-600'>
                {state.processingMessage} (
                {Math.round(state.processingProgress)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 主显示区域 */}
      <div className='main-display-area relative'>
        {/* 背景图像 */}
        {state.imageUrl && (
          <div className='absolute inset-0 z-0'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.imageUrl}
              alt='户型图'
              className='w-full h-full object-contain'
            />
          </div>
        )}

        {/* Konva画布容器 */}
        <div
          id='konva-container'
          className='relative z-10 w-full h-96 border border-gray-300 rounded-lg'
          style={{ minHeight: '400px' }}
        />

        {/* 房间信息面板 */}
        {state.selectedRoom && state.spaceMapping && (
          <RoomInfoPanel
            roomId={state.selectedRoom}
            spaceMapping={state.spaceMapping}
            onClose={() => setState(prev => ({ ...prev, selectedRoom: null }))}
          />
        )}
      </div>
    </div>
  );
};

// 房间信息面板组件
interface RoomInfoPanelProps {
  roomId: string;
  spaceMapping: SpaceMappingResult;
  onClose: () => void;
}

const RoomInfoPanel: React.FC<RoomInfoPanelProps> = ({
  roomId,
  spaceMapping,
  onClose,
}) => {
  const roomMapping = spaceMapping.roomMappings.find(m => m.roomId === roomId);

  if (!roomMapping) return null;

  return (
    <div className='absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-20 max-w-sm'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='font-semibold text-lg'>房间信息</h3>
        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
          ×
        </button>
      </div>

      <div className='space-y-2 text-sm'>
        <div>
          <span className='font-medium'>房间ID:</span> {roomMapping.roomId}
        </div>
        <div>
          <span className='font-medium'>宫位:</span> 第{roomMapping.palaceIndex}
          宫
        </div>
        <div>
          <span className='font-medium'>面积:</span>{' '}
          {Math.round(roomMapping.area / 1000)}m²
        </div>
        <div>
          <span className='font-medium'>置信度:</span>{' '}
          {Math.round(roomMapping.confidence * 100)}%
        </div>
        <div>
          <span className='font-medium'>对齐得分:</span>{' '}
          {Math.round(roomMapping.alignmentScore * 100)}%
        </div>
      </div>
    </div>
  );
};

export default OverlayInterface;

