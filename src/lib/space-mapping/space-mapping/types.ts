/**
 * Smart space mapping algorithm type definitions
 */

import type { Point } from '../image-processing/types';

export interface SpaceMappingConfig {
  enableAutoRotation: boolean;
  enablePreciseAlignment: boolean;
  toleranceAngle: number; // Angle tolerance (degrees)
  toleranceDistance: number; // Distance tolerance (pixels)
  enableGridSnapping: boolean;
  gridSize: number;
  enableRoomMerging: boolean;
  minRoomArea: number; // Minimum room area
}

export interface AlignmentResult {
  rotationAngle: number;
  translation: Point;
  confidence: number;
  method: 'wall_alignment' | 'room_alignment' | 'manual';
  processingTime: number;
}

export interface RoomMappingResult {
  roomId: string;
  palaceIndex: number;
  coordinates: Point[];
  center: Point;
  area: number;
  confidence: number;
  alignmentScore: number;
}

export interface SpaceMappingResult {
  alignment: AlignmentResult;
  roomMappings: RoomMappingResult[];
  overallConfidence: number;
  processingTime: number;
  success: boolean;
  error?: string;
}

export interface GridMapping {
  gridSize: number;
  gridOffset: Point;
  roomGridPositions: Map<string, { row: number; col: number }>;
}

export interface RotationAnalysis {
  angle: number;
  confidence: number;
  method: 'wall_direction' | 'room_orientation' | 'manual';
  referencePoints: Point[];
}

export interface CoordinateTransform {
  scale: number;
  rotation: number;
  translation: Point;
  matrix: number[][];
}

export interface MappingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PalaceMapping {
  palaceIndex: number;
  center: Point;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  rooms: string[];
}

export interface SpaceMappingState {
  config: SpaceMappingConfig;
  currentAlignment: AlignmentResult | null;
  roomMappings: Map<string, RoomMappingResult>;
  palaceMappings: Map<number, PalaceMapping>;
  gridMapping: GridMapping | null;
  validation: MappingValidation | null;
}
