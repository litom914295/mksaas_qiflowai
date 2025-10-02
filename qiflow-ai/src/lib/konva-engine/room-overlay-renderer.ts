/**
 * 房间叠加渲染器
 * 
 * 负责在Konva画布上渲染房间叠加层
 * 包括房间形状、标注、交互效果等
 */

import Konva from 'konva';
import { Room, RoomType } from '../image-processing/types';
import { RoomOverlay, KonvaEngineConfig, InteractionState } from './types';

export class RoomOverlayRenderer {
  private config: KonvaEngineConfig;
  private overlays: Map<string, RoomOverlay> = new Map();

  constructor(config: KonvaEngineConfig) {
    this.config = config;
  }

  /**
   * 创建房间叠加层
   */
  createRoomOverlays(rooms: Room[]): Map<string, RoomOverlay> {
    this.overlays.clear();

    for (const room of rooms) {
      const overlay = this.createRoomOverlay(room);
      this.overlays.set(room.id, overlay);
    }

    return this.overlays;
  }

  /**
   * 创建单个房间叠加层
   */
  private createRoomOverlay(room: Room): RoomOverlay {
    // 计算房间边界框
    const bounds = this.calculateRoomBounds(room);
    
    // 创建Konva矩形
    const konvaShape = new Konva.Rect({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      fill: this.getRoomColor(room.type),
      stroke: '#333333',
      strokeWidth: 2,
      opacity: 0.7,
      cornerRadius: 4,
      draggable: true
    });

    // 添加房间名称标签
    const nameText = new Konva.Text({
      x: bounds.x + bounds.width / 2 - 30,
      y: bounds.y + bounds.height / 2 - 10,
      text: room.name,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#333333',
      align: 'center',
      verticalAlign: 'middle'
    });

    // 添加房间类型标签
    const typeText = new Konva.Text({
      x: bounds.x + bounds.width / 2 - 30,
      y: bounds.y + bounds.height / 2 + 10,
      text: this.getRoomTypeLabel(room.type),
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#666666',
      align: 'center'
    });

    // 添加面积标签
    const areaText = new Konva.Text({
      x: bounds.x + 5,
      y: bounds.y + 5,
      text: `${Math.round(room.area / 1000)}m²`,
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#666666',
      align: 'left'
    });

    // 添加置信度指示器
    const confidenceIndicator = new Konva.Circle({
      x: bounds.x + bounds.width - 15,
      y: bounds.y + 15,
      radius: 6,
      fill: this.getConfidenceColor(room.confidence),
      stroke: '#333333',
      strokeWidth: 1
    });

    return {
      id: room.id,
      room,
      konvaShape,
      isSelected: false,
      isHovered: false
    };
  }

  /**
   * 计算房间边界框
   */
  private calculateRoomBounds(room: Room): { x: number; y: number; width: number; height: number } {
    if (room.coordinates.length === 0) {
      return { x: 0, y: 0, width: 100, height: 100 };
    }

    const xs = room.coordinates.map(p => p.x);
    const ys = room.coordinates.map(p => p.y);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 获取房间颜色
   */
  private getRoomColor(roomType: RoomType): string {
    return this.config.roomColors[roomType] || this.config.roomColors.unknown;
  }

  /**
   * 获取房间类型标签
   */
  private getRoomTypeLabel(roomType: RoomType): string {
    const labels: Record<RoomType, string> = {
      living_room: '客厅',
      bedroom: '卧室',
      kitchen: '厨房',
      bathroom: '卫生间',
      dining_room: '餐厅',
      study: '书房',
      storage: '储藏室',
      balcony: '阳台',
      corridor: '走廊',
      unknown: '未知'
    };
    
    return labels[roomType] || '未知';
  }

  /**
   * 获取置信度颜色
   */
  private getConfidenceColor(confidence: number): string {
    if (confidence >= 0.8) return '#4CAF50'; // 绿色 - 高置信度
    if (confidence >= 0.6) return '#FF9800'; // 橙色 - 中等置信度
    return '#F44336'; // 红色 - 低置信度
  }

  /**
   * 渲染房间叠加层到Konva层
   */
  renderToLayer(layer: Konva.Layer): void {
    // 清除现有内容
    layer.destroyChildren();

    for (const overlay of this.overlays.values()) {
      this.renderOverlay(layer, overlay);
    }

    layer.batchDraw();
  }

  /**
   * 渲染单个房间叠加层
   */
  private renderOverlay(layer: Konva.Layer, overlay: RoomOverlay): void {
    const bounds = this.calculateRoomBounds(overlay.room);
    
    // 创建房间背景
    const background = new Konva.Rect({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      fill: this.getRoomColor(overlay.room.type),
      stroke: overlay.isSelected ? '#FF5722' : '#333333',
      strokeWidth: overlay.isSelected ? 3 : 2,
      opacity: overlay.isHovered ? 0.9 : 0.7,
      cornerRadius: 4,
      draggable: true
    });

    // 添加房间名称
    const nameText = new Konva.Text({
      x: bounds.x + bounds.width / 2 - 30,
      y: bounds.y + bounds.height / 2 - 10,
      text: overlay.room.name,
      fontSize: 14,
      fontFamily: 'Arial',
      fill: '#333333',
      align: 'center',
      verticalAlign: 'middle'
    });

    // 添加房间类型
    const typeText = new Konva.Text({
      x: bounds.x + bounds.width / 2 - 30,
      y: bounds.y + bounds.height / 2 + 10,
      text: this.getRoomTypeLabel(overlay.room.type),
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#666666',
      align: 'center'
    });

    // 添加面积
    const areaText = new Konva.Text({
      x: bounds.x + 5,
      y: bounds.y + 5,
      text: `${Math.round(overlay.room.area / 1000)}m²`,
      fontSize: 10,
      fontFamily: 'Arial',
      fill: '#666666',
      align: 'left'
    });

    // 添加置信度指示器
    const confidenceIndicator = new Konva.Circle({
      x: bounds.x + bounds.width - 15,
      y: bounds.y + 15,
      radius: 6,
      fill: this.getConfidenceColor(overlay.room.confidence),
      stroke: '#333333',
      strokeWidth: 1
    });

    // 添加选择框（如果被选中）
    let selectionBox: Konva.Rect | null = null;
    if (overlay.isSelected) {
      selectionBox = new Konva.Rect({
        x: bounds.x - 5,
        y: bounds.y - 5,
        width: bounds.width + 10,
        height: bounds.height + 10,
        fill: 'transparent',
        stroke: '#FF5722',
        strokeWidth: 2,
        dash: [5, 5]
      });
    }

    // 添加到层
    layer.add(background);
    layer.add(nameText);
    layer.add(typeText);
    layer.add(areaText);
    layer.add(confidenceIndicator);
    
    if (selectionBox) {
      layer.add(selectionBox);
    }

    // 更新Konva形状引用
    overlay.konvaShape = background;
  }

  /**
   * 设置房间选中状态
   */
  setRoomSelected(roomId: string, selected: boolean): void {
    const overlay = this.overlays.get(roomId);
    if (overlay) {
      overlay.isSelected = selected;
    }
  }

  /**
   * 设置房间悬停状态
   */
  setRoomHovered(roomId: string, hovered: boolean): void {
    const overlay = this.overlays.get(roomId);
    if (overlay) {
      overlay.isHovered = hovered;
    }
  }

  /**
   * 获取房间叠加层
   */
  getOverlay(roomId: string): RoomOverlay | undefined {
    return this.overlays.get(roomId);
  }

  /**
   * 获取所有房间叠加层
   */
  getOverlays(): Map<string, RoomOverlay> {
    return this.overlays;
  }

  /**
   * 更新房间数据
   */
  updateRoom(roomId: string, updatedRoom: Room): void {
    const overlay = this.overlays.get(roomId);
    if (overlay) {
      overlay.room = updatedRoom;
    }
  }

  /**
   * 清除所有房间叠加层
   */
  clear(): void {
    this.overlays.clear();
  }
}

