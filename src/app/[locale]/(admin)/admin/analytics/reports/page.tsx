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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import {
  Activity,
  BarChart2,
  Calendar,
  Copy,
  Download,
  Edit,
  Eye,
  Filter,
  GripVertical,
  LineChart,
  MoreVertical,
  PieChart,
  Play,
  Plus,
  Save,
  Settings,
  Share2,
  Table,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
type DataSource = 'users' | 'orders' | 'revenue' | 'products' | 'custom';
type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

type ChartWidget = {
  id: string;
  type: ChartType;
  title: string;
  dataSource: DataSource;
  dimensions: string[];
  metrics: string[];
  filters?: any[];
  timeRange?: string;
  granularity?: TimeGranularity;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};

type Report = {
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: ChartWidget[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  views: number;
  lastViewed?: string;
};

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [widgets, setWidgets] = useState<ChartWidget[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 模拟报表数据
  const mockReports: Report[] = [
    {
      id: '1',
      name: '销售概览报表',
      description: '展示销售相关的核心指标和趋势',
      category: '业务报表',
      widgets: [
        {
          id: 'w1',
          type: 'line',
          title: '销售趋势',
          dataSource: 'revenue',
          dimensions: ['date'],
          metrics: ['amount', 'orders'],
          timeRange: '30d',
          granularity: 'day',
          layout: { x: 0, y: 0, w: 6, h: 3 },
        },
        {
          id: 'w2',
          type: 'pie',
          title: '产品分布',
          dataSource: 'products',
          dimensions: ['category'],
          metrics: ['sales'],
          layout: { x: 6, y: 0, w: 6, h: 3 },
        },
      ],
      isPublic: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      views: 1250,
      lastViewed: new Date().toISOString(),
    },
    {
      id: '2',
      name: '用户分析报表',
      description: '用户行为和留存分析',
      category: '用户报表',
      widgets: [
        {
          id: 'w3',
          type: 'bar',
          title: '用户增长',
          dataSource: 'users',
          dimensions: ['registration_date'],
          metrics: ['count'],
          timeRange: '90d',
          granularity: 'week',
          layout: { x: 0, y: 0, w: 12, h: 3 },
        },
      ],
      isPublic: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      views: 523,
      lastViewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: '运营效率报表',
      description: '监控运营效率关键指标',
      category: '运营报表',
      widgets: [],
      isPublic: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'operator',
      views: 789,
    },
  ];

  // 图表类型配置
  const chartTypes = [
    { value: 'line', label: '折线图', icon: LineChart },
    { value: 'bar', label: '柱状图', icon: BarChart2 },
    { value: 'pie', label: '饼图', icon: PieChart },
    { value: 'area', label: '面积图', icon: Activity },
    { value: 'scatter', label: '散点图', icon: TrendingUp },
    { value: 'table', label: '数据表', icon: Table },
  ];

  // 数据源配置
  const dataSources = [
    {
      value: 'users',
      label: '用户数据',
      fields: ['id', 'name', 'email', 'registration_date', 'last_login'],
    },
    {
      value: 'orders',
      label: '订单数据',
      fields: ['order_no', 'amount', 'status', 'created_at'],
    },
    {
      value: 'revenue',
      label: '营收数据',
      fields: ['date', 'amount', 'channel', 'product'],
    },
    {
      value: 'products',
      label: '产品数据',
      fields: ['name', 'category', 'price', 'sales'],
    },
    { value: 'custom', label: '自定义SQL', fields: [] },
  ];

  useEffect(() => {
    setReports(mockReports);
  }, []);

  // 拖拽组件
  const SortableWidget = ({ widget }: { widget: ChartWidget }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: widget.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const ChartIcon =
      chartTypes.find((t) => t.value === widget.type)?.icon || BarChart2;

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card className={isDragging ? 'shadow-xl' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isDesignMode && (
                  <div {...listeners} className="cursor-move">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <ChartIcon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{widget.title}</CardTitle>
              </div>
              {isDesignMode && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditWidget(widget)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWidget(widget.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-muted rounded">
              <div className="text-center">
                <ChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {widget.dataSource}
                </p>
                {widget.timeRange && (
                  <Badge variant="outline" className="mt-2">
                    {widget.timeRange}
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {widget.dimensions.map((dim) => (
                <Badge key={dim} variant="secondary" className="text-xs">
                  维度: {dim}
                </Badge>
              ))}
              {widget.metrics.map((metric) => (
                <Badge key={metric} variant="default" className="text-xs">
                  指标: {metric}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setWidgets([]);
    setShowCreateDialog(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setWidgets(report.widgets);
    setIsDesignMode(true);
  };

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report);
    setWidgets(report.widgets);
    setIsDesignMode(false);
  };

  const handleAddWidget = () => {
    const newWidget: ChartWidget = {
      id: `widget-${Date.now()}`,
      type: 'line',
      title: '新图表',
      dataSource: 'users',
      dimensions: [],
      metrics: [],
      layout: { x: 0, y: widgets.length, w: 6, h: 3 },
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleEditWidget = (widget: ChartWidget) => {
    // 实现编辑widget逻辑
    toast({
      title: '编辑组件',
      description: `编辑 "${widget.title}" 配置`,
    });
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
  };

  const handleSaveReport = async () => {
    try {
      setIsSubmitting(true);
      // 模拟保存
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: '保存成功',
        description: '报表已保存',
      });
      setIsDesignMode(false);
    } catch (error) {
      toast({
        title: '保存失败',
        description: '无法保存报表，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportReport = async (report: Report) => {
    try {
      toast({
        title: '导出开始',
        description: '正在生成报表...',
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: '导出成功',
        description: '报表已下载',
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: '无法导出报表',
        variant: 'destructive',
      });
    }
  };

  const handleShareReport = (report: Report) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/reports/${report.id}`
    );
    toast({
      title: '链接已复制',
      description: '报表分享链接已复制到剪贴板',
    });
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('确定要删除这个报表吗？')) return;

    try {
      setReports(reports.filter((r) => r.id !== reportId));
      toast({
        title: '删除成功',
        description: '报表已删除',
      });
    } catch (error) {
      toast({
        title: '删除失败',
        description: '无法删除报表',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {!selectedReport ? (
        // 报表列表视图
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">自定义报表</h1>
              <p className="text-muted-foreground">创建和管理自定义数据报表</p>
            </div>
            <Button onClick={handleCreateReport}>
              <Plus className="mr-2 h-4 w-4" />
              创建报表
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handlePreviewReport(report)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          查看
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditReport(report)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShareReport(report)}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          分享
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportReport(report)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          导出
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">分类</span>
                      <Badge variant="outline">{report.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">组件数</span>
                      <span className="font-medium">
                        {report.widgets.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">浏览量</span>
                      <span className="font-medium">
                        {report.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">创建者</span>
                      <span>{report.createdBy}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          创建于{' '}
                          {format(new Date(report.createdAt), 'yyyy-MM-dd', {
                            locale: zhCN,
                          })}
                        </span>
                        {report.isPublic ? (
                          <Badge variant="default" className="text-xs">
                            公开
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            私有
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        // 报表设计/预览视图
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedReport(null);
                  setIsDesignMode(false);
                }}
              >
                ← 返回列表
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{selectedReport.name}</h2>
                <p className="text-muted-foreground">
                  {selectedReport.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isDesignMode ? (
                <>
                  <Button variant="outline" onClick={handleAddWidget}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加组件
                  </Button>
                  <Button onClick={handleSaveReport} disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsDesignMode(false)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    预览
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsDesignMode(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShareReport(selectedReport)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    分享
                  </Button>
                  <Button onClick={() => handleExportReport(selectedReport)}>
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                </>
              )}
            </div>
          </div>

          {widgets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">暂无组件</p>
                <p className="text-sm text-muted-foreground mb-4">
                  点击"添加组件"开始构建您的报表
                </p>
                {isDesignMode && (
                  <Button onClick={handleAddWidget}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加第一个组件
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={widgets.map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {widgets.map((widget) => (
                    <SortableWidget key={widget.id} widget={widget} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* 创建报表对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新报表</DialogTitle>
            <DialogDescription>
              输入报表基本信息，然后开始设计
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="report-name" className="text-sm font-medium">
                报表名称
              </label>
              <Input
                id="report-name"
                placeholder="月度销售分析"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="report-desc" className="text-sm font-medium">
                描述
              </label>
              <Textarea
                id="report-desc"
                placeholder="描述报表的用途..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="report-category" className="text-sm font-medium">
                分类
              </label>
              <Select defaultValue="business">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">业务报表</SelectItem>
                  <SelectItem value="user">用户报表</SelectItem>
                  <SelectItem value="operation">运营报表</SelectItem>
                  <SelectItem value="financial">财务报表</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="public" />
              <label htmlFor="public" className="text-sm font-medium">
                设为公开报表
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                const newReport: Report = {
                  id: String(Date.now()),
                  name: '新报表',
                  description: '',
                  category: '业务报表',
                  widgets: [],
                  isPublic: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  createdBy: 'current_user',
                  views: 0,
                };
                setSelectedReport(newReport);
                setWidgets([]);
                setIsDesignMode(true);
                setShowCreateDialog(false);
              }}
            >
              创建并设计
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;
