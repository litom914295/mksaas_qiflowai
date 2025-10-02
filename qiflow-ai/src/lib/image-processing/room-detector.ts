/**
 * 房间识别和布局分析引擎
 *
 * 基于图像处理技术自动识别户型图中的房间布局
 * 包括房间类型、尺寸、门窗位置等关键信息
 */

import {
    Door,
    Point,
    Room,
    RoomDetectionResult,
    RoomType,
    Wall,
    Window,
} from './types';

export class RoomDetector {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  /**
   * 检测房间布局
   */
  async detectRooms(imageData: ImageData): Promise<RoomDetectionResult> {
    const startTime = performance.now();

    try {
      // 验证输入数据
      if (!this.validateImageData(imageData)) {
        throw new Error('无效的图像数据：图像尺寸过小或数据格式不正确');
      }

      // 检查图像质量
      const quality = await this.assessImageQuality(imageData);
      if (quality < 0.3) {
        throw new Error(
          `图像质量过低 (${quality.toFixed(2)})，无法进行准确检测`
        );
      }

      if (quality < 0.7) {
        console.warn(`图像质量较低: ${quality.toFixed(2)}, 可能影响检测精度`);
      }

      // 初始化画布
      this.initializeCanvas(imageData.width, imageData.height);

      // 预处理图像
      const processedImage = await this.preprocessImage(imageData);

      // 检测墙壁
      const walls = await this.detectWalls(processedImage);
      if (walls.length === 0) {
        console.warn('未检测到墙壁，可能影响房间检测准确性');
      }

      // 检测房间
      const rooms = await this.detectRoomsFromWalls(walls, imageData);
      if (rooms.length === 0) {
        console.warn('未检测到房间，请检查图像质量');
      }

      // 检测门窗
      const doors = await this.detectDoors(processedImage, walls);
      const windows = await this.detectWindows(processedImage, walls);

      // 分类房间类型
      const classifiedRooms = await this.classifyRooms(rooms, doors, windows);

      // 后处理：验证和优化结果
      const optimizedRooms = await this.postProcessRooms(
        classifiedRooms,
        walls,
        doors,
        windows
      );

      const processingTime = performance.now() - startTime;

      return {
        rooms: optimizedRooms,
        walls,
        doors,
        windows,
        confidence: this.calculateOverallConfidence(
          optimizedRooms,
          walls,
          doors,
          windows
        ),
        processingTime,
        quality,
      };
    } catch (error) {
      console.error('房间检测失败:', error);
      throw new Error(
        `房间检测失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      this.cleanup();
    }
  }

  /**
   * 初始化画布
   */
  private initializeCanvas(width: number, height: number): void {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('无法创建画布上下文');
    }
  }

  /**
   * 预处理图像
   */
  private async preprocessImage(imageData: ImageData): Promise<ImageData> {
    if (!this.ctx || !this.canvas) {
      throw new Error('画布未初始化');
    }

    // 将图像数据绘制到画布
    this.ctx.putImageData(imageData, 0, 0);

    // 转换为灰度图
    const imageDataGray = this.convertToGrayscale(imageData);

    // 应用高斯模糊减少噪声
    const blurredImage = this.applyGaussianBlur(imageDataGray, 2);

    // 边缘检测
    const edgeImage = this.detectEdges(blurredImage);

    return edgeImage;
  }

  /**
   * 转换为灰度图
   */
  private convertToGrayscale(imageData: ImageData): ImageData {
    const data = new Uint8ClampedArray(imageData.data);

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        data[i] * 0.299 + // Red
          data[i + 1] * 0.587 + // Green
          data[i + 2] * 0.114 // Blue
      );

      data[i] = gray; // Red
      data[i + 1] = gray; // Green
      data[i + 2] = gray; // Blue
      // Alpha channel remains unchanged
    }

    return new ImageData(data, imageData.width, imageData.height);
  }

  /**
   * 应用高斯模糊
   */
  private applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    const result = new Uint8ClampedArray(data);

    const kernel = this.createGaussianKernel(radius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);

    for (let y = halfKernel; y < height - halfKernel; y++) {
      for (let x = halfKernel; x < width - halfKernel; x++) {
        let sum = 0;
        let weightSum = 0;

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const pixelX = x + kx - halfKernel;
            const pixelY = y + ky - halfKernel;
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const weight = kernel[ky][kx];

            sum += data[pixelIndex] * weight;
            weightSum += weight;
          }
        }

        const resultIndex = (y * width + x) * 4;
        result[resultIndex] = Math.round(sum / weightSum);
        result[resultIndex + 1] = result[resultIndex];
        result[resultIndex + 2] = result[resultIndex];
        result[resultIndex + 3] = data[resultIndex + 3];
      }
    }

    return new ImageData(result, width, height);
  }

  /**
   * 创建高斯核
   */
  private createGaussianKernel(radius: number): number[][] {
    const size = Math.ceil(radius * 2) * 2 + 1;
    const kernel: number[][] = [];
    const sigma = radius / 3;
    const twoSigmaSquare = 2 * sigma * sigma;
    const sqrtTwoPiSigma = Math.sqrt(Math.PI * twoSigmaSquare);

    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const dx = x - Math.floor(size / 2);
        const dy = y - Math.floor(size / 2);
        const distance = dx * dx + dy * dy;
        kernel[y][x] = Math.exp(-distance / twoSigmaSquare) / sqrtTwoPiSigma;
      }
    }

    return kernel;
  }

  /**
   * 边缘检测
   */
  private detectEdges(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const result = new Uint8ClampedArray(data.length);

    // Sobel算子
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0;

        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4;
            const pixelValue = data[pixelIndex];

            gx += pixelValue * sobelX[ky][kx];
            gy += pixelValue * sobelY[ky][kx];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const resultIndex = (y * width + x) * 4;

        result[resultIndex] = Math.min(255, magnitude);
        result[resultIndex + 1] = result[resultIndex];
        result[resultIndex + 2] = result[resultIndex];
        result[resultIndex + 3] = data[resultIndex + 3];
      }
    }

    return new ImageData(result, width, height);
  }

  /**
   * 检测墙壁
   */
  private async detectWalls(imageData: ImageData): Promise<Wall[]> {
    const walls: Wall[] = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // 使用霍夫变换检测直线
    const lines = this.houghTransform(imageData);

    // 将直线转换为墙壁
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const wall: Wall = {
        id: `wall_${i}`,
        start: { x: line.x1, y: line.y1 },
        end: { x: line.x2, y: line.y2 },
        thickness: this.calculateWallThickness(line, imageData),
        type: this.classifyWallType(line, imageData),
      };

      walls.push(wall);
    }

    return walls;
  }

  /**
   * 霍夫变换检测直线
   */
  private houghTransform(
    imageData: ImageData
  ): Array<{ x1: number; y1: number; x2: number; y2: number; votes: number }> {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // 简化的霍夫变换实现
    const lines: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      votes: number;
    }> = [];
    const threshold = 100; // 投票阈值

    // 检测水平线
    for (let y = 0; y < height; y++) {
      let lineLength = 0;
      let startX = 0;

      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const intensity = data[pixelIndex];

        if (intensity > threshold) {
          if (lineLength === 0) {
            startX = x;
          }
          lineLength++;
        } else {
          if (lineLength > 50) {
            // 最小线段长度
            lines.push({
              x1: startX,
              y1: y,
              x2: startX + lineLength,
              y2: y,
              votes: lineLength,
            });
          }
          lineLength = 0;
        }
      }
    }

    // 检测垂直线
    for (let x = 0; x < width; x++) {
      let lineLength = 0;
      let startY = 0;

      for (let y = 0; y < height; y++) {
        const pixelIndex = (y * width + x) * 4;
        const intensity = data[pixelIndex];

        if (intensity > threshold) {
          if (lineLength === 0) {
            startY = y;
          }
          lineLength++;
        } else {
          if (lineLength > 50) {
            // 最小线段长度
            lines.push({
              x1: x,
              y1: startY,
              x2: x,
              y2: startY + lineLength,
              votes: lineLength,
            });
          }
          lineLength = 0;
        }
      }
    }

    return lines;
  }

  /**
   * 计算墙壁厚度
   */
  private calculateWallThickness(line: any, imageData: ImageData): number {
    // 简化实现，返回固定厚度
    return 10;
  }

  /**
   * 分类墙壁类型
   */
  private classifyWallType(
    line: any,
    imageData: ImageData
  ): 'exterior' | 'interior' {
    // 简化实现，根据位置判断
    const isNearEdge =
      line.x1 < 50 ||
      line.x2 < 50 ||
      line.x1 > imageData.width - 50 ||
      line.x2 > imageData.width - 50 ||
      line.y1 < 50 ||
      line.y2 < 50 ||
      line.y1 > imageData.height - 50 ||
      line.y2 > imageData.height - 50;

    return isNearEdge ? 'exterior' : 'interior';
  }

  /**
   * 从墙壁检测房间
   */
  private async detectRoomsFromWalls(
    walls: Wall[],
    imageData: ImageData
  ): Promise<Room[]> {
    const rooms: Room[] = [];

    // 使用洪水填充算法检测封闭区域
    const visited = new Array(imageData.width * imageData.height).fill(false);

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const index = y * imageData.width + x;

        if (!visited[index] && this.isRoomPixel(x, y, imageData)) {
          const roomPixels = this.floodFill(x, y, imageData, visited);

          if (roomPixels.length > 1000) {
            // 最小房间面积
            const room = this.createRoomFromPixels(roomPixels, rooms.length);
            rooms.push(room);
          }
        }
      }
    }

    return rooms;
  }

  /**
   * 判断是否为房间像素
   */
  private isRoomPixel(x: number, y: number, imageData: ImageData): boolean {
    const pixelIndex = (y * imageData.width + x) * 4;
    const intensity = imageData.data[pixelIndex];

    // 房间区域通常是较暗的区域
    return intensity < 100;
  }

  /**
   * 洪水填充算法
   */
  private floodFill(
    startX: number,
    startY: number,
    imageData: ImageData,
    visited: boolean[]
  ): Point[] {
    const pixels: Point[] = [];
    const stack: Point[] = [{ x: startX, y: startY }];
    const width = imageData.width;
    const height = imageData.height;

    while (stack.length > 0) {
      const current = stack.pop()!;
      const index = current.y * width + current.x;

      if (
        visited[index] ||
        current.x < 0 ||
        current.x >= width ||
        current.y < 0 ||
        current.y >= height
      ) {
        continue;
      }

      if (!this.isRoomPixel(current.x, current.y, imageData)) {
        continue;
      }

      visited[index] = true;
      pixels.push(current);

      // 添加相邻像素
      stack.push({ x: current.x + 1, y: current.y });
      stack.push({ x: current.x - 1, y: current.y });
      stack.push({ x: current.x, y: current.y + 1 });
      stack.push({ x: current.x, y: current.y - 1 });
    }

    return pixels;
  }

  /**
   * 从像素创建房间
   */
  private createRoomFromPixels(pixels: Point[], roomIndex: number): Room {
    // 计算边界框
    const xs = pixels.map(p => p.x);
    const ys = pixels.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // 计算中心点
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 计算面积
    const area = pixels.length;

    // 创建房间轮廓
    const coordinates = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];

    return {
      id: `room_${roomIndex}`,
      name: `房间 ${roomIndex + 1}`,
      type: 'unknown',
      coordinates,
      center: { x: centerX, y: centerY },
      area,
      confidence: 0.8,
    };
  }

  /**
   * 检测门
   */
  private async detectDoors(
    imageData: ImageData,
    walls: Wall[]
  ): Promise<Door[]> {
    const doors: Door[] = [];

    // 简化实现：在墙壁上随机放置门
    for (let i = 0; i < walls.length && i < 3; i++) {
      const wall = walls[i];
      const door: Door = {
        id: `door_${i}`,
        position: {
          x: (wall.start.x + wall.end.x) / 2,
          y: (wall.start.y + wall.end.y) / 2,
        },
        width: 80,
        type: 'single',
        direction: Math.atan2(
          wall.end.y - wall.start.y,
          wall.end.x - wall.start.x
        ),
      };

      doors.push(door);
    }

    return doors;
  }

  /**
   * 检测窗户
   */
  private async detectWindows(
    imageData: ImageData,
    walls: Wall[]
  ): Promise<Window[]> {
    const windows: Window[] = [];

    // 简化实现：在墙壁上随机放置窗户
    for (let i = 0; i < walls.length && i < 2; i++) {
      const wall = walls[i];
      const window: Window = {
        id: `window_${i}`,
        position: {
          x: (wall.start.x + wall.end.x) / 2,
          y: (wall.start.y + wall.end.y) / 2,
        },
        width: 120,
        height: 100,
        type: 'standard',
        direction: Math.atan2(
          wall.end.y - wall.start.y,
          wall.end.x - wall.start.x
        ),
      };

      windows.push(window);
    }

    return windows;
  }

  /**
   * 分类房间类型
   */
  private async classifyRooms(
    rooms: Room[],
    doors: Door[],
    windows: Window[]
  ): Promise<Room[]> {
    return rooms.map(room => {
      // 简化的房间分类逻辑
      let roomType: RoomType = 'unknown';

      // 根据面积和位置分类
      if (room.area > 20000) {
        roomType = 'living_room';
      } else if (room.area > 15000) {
        roomType = 'bedroom';
      } else if (room.area > 10000) {
        roomType = 'kitchen';
      } else if (room.area > 5000) {
        roomType = 'bathroom';
      }

      // 根据门窗数量调整分类
      const nearbyDoors = doors.filter(door =>
        this.isPointNearRoom(door.position, room)
      ).length;

      const nearbyWindows = windows.filter(window =>
        this.isPointNearRoom(window.position, room)
      ).length;

      if (nearbyWindows > 0 && roomType === 'unknown') {
        roomType = 'bedroom';
      }

      return {
        ...room,
        type: roomType,
        confidence: Math.min(
          0.9,
          room.confidence + nearbyDoors * 0.1 + nearbyWindows * 0.1
        ),
      };
    });
  }

  /**
   * 判断点是否靠近房间
   */
  private isPointNearRoom(point: Point, room: Room): boolean {
    const distance = Math.sqrt(
      Math.pow(point.x - room.center.x, 2) +
        Math.pow(point.y - room.center.y, 2)
    );

    return distance < 100; // 100像素内认为靠近
  }

  /**
   * 计算整体置信度
   */
  private calculateOverallConfidence(
    rooms: Room[],
    walls: Wall[],
    doors: Door[],
    windows: Window[]
  ): number {
    const roomConfidence =
      rooms.length > 0
        ? rooms.reduce((sum, room) => sum + room.confidence, 0) / rooms.length
        : 0;

    const wallConfidence = walls.length > 0 ? 0.8 : 0;
    const doorConfidence = doors.length > 0 ? 0.7 : 0.5;
    const windowConfidence = windows.length > 0 ? 0.7 : 0.5;

    return (
      (roomConfidence + wallConfidence + doorConfidence + windowConfidence) / 4
    );
  }

  /**
   * 验证图像数据
   */
  private validateImageData(imageData: ImageData): boolean {
    if (
      !imageData ||
      !imageData.data ||
      !imageData.width ||
      !imageData.height
    ) {
      return false;
    }

    if (imageData.width < 100 || imageData.height < 100) {
      console.warn('图像尺寸过小，可能影响检测精度');
    }

    if (imageData.width > 4000 || imageData.height > 4000) {
      console.warn('图像尺寸过大，可能影响性能');
    }

    // 检查数据长度
    const expectedLength = imageData.width * imageData.height * 4;
    if (imageData.data.length !== expectedLength) {
      console.error('图像数据长度不匹配');
      return false;
    }

    return true;
  }

  /**
   * 评估图像质量
   */
  private async assessImageQuality(imageData: ImageData): Promise<number> {
    try {
      // 计算图像清晰度（拉普拉斯算子）
      const sharpness = this.calculateSharpness(imageData);

      // 计算对比度
      const contrast = this.calculateContrast(imageData);

      // 计算亮度分布
      const brightness = this.calculateBrightness(imageData);

      // 综合质量评分
      const quality = sharpness * 0.4 + contrast * 0.3 + brightness * 0.3;

      return Math.max(0, Math.min(1, quality));
    } catch (error) {
      console.warn('图像质量评估失败:', error);
      return 0.5; // 默认中等质量
    }
  }

  /**
   * 计算图像清晰度
   */
  private calculateSharpness(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    let totalVariance = 0;
    let pixelCount = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = data[(y * width + x) * 4];
        const neighbors = [
          data[((y - 1) * width + x) * 4],
          data[((y + 1) * width + x) * 4],
          data[(y * width + (x - 1)) * 4],
          data[(y * width + (x + 1)) * 4],
        ];

        const variance =
          neighbors.reduce(
            (sum, neighbor) => sum + Math.pow(center - neighbor, 2),
            0
          ) / 4;

        totalVariance += variance;
        pixelCount++;
      }
    }

    return Math.min(1, totalVariance / pixelCount / 10000);
  }

  /**
   * 计算图像对比度
   */
  private calculateContrast(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let sum = 0;
    let sumSquares = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // 使用红色通道作为灰度值
      sum += gray;
      sumSquares += gray * gray;
      pixelCount++;
    }

    const mean = sum / pixelCount;
    const variance = sumSquares / pixelCount - mean * mean;
    const stdDev = Math.sqrt(variance);

    return Math.min(1, stdDev / 128);
  }

  /**
   * 计算图像亮度
   */
  private calculateBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let sum = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // 使用红色通道作为灰度值
      sum += gray;
      pixelCount++;
    }

    const mean = sum / pixelCount;
    return Math.min(1, mean / 255);
  }

  /**
   * 后处理房间数据
   */
  private async postProcessRooms(
    rooms: Room[],
    walls: Wall[],
    doors: Door[],
    windows: Window[]
  ): Promise<Room[]> {
    try {
      // 过滤无效房间
      const validRooms = rooms.filter(
        room => room.area > 1000 && room.confidence > 0.3
      );

      // 合并相邻房间
      const mergedRooms = this.mergeAdjacentRooms(validRooms);

      // 验证房间关系
      const validatedRooms = this.validateRoomRelationships(mergedRooms, walls);

      // 计算房间分数
      const scoredRooms = validatedRooms.map(room => ({
        ...room,
        score: this.calculateRoomScore(room, walls, doors, windows),
      }));

      return scoredRooms;
    } catch (error) {
      console.warn('房间后处理失败:', error);
      return rooms;
    }
  }

  /**
   * 合并相邻房间
   */
  private mergeAdjacentRooms(rooms: Room[]): Room[] {
    const merged: Room[] = [];
    const processed = new Set<string>();

    for (const room of rooms) {
      if (processed.has(room.id)) continue;

      const adjacentRooms = rooms.filter(
        other =>
          other.id !== room.id &&
          !processed.has(other.id) &&
          this.areRoomsAdjacent(room, other)
      );

      if (adjacentRooms.length > 0) {
        // 合并相邻房间
        const mergedRoom = this.mergeRoomGroup([room, ...adjacentRooms]);
        merged.push(mergedRoom);
        adjacentRooms.forEach(r => processed.add(r.id));
      } else {
        merged.push(room);
      }

      processed.add(room.id);
    }

    return merged;
  }

  /**
   * 检查房间是否相邻
   */
  private areRoomsAdjacent(room1: Room, room2: Room): boolean {
    const threshold = 50; // 像素阈值

    // 检查边界框是否重叠或相邻
    const overlap = !(
      room1.coordinates[0].x > room2.coordinates[2].x ||
      room2.coordinates[0].x > room1.coordinates[2].x ||
      room1.coordinates[0].y > room2.coordinates[2].y ||
      room2.coordinates[0].y > room1.coordinates[2].y
    );

    if (overlap) return true;

    // 检查距离
    const distance = Math.sqrt(
      Math.pow(room1.center.x - room2.center.x, 2) +
        Math.pow(room1.center.y - room2.center.y, 2)
    );

    return distance < threshold;
  }

  /**
   * 合并房间组
   */
  private mergeRoomGroup(rooms: Room[]): Room {
    const allCoordinates = rooms.flatMap(room => room.coordinates);
    const xs = allCoordinates.map(p => p.x);
    const ys = allCoordinates.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const coordinates = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const area = (maxX - minX) * (maxY - minY);
    const confidence =
      rooms.reduce((acc, room) => acc + room.confidence, 0) / rooms.length;

    return {
      id: `merged_${Date.now()}`,
      name: `合并房间 ${rooms.length}`,
      type: 'living_room', // 默认类型
      coordinates,
      center: { x: centerX, y: centerY },
      area,
      confidence,
      // score: 0, // 移除不存在的属性
    };
  }

  /**
   * 验证房间关系
   */
  private validateRoomRelationships(rooms: Room[], walls: Wall[]): Room[] {
    return rooms.map(room => {
      // 检查房间是否与墙壁相邻
      const hasAdjacentWalls = walls.some(wall =>
        this.isRoomAdjacentToWall(room, wall)
      );

      // 检查房间是否与其他房间相邻
      const hasNeighbors = rooms.some(
        other => other.id !== room.id && this.areRoomsAdjacent(room, other)
      );

      return {
        ...room,
        isValid: hasAdjacentWalls || hasNeighbors || rooms.length === 1,
      };
    });
  }

  /**
   * 检查房间是否与墙壁相邻
   */
  private isRoomAdjacentToWall(room: Room, wall: Wall): boolean {
    const threshold = 20; // 像素阈值

    // 检查房间边界是否与墙壁接近
    for (const coord of room.coordinates) {
      const distance = this.pointToLineDistance(coord, wall.start, wall.end);
      if (distance < threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * 计算点到直线的距离
   */
  private pointToLineDistance(
    point: Point,
    lineStart: Point,
    lineEnd: Point
  ): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) {
      return Math.sqrt(A * A + B * B);
    }

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;

    const dx = point.x - xx;
    const dy = point.y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算房间分数
   */
  private calculateRoomScore(
    room: Room,
    walls: Wall[],
    doors: Door[],
    windows: Window[]
  ): number {
    let score = 0;

    // 面积分数
    const areaScore = Math.min(1, room.area / 20000);
    score += areaScore * 0.3;

    // 形状分数（矩形度）
    const shapeScore = this.calculateRectangularity(room);
    score += shapeScore * 0.2;

    // 置信度分数
    score += room.confidence * 0.3;

    // 门窗分数
    const doorScore =
      doors.filter(door => this.isPointNearRoom(door.position, room)).length *
      0.1;

    const windowScore =
      windows.filter(window => this.isPointNearRoom(window.position, room))
        .length * 0.1;

    score += Math.min(0.2, doorScore + windowScore);

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 计算矩形度
   */
  private calculateRectangularity(room: Room): number {
    if (room.coordinates.length < 3) return 0;

    // 计算房间面积
    let area = 0;
    for (let i = 0; i < room.coordinates.length; i++) {
      const j = (i + 1) % room.coordinates.length;
      area += room.coordinates[i].x * room.coordinates[j].y;
      area -= room.coordinates[j].x * room.coordinates[i].y;
    }
    area = Math.abs(area) / 2;

    // 计算边界框面积
    const xs = room.coordinates.map(p => p.x);
    const ys = room.coordinates.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const boundingArea = (maxX - minX) * (maxY - minY);

    return boundingArea > 0 ? area / boundingArea : 0;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }
  }
}
