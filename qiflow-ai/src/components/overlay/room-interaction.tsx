/**
 * 房间交互组件
 *
 * 提供房间选择、悬停、拖拽等交互功能
 * 支持房间信息显示和编辑
 */

'use client';

import { Point, Room } from '@/lib/image-processing/types';
import { RoomMappingResult } from '@/lib/space-mapping/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface RoomInteractionProps {
  rooms: Room[];
  roomMappings: RoomMappingResult[];
  selectedRoom: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onRoomHover: (roomId: string | null) => void;
  onRoomEdit?: (roomId: string, updates: Partial<Room>) => void;
  onRoomDelete?: (roomId: string) => void;
  className?: string;
}

interface RoomInteractionState {
  hoveredRoom: string | null;
  isDragging: boolean;
  dragStart: Point | null;
  dragOffset: Point | null;
  editMode: boolean;
  editingRoom: string | null;
}

export const RoomInteraction: React.FC<RoomInteractionProps> = ({
  rooms,
  roomMappings,
  selectedRoom,
  onRoomSelect,
  onRoomHover,
  // onRoomEdit,
  onRoomDelete,
  className = '',
}) => {
  const [state, setState] = useState<RoomInteractionState>({
    hoveredRoom: null,
    isDragging: false,
    dragStart: null,
    dragOffset: null,
    editMode: false,
    editingRoom: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // 处理房间点击
  const handleRoomClick = useCallback(
    (roomId: string, event: React.MouseEvent) => {
      event.stopPropagation();

      if (state.editMode && state.editingRoom === roomId) {
        // 退出编辑模式
        setState(prev => ({
          ...prev,
          editMode: false,
          editingRoom: null,
        }));
      } else {
        // 选择房间
        onRoomSelect(roomId);
      }
    },
    [state.editMode, state.editingRoom, onRoomSelect]
  );

  // 处理房间悬停
  const handleRoomMouseEnter = useCallback(
    (roomId: string) => {
      setState(prev => ({ ...prev, hoveredRoom: roomId }));
      onRoomHover(roomId);
    },
    [onRoomHover]
  );

  const handleRoomMouseLeave = useCallback(() => {
    setState(prev => ({ ...prev, hoveredRoom: null }));
    onRoomHover(null);
  }, [onRoomHover]);

  // 处理拖拽开始
  const handleDragStart = useCallback(
    (roomId: string, event: React.MouseEvent) => {
      if (state.editMode) return;

      event.preventDefault();
      setState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: { x: event.clientX, y: event.clientY },
        dragOffset: { x: 0, y: 0 },
      }));
    },
    [state.editMode]
  );

  // 处理拖拽移动
  const handleDragMove = useCallback(
    (event: MouseEvent) => {
      if (!state.isDragging || !state.dragStart) return;

      const offset = {
        x: event.clientX - state.dragStart.x,
        y: event.clientY - state.dragStart.y,
      };

      setState(prev => ({ ...prev, dragOffset: offset }));
    },
    [state.isDragging, state.dragStart]
  );

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    if (!state.isDragging) return;

    setState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null,
      dragOffset: null,
    }));
  }, [state.isDragging]);

  // 处理编辑模式切换
  const handleEditModeToggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      editMode: !prev.editMode,
      editingRoom: null,
    }));
  }, []);

  // 处理房间编辑
  const handleRoomEdit = useCallback((roomId: string) => {
    setState(prev => ({
      ...prev,
      editingRoom: roomId,
      editMode: true,
    }));
  }, []);

  // 处理房间删除
  const handleRoomDelete = useCallback(
    (roomId: string) => {
      if (onRoomDelete) {
        onRoomDelete(roomId);
      }
    },
    [onRoomDelete]
  );

  // 处理容器点击
  const handleContainerClick = useCallback(() => {
    if (!state.editMode) {
      onRoomSelect(null);
    }
  }, [state.editMode, onRoomSelect]);

  // 注册全局事件监听器
  useEffect(() => {
    if (state.isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);

      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
    return undefined;
  }, [state.isDragging, handleDragMove, handleDragEnd]);

  // 获取房间映射信息
  const getRoomMapping = useCallback(
    (roomId: string) => {
      return roomMappings.find(mapping => mapping.roomId === roomId);
    },
    [roomMappings]
  );

  // 计算房间样式
  const getRoomStyle = useCallback(
    (room: Room, roomId: string) => {
      const isSelected = selectedRoom === roomId;
      const isHovered = state.hoveredRoom === roomId;
      const isEditing = state.editingRoom === roomId;
      const mapping = getRoomMapping(roomId);

      const baseStyle = {
        position: 'absolute' as const,
        left: room.center.x - 50,
        top: room.center.y - 30,
        width: 100,
        height: 60,
        border: '2px solid',
        borderRadius: '8px',
        cursor: state.isDragging ? 'grabbing' : 'grab',
        transition: 'all 0.2s ease',
        zIndex: isSelected ? 20 : 10,
        transform: state.dragOffset
          ? `translate(${state.dragOffset.x}px, ${state.dragOffset.y}px)`
          : 'none',
      };

      // 根据状态设置颜色
      let borderColor = '#333333';
      let backgroundColor = '#f0f0f0';

      if (isSelected) {
        borderColor = '#FF5722';
        backgroundColor = '#FFE5E5';
      } else if (isHovered) {
        borderColor = '#2196F3';
        backgroundColor = '#E3F2FD';
      } else if (isEditing) {
        borderColor = '#4CAF50';
        backgroundColor = '#E8F5E8';
      }

      // 根据房间类型设置颜色
      const roomTypeColors: Record<string, string> = {
        living_room: '#FFE5E5',
        bedroom: '#E5F3FF',
        kitchen: '#E5FFE5',
        bathroom: '#FFF5E5',
        dining_room: '#F0E5FF',
        study: '#E5FFFF',
        storage: '#FFE5F0',
        balcony: '#F5F5E5',
        corridor: '#E5E5E5',
        unknown: '#F0F0F0',
      };

      return {
        ...baseStyle,
        borderColor,
        backgroundColor: roomTypeColors[room.type] || '#F0F0F0',
        boxShadow: isSelected
          ? '0 4px 12px rgba(0,0,0,0.3)'
          : isHovered
            ? '0 2px 8px rgba(0,0,0,0.2)'
            : 'none',
      };
    },
    [
      selectedRoom,
      state.hoveredRoom,
      state.editingRoom,
      state.isDragging,
      state.dragOffset,
      getRoomMapping,
    ]
  );

  return (
    <div className={`room-interaction ${className}`}>
      {/* 控制面板 */}
      <div className='control-panel bg-white p-4 shadow-lg rounded-lg mb-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>房间交互</h3>
          <div className='flex gap-2'>
            <button
              onClick={handleEditModeToggle}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                state.editMode
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {state.editMode ? '退出编辑' : '编辑模式'}
            </button>
          </div>
        </div>

        {state.editMode && (
          <div className='mt-2 text-sm text-gray-600'>
            编辑模式已启用，点击房间进行编辑
          </div>
        )}
      </div>

      {/* 房间容器 */}
      <div
        ref={containerRef}
        className='relative w-full h-96 border border-gray-300 rounded-lg overflow-hidden'
        onClick={handleContainerClick}
      >
        {/* 渲染房间 */}
        {rooms.map(room => {
          const roomId = room.id;
          const mapping = getRoomMapping(roomId);

          return (
            <div
              key={roomId}
              ref={roomId === selectedRoom ? dragRef : null}
              className='room-item'
              style={getRoomStyle(room, roomId)}
              onClick={e => handleRoomClick(roomId, e)}
              onMouseEnter={() => handleRoomMouseEnter(roomId)}
              onMouseLeave={handleRoomMouseLeave}
              onMouseDown={e => handleDragStart(roomId, e)}
            >
              {/* 房间内容 */}
              <div className='p-2 h-full flex flex-col justify-center items-center text-center'>
                <div className='font-medium text-sm truncate w-full'>
                  {room.name}
                </div>
                <div className='text-xs text-gray-600'>
                  {mapping ? `第${mapping.palaceIndex}宫` : '未映射'}
                </div>
                <div className='text-xs text-gray-500'>
                  {Math.round(room.area / 1000)}m²
                </div>
              </div>

              {/* 置信度指示器 */}
              <div
                className='absolute top-1 right-1 w-3 h-3 rounded-full'
                style={{
                  backgroundColor:
                    room.confidence >= 0.8
                      ? '#4CAF50'
                      : room.confidence >= 0.6
                        ? '#FF9800'
                        : '#F44336',
                }}
                title={`置信度: ${Math.round(room.confidence * 100)}%`}
              />

              {/* 编辑模式操作按钮 */}
              {state.editMode && (
                <div className='absolute top-1 left-1 flex gap-1'>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleRoomEdit(roomId);
                    }}
                    className='w-5 h-5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600'
                    title='编辑房间'
                  >
                    ✏️
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleRoomDelete(roomId);
                    }}
                    className='w-5 h-5 bg-red-500 text-white text-xs rounded hover:bg-red-600'
                    title='删除房间'
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* 空状态提示 */}
        {rooms.length === 0 && (
          <div className='absolute inset-0 flex items-center justify-center text-gray-500'>
            暂无房间数据
          </div>
        )}
      </div>

      {/* 房间详情面板 */}
      {selectedRoom && (
        <RoomDetailPanel
          room={rooms.find(r => r.id === selectedRoom)!}
          mapping={getRoomMapping(selectedRoom)}
          onClose={() => onRoomSelect(null)}
          onEdit={() => handleRoomEdit(selectedRoom)}
          onDelete={() => handleRoomDelete(selectedRoom)}
        />
      )}
    </div>
  );
};

// 房间详情面板组件
interface RoomDetailPanelProps {
  room: Room;
  mapping?: RoomMappingResult;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({
  room,
  mapping,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div className='mt-4 bg-white p-4 rounded-lg shadow-lg'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold'>房间详情</h3>
        <div className='flex gap-2'>
          <button
            onClick={onEdit}
            className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            编辑
          </button>
          <button
            onClick={onDelete}
            className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600'
          >
            删除
          </button>
          <button
            onClick={onClose}
            className='px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
          >
            关闭
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div>
          <span className='font-medium'>房间ID:</span> {room.id}
        </div>
        <div>
          <span className='font-medium'>房间名称:</span> {room.name}
        </div>
        <div>
          <span className='font-medium'>房间类型:</span> {room.type}
        </div>
        <div>
          <span className='font-medium'>面积:</span>{' '}
          {Math.round(room.area / 1000)}m²
        </div>
        <div>
          <span className='font-medium'>置信度:</span>{' '}
          {Math.round(room.confidence * 100)}%
        </div>
        {mapping && (
          <>
            <div>
              <span className='font-medium'>宫位:</span> 第{mapping.palaceIndex}
              宫
            </div>
            <div>
              <span className='font-medium'>映射置信度:</span>{' '}
              {Math.round(mapping.confidence * 100)}%
            </div>
            <div>
              <span className='font-medium'>对齐得分:</span>{' '}
              {Math.round(mapping.alignmentScore * 100)}%
            </div>
          </>
        )}
      </div>

      {/* 坐标信息 */}
      <div className='mt-4'>
        <span className='font-medium'>坐标信息:</span>
        <div className='mt-2 text-xs text-gray-600'>
          <div>
            中心点: ({Math.round(room.center.x)}, {Math.round(room.center.y)})
          </div>
          <div>边界点: {room.coordinates.length}个</div>
        </div>
      </div>
    </div>
  );
};

export default RoomInteraction;

