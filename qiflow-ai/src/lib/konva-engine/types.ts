/**
 * Konva.js 2D图形处理引擎类型定义
 */

import Konva from 'konva';
import { Room, Wall, Door, Window, Point } from '../image-processing/types';

export interface KonvaStageConfig {
  width: number;
  height: number;
  container: string | HTMLDivElement;
  draggable?: boolean;
  zoomable?: boolean;
  rotatable?: boolean;
}

export interface FlyingStarPlate {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  stars: FlyingStarData[];
  palaceIndex: number;
  color: string;
  opacity: number;
}

export interface FlyingStarData {
  id: string;
  number: number;
  position: { x: number; y: number };
  type: 'mountain' | 'facing' | 'period';
  color: string;
  size: number;
}

export interface RoomOverlay {
  id: string;
  room: Room;
  konvaShape: Konva.Rect;
  flyingStarPlate?: FlyingStarPlate;
  isSelected: boolean;
  isHovered: boolean;
}

export interface LayerConfig {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
}

export interface InteractionState {
  selectedRoom: string | null;
  hoveredRoom: string | null;
  isDragging: boolean;
  isZooming: boolean;
  isRotating: boolean;
  lastMousePosition: Point | null;
}

export interface KonvaEngineConfig {
  enableDrag: boolean;
  enableZoom: boolean;
  enableRotation: boolean;
  enableSelection: boolean;
  enableHover: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  backgroundColor: string;
  roomColors: {
    living_room: string;
    bedroom: string;
    kitchen: string;
    bathroom: string;
    dining_room: string;
    study: string;
    storage: string;
    balcony: string;
    corridor: string;
    unknown: string;
  };
  flyingStarColors: {
    favorable: string;
    unfavorable: string;
    neutral: string;
  };
}

export interface TransformState {
  scale: number;
  rotation: number;
  x: number;
  y: number;
}

export interface EventHandlers {
  onRoomSelect?: (roomId: string | null) => void;
  onRoomHover?: (roomId: string | null) => void;
  onTransform?: (transform: TransformState) => void;
  onZoom?: (scale: number) => void;
  onDrag?: (position: Point) => void;
  onRotate?: (rotation: number) => void;
}

export interface KonvaEngineState {
  stage: Konva.Stage | null;
  layers: Map<string, Konva.Layer>;
  roomOverlays: Map<string, RoomOverlay>;
  flyingStarPlates: Map<string, FlyingStarPlate>;
  interactionState: InteractionState;
  transformState: TransformState;
  config: KonvaEngineConfig;
  eventHandlers: EventHandlers;
}

