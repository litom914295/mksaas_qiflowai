'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Download,
  Maximize2,
  Network,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * 推荐关系网络可视化组件
 * 使用原生Canvas API绘制,避免引入重量级D3.js依赖
 */

interface Node {
  id: string;
  name: string;
  email: string;
  level: number; // 推荐层级
  referrals: number; // 推荐人数
  x?: number;
  y?: number;
  radius?: number;
}

interface Edge {
  source: string; // referrerId
  target: string; // refereeId
}

interface ReferralNetworkData {
  nodes: Node[];
  edges: Edge[];
}

export function ReferralNetworkGraph({ userId }: { userId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ReferralNetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    fetchNetworkData();
  }, [userId]);

  useEffect(() => {
    if (data && canvasRef.current) {
      drawNetwork();
    }
  }, [data, zoom, offset]);

  async function fetchNetworkData() {
    try {
      const url = userId
        ? `/api/admin/referral/network?userId=${userId}`
        : '/api/admin/referral/network';
      const res = await fetch(url);
      const networkData = await res.json();

      // 计算节点位置(简单力导向布局)
      const positioned = calculateLayout(networkData);
      setData(positioned);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  }

  function calculateLayout(data: ReferralNetworkData): ReferralNetworkData {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    // 简化的分层布局算法
    const nodesByLevel = data.nodes.reduce(
      (acc, node) => {
        if (!acc[node.level]) acc[node.level] = [];
        acc[node.level].push(node);
        return acc;
      },
      {} as Record<number, Node[]>
    );

    const maxLevel = Math.max(...data.nodes.map((n) => n.level));
    const levelHeight = height / (maxLevel + 2);

    data.nodes.forEach((node) => {
      const levelNodes = nodesByLevel[node.level];
      const index = levelNodes.indexOf(node);
      const levelWidth = width / (levelNodes.length + 1);

      node.x = levelWidth * (index + 1);
      node.y = levelHeight * (node.level + 1);
      node.radius = Math.max(20, Math.min(50, 15 + node.referrals * 2));
    });

    return data;
  }

  function drawNetwork() {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 应用变换
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // 绘制边
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    data.edges.forEach((edge) => {
      const source = data.nodes.find((n) => n.id === edge.source);
      const target = data.nodes.find((n) => n.id === edge.target);
      if (source && target && source.x && source.y && target.x && target.y) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // 绘制节点
    data.nodes.forEach((node) => {
      if (!node.x || !node.y || !node.radius) return;

      // 节点圆圈
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);

      // 根据层级设置颜色
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      ctx.fillStyle = colors[node.level % colors.length];
      ctx.fill();

      // 选中状态
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // 节点文本
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name.substring(0, 8), node.x, node.y);

      // 推荐数量标签
      if (node.referrals > 0) {
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${node.referrals}人`, node.x, node.y + node.radius + 12);
      }
    });

    ctx.restore();
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    // 检查是否点击了节点
    const clicked = data.nodes.find((node) => {
      if (!node.x || !node.y || !node.radius) return false;
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    setSelectedNode(clicked || null);
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(z + 0.2, 3));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(z - 0.2, 0.5));
  }

  function handleReset() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  }

  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referral-network-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('导出成功');
    });
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center text-gray-500">
          <div className="text-center">
            <Network className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>暂无推荐关系数据</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              推荐关系网络图
            </CardTitle>
            <CardDescription>
              共 {data.nodes.length} 个节点, {data.edges.length} 条关系
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="relative border rounded-lg overflow-hidden bg-gray-50"
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="cursor-move"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            {/* 图例 */}
            <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-sm space-y-2">
              <div className="text-xs font-semibold">推荐层级</div>
              {[0, 1, 2, 3].map((level) => (
                <div key={level} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                      ][level],
                    }}
                  />
                  <span>L{level}</span>
                </div>
              ))}
            </div>

            {/* 缩放指示器 */}
            <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 节点详情 */}
      {selectedNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              节点详情
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">用户名:</span>
              <span className="font-medium">{selectedNode.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">邮箱:</span>
              <span className="text-sm">{selectedNode.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">推荐层级:</span>
              <Badge>Level {selectedNode.level}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">直接推荐:</span>
              <span className="font-medium text-blue-600">
                {selectedNode.referrals} 人
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
