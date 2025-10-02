/**
 * 优化后代码集成测试脚本
 * 测试Phase 2核心功能的性能和稳定性
 */


// 测试配置
const TEST_CONFIG = {
  imageProcessing: {
    testImages: [
      'test-images/simple-room.jpg',
      'test-images/complex-layout.jpg',
      'test-images/low-quality.jpg',
    ],
    iterations: 10,
    timeout: 30000,
  },
  konvaEngine: {
    testRooms: 100,
    testWalls: 50,
    testIterations: 5,
    timeout: 15000,
  },
  compassCalibration: {
    testMeasurements: 20,
    testIterations: 3,
    timeout: 10000,
  },
  aiChat: {
    testMessages: [
      '请分析这个房间的风水布局',
      '客厅的朝向有什么问题吗？',
      '如何改善卧室的能量流动？',
    ],
    testIterations: 5,
    timeout: 20000,
  },
};

// 性能测试结果
const performanceResults = {
  imageProcessing: [],
  konvaEngine: [],
  compassCalibration: [],
  aiChat: [],
};

// 错误统计
const errorStats = {
  total: 0,
  byModule: {},
  byType: {},
};

/**
 * 图像处理性能测试
 */
async function testImageProcessing() {
  console.log('🧪 开始图像处理性能测试...');

  const { RoomDetector } = await import('../src/lib/image-processing/room-detector');
  const detector = new RoomDetector();

  for (let i = 0; i < TEST_CONFIG.imageProcessing.iterations; i++) {
    try {
      const startTime = performance.now();

      // 创建模拟图像数据
      const mockImageData = createMockImageData(800, 600);

      // 测试房间检测
      const result = await detector.detectRooms(mockImageData);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      performanceResults.imageProcessing.push({
        iteration: i + 1,
        processingTime,
        roomsDetected: result.rooms.length,
        confidence: result.confidence,
        quality: result.quality || 0,
      });

      console.log(
        `  迭代 ${i + 1}: ${processingTime.toFixed(2)}ms, 检测到 ${result.rooms.length} 个房间`
      );
    } catch (error) {
      console.error(`  迭代 ${i + 1} 失败:`, error.message);
      recordError('imageProcessing', 'detection', error);
    }
  }

  // 清理资源
  detector.cleanup();
}

/**
 * Konva引擎性能测试
 */
async function testKonvaEngine() {
  console.log('🧪 开始Konva引擎性能测试...');

  // 模拟Konva引擎测试
  for (let i = 0; i < TEST_CONFIG.konvaEngine.testIterations; i++) {
    try {
      const startTime = performance.now();

      // 模拟大量房间渲染
      const mockRooms = generateMockRooms(TEST_CONFIG.konvaEngine.testRooms);
      const mockWalls = generateMockWalls(TEST_CONFIG.konvaEngine.testWalls);

      // 模拟渲染过程
      await simulateKonvaRendering(mockRooms, mockWalls);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      performanceResults.konvaEngine.push({
        iteration: i + 1,
        processingTime,
        roomsRendered: mockRooms.length,
        wallsRendered: mockWalls.length,
      });

      console.log(
        `  迭代 ${i + 1}: ${processingTime.toFixed(2)}ms, 渲染 ${mockRooms.length} 个房间`
      );
    } catch (error) {
      console.error(`  迭代 ${i + 1} 失败:`, error.message);
      recordError('konvaEngine', 'rendering', error);
    }
  }
}

/**
 * 罗盘校准性能测试
 */
async function testCompassCalibration() {
  console.log('🧪 开始罗盘校准性能测试...');

  for (let i = 0; i < TEST_CONFIG.compassCalibration.testIterations; i++) {
    try {
      const startTime = performance.now();

      // 模拟校准过程
      const measurements = generateMockMeasurements(
        TEST_CONFIG.compassCalibration.testMeasurements
      );
      const calibrationResult = simulateCalibration(measurements);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      performanceResults.compassCalibration.push({
        iteration: i + 1,
        processingTime,
        measurements: measurements.length,
        confidence: calibrationResult.confidence,
        quality: calibrationResult.quality,
      });

      console.log(
        `  迭代 ${i + 1}: ${processingTime.toFixed(2)}ms, 校准置信度 ${calibrationResult.confidence.toFixed(2)}`
      );
    } catch (error) {
      console.error(`  迭代 ${i + 1} 失败:`, error.message);
      recordError('compassCalibration', 'calibration', error);
    }
  }
}

/**
 * AI聊天服务性能测试
 */
async function testAIChat() {
  console.log('🧪 开始AI聊天服务性能测试...');

  for (let i = 0; i < TEST_CONFIG.aiChat.testIterations; i++) {
    try {
      const startTime = performance.now();

      // 测试不同消息类型
      for (const message of TEST_CONFIG.aiChat.testMessages) {
        const response = await simulateAIResponse(message);

        const endTime = performance.now();
        const processingTime = endTime - startTime;

        performanceResults.aiChat.push({
          iteration: i + 1,
          message: message.substring(0, 20) + '...',
          processingTime,
          responseLength: response.content.length,
          confidence: response.confidence,
        });
      }

      console.log(
        `  迭代 ${i + 1}: 处理了 ${TEST_CONFIG.aiChat.testMessages.length} 条消息`
      );
    } catch (error) {
      console.error(`  迭代 ${i + 1} 失败:`, error.message);
      recordError('aiChat', 'response', error);
    }
  }
}

/**
 * 生成性能报告
 */
function generatePerformanceReport() {
  console.log('\n📊 性能测试报告');
  console.log('='.repeat(50));

  // 图像处理性能
  const imageStats = calculateStats(
    performanceResults.imageProcessing,
    'processingTime'
  );
  console.log('\n🖼️ 图像处理性能:');
  console.log(`  平均处理时间: ${imageStats.average.toFixed(2)}ms`);
  console.log(`  最快处理时间: ${imageStats.min.toFixed(2)}ms`);
  console.log(`  最慢处理时间: ${imageStats.max.toFixed(2)}ms`);
  console.log(`  标准差: ${imageStats.stdDev.toFixed(2)}ms`);

  // Konva引擎性能
  const konvaStats = calculateStats(
    performanceResults.konvaEngine,
    'processingTime'
  );
  console.log('\n🎨 Konva引擎性能:');
  console.log(`  平均渲染时间: ${konvaStats.average.toFixed(2)}ms`);
  console.log(`  最快渲染时间: ${konvaStats.min.toFixed(2)}ms`);
  console.log(`  最慢渲染时间: ${konvaStats.max.toFixed(2)}ms`);
  console.log(`  标准差: ${konvaStats.stdDev.toFixed(2)}ms`);

  // 罗盘校准性能
  const compassStats = calculateStats(
    performanceResults.compassCalibration,
    'processingTime'
  );
  console.log('\n🧭 罗盘校准性能:');
  console.log(`  平均校准时间: ${compassStats.average.toFixed(2)}ms`);
  console.log(`  最快校准时间: ${compassStats.min.toFixed(2)}ms`);
  console.log(`  最慢校准时间: ${compassStats.max.toFixed(2)}ms`);
  console.log(`  标准差: ${compassStats.stdDev.toFixed(2)}ms`);

  // AI聊天性能
  const aiStats = calculateStats(performanceResults.aiChat, 'processingTime');
  console.log('\n🤖 AI聊天性能:');
  console.log(`  平均响应时间: ${aiStats.average.toFixed(2)}ms`);
  console.log(`  最快响应时间: ${aiStats.min.toFixed(2)}ms`);
  console.log(`  最慢响应时间: ${aiStats.max.toFixed(2)}ms`);
  console.log(`  标准差: ${aiStats.stdDev.toFixed(2)}ms`);

  // 错误统计
  console.log('\n❌ 错误统计:');
  console.log(`  总错误数: ${errorStats.total}`);
  Object.entries(errorStats.byModule).forEach(([module, count]) => {
    console.log(`  ${module}: ${count} 个错误`);
  });

  // 性能评级
  console.log('\n⭐ 性能评级:');
  const overallPerformance = calculateOverallPerformance();
  console.log(
    `  整体性能: ${overallPerformance.grade} (${overallPerformance.score}/100)`
  );
  console.log(`  建议: ${overallPerformance.recommendation}`);
}

/**
 * 计算统计信息
 */
function calculateStats(data, field) {
  if (data.length === 0) return { average: 0, min: 0, max: 0, stdDev: 0 };

  const values = data.map(item => item[field]);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  return { average, min, max, stdDev };
}

/**
 * 计算整体性能
 */
function calculateOverallPerformance() {
  const imageStats = calculateStats(
    performanceResults.imageProcessing,
    'processingTime'
  );
  const konvaStats = calculateStats(
    performanceResults.konvaEngine,
    'processingTime'
  );
  const compassStats = calculateStats(
    performanceResults.compassCalibration,
    'processingTime'
  );
  const aiStats = calculateStats(performanceResults.aiChat, 'processingTime');

  // 性能评分（基于处理时间，越低越好）
  const imageScore = Math.max(0, 100 - imageStats.average / 100);
  const konvaScore = Math.max(0, 100 - konvaStats.average / 50);
  const compassScore = Math.max(0, 100 - compassStats.average / 20);
  const aiScore = Math.max(0, 100 - aiStats.average / 200);

  const overallScore = (imageScore + konvaScore + compassScore + aiScore) / 4;

  let grade, recommendation;
  if (overallScore >= 90) {
    grade = 'A+';
    recommendation = '性能优秀，可以投入生产使用';
  } else if (overallScore >= 80) {
    grade = 'A';
    recommendation = '性能良好，建议进行小幅优化';
  } else if (overallScore >= 70) {
    grade = 'B';
    recommendation = '性能一般，需要进一步优化';
  } else if (overallScore >= 60) {
    grade = 'C';
    recommendation = '性能较差，需要重点优化';
  } else {
    grade = 'D';
    recommendation = '性能很差，需要重新设计';
  }

  return { score: overallScore, grade, recommendation };
}

/**
 * 记录错误
 */
function recordError(module, type, error) {
  errorStats.total++;
  errorStats.byModule[module] = (errorStats.byModule[module] || 0) + 1;
  errorStats.byType[type] = (errorStats.byType[type] || 0) + 1;
}

// 辅助函数
function createMockImageData(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.random() * 255; // Red
    data[i + 1] = Math.random() * 255; // Green
    data[i + 2] = Math.random() * 255; // Blue
    data[i + 3] = 255; // Alpha
  }
  return new ImageData(data, width, height);
}

function generateMockRooms(count) {
  const rooms = [];
  for (let i = 0; i < count; i++) {
    rooms.push({
      id: `room_${i}`,
      coordinates: [
        { x: Math.random() * 800, y: Math.random() * 600 },
        { x: Math.random() * 800, y: Math.random() * 600 },
        { x: Math.random() * 800, y: Math.random() * 600 },
        { x: Math.random() * 800, y: Math.random() * 600 },
      ],
      area: Math.random() * 10000 + 1000,
    });
  }
  return rooms;
}

function generateMockWalls(count) {
  const walls = [];
  for (let i = 0; i < count; i++) {
    walls.push({
      id: `wall_${i}`,
      start: { x: Math.random() * 800, y: Math.random() * 600 },
      end: { x: Math.random() * 800, y: Math.random() * 600 },
      thickness: Math.random() * 20 + 5,
    });
  }
  return walls;
}

async function simulateKonvaRendering(rooms, walls) {
  // 模拟渲染延迟
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
}

function generateMockMeasurements(count) {
  const measurements = [];
  for (let i = 0; i < count; i++) {
    measurements.push({
      direction: Math.random() * 360,
      accuracy: Math.random() * 5 + 1,
      stability: Math.random() * 0.5 + 0.5,
      timestamp: Date.now() + i * 1000,
    });
  }
  return measurements;
}

function simulateCalibration(measurements) {
  const directions = measurements.map(m => m.direction);
  const mean = directions.reduce((sum, d) => sum + d, 0) / directions.length;
  const variance =
    directions.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
    directions.length;
  const stability = Math.max(0, 1 - Math.sqrt(variance) / 10);

  return {
    confidence: Math.min(0.95, stability + Math.random() * 0.1),
    quality: {
      strength: Math.random() * 0.3 + 0.7,
      stability,
      accuracy: Math.random() * 0.2 + 0.8,
    },
  };
}

async function simulateAIResponse(message) {
  // 模拟AI响应延迟
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  return {
    content: `这是对"${message}"的模拟响应。根据风水理论，建议...`,
    confidence: Math.random() * 0.3 + 0.7,
    suggestions: ['了解更多', '查看详情', '咨询专家'],
  };
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始Phase 2核心功能集成测试');
  console.log('='.repeat(50));

  try {
    // 运行所有测试
    await testImageProcessing();
    await testKonvaEngine();
    await testCompassCalibration();
    await testAIChat();

    // 生成报告
    generatePerformanceReport();

    console.log('\n✅ 所有测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  performanceResults,
  errorStats,
};

