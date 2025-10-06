'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FengshuiCompassProps {
  facing: number; // 朝向度数
  mountain?: string; // 坐山
  facingDirection?: string; // 朝向
  flyingStars?: any; // 飞星数据
  size?: number;
}

export function FengshuiCompass({ 
  facing, 
  mountain = '',
  facingDirection = '',
  flyingStars,
  size = 400 
}: FengshuiCompassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPalace, setHoveredPalace] = useState<number | null>(null);
  
  // 二十四山
  const mountains = [
    '子', '癸', '丑', '艮', '寅', '甲',
    '卯', '乙', '辰', '巽', '巳', '丙',
    '午', '丁', '未', '坤', '申', '庚',
    '酉', '辛', '戌', '乾', '亥', '壬'
  ];
  
  // 八卦方位
  const eightDirections = [
    { name: '坎', angle: 0, palace: 1 },
    { name: '艮', angle: 45, palace: 8 },
    { name: '震', angle: 90, palace: 3 },
    { name: '巽', angle: 135, palace: 4 },
    { name: '离', angle: 180, palace: 9 },
    { name: '坤', angle: 225, palace: 2 },
    { name: '兑', angle: 270, palace: 7 },
    { name: '乾', angle: 315, palace: 6 }
  ];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布尺寸
    canvas.width = size;
    canvas.height = size;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 20;
    
    // 清空画布
    ctx.clearRect(0, 0, size, size);
    
    // 绘制外圆
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制二十四山
    const mountainRadius = outerRadius - 20;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    mountains.forEach((mountain, index) => {
      const angle = (index * 15 - 90) * Math.PI / 180;
      const x = centerX + Math.cos(angle) * mountainRadius;
      const y = centerY + Math.sin(angle) * mountainRadius;
      
      ctx.fillStyle = '#6b7280';
      ctx.fillText(mountain, x, y);
      
      // 绘制分隔线
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle - 7.5 * Math.PI / 180) * (outerRadius - 35),
        centerY + Math.sin(angle - 7.5 * Math.PI / 180) * (outerRadius - 35)
      );
      ctx.lineTo(
        centerX + Math.cos(angle - 7.5 * Math.PI / 180) * outerRadius,
        centerY + Math.sin(angle - 7.5 * Math.PI / 180) * outerRadius
      );
      ctx.stroke();
    });
    
    // 绘制八卦方位
    const baguraRadius = outerRadius - 60;
    ctx.font = 'bold 14px sans-serif';
    
    eightDirections.forEach((dir) => {
      const angle = (dir.angle - 90) * Math.PI / 180;
      const x = centerX + Math.cos(angle) * baguraRadius;
      const y = centerY + Math.sin(angle) * baguraRadius;
      
      ctx.fillStyle = '#374151';
      ctx.fillText(dir.name, x, y);
    });
    
    // 绘制内圆（九宫格区域）
    const innerRadius = outerRadius - 100;
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制九宫格
    if (flyingStars && flyingStars.combined) {
      const gridSize = innerRadius * 1.2 / 3;
      const startX = centerX - gridSize * 1.5;
      const startY = centerY - gridSize * 1.5;
      
      // 宫位映射
      const palacePositions = [
        [4, 9, 2],
        [3, 5, 7],
        [8, 1, 6]
      ];
      
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const palace = palacePositions[row][col];
          const x = startX + col * gridSize;
          const y = startY + row * gridSize;
          
          // 绘制格子
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, gridSize, gridSize);
          
          // 获取飞星数据
          const starData = flyingStars.combined.find((s: any) => s.palace === palace);
          if (starData) {
            // 山星（左上）
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(String(starData.mountain), x + 5, y + 20);
            
            // 运星（中）
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(starData.period), x + gridSize / 2, y + gridSize / 2);
            
            // 向星（右下）
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(String(starData.facing), x + gridSize - 5, y + gridSize - 5);
          }
        }
      }
    }
    
    // 绘制指南针
    const compassAngle = (facing - 90) * Math.PI / 180;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(compassAngle);
    
    // 绘制指针
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-5, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-5, -10);
    ctx.lineTo(0, -5);
    ctx.lineTo(5, -10);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // 绘制中心圆
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制度数
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${facing}°`, centerX, size - 10);
    
  }, [facing, flyingStars, size]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>玄空罗盘</span>
          <div className="flex gap-2">
            {mountain && <Badge variant="outline">坐 {mountain}</Badge>}
            {facingDirection && <Badge variant="default">向 {facingDirection}</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{ width: size, height: size }}
        />
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>山星</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full" />
            <span>运星</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>向星</span>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>红色指针指向北方（子山）</p>
          <p>当前朝向：{facing}度 {facingDirection}</p>
        </div>
      </CardContent>
    </Card>
  );
}