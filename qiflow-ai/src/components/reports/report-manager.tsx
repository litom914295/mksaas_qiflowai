'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    MoreVertical,
    Share2,
    SortAsc,
    SortDesc,
    Trash2,
    X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// Report record type
interface ReportRecord {
  id: string;
  title: string;
  type: 'comprehensive' | 'basic' | 'detailed' | 'executive';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  generatedAt?: Date;
  fileSize?: number;
  format: 'pdf' | 'html' | 'docx';
  userId: string;
  propertyId: string;
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  shareCount: number;
  lastViewedAt?: Date;
}

// Filter and sort options
interface FilterOptions {
  search: string;
  type: string;
  status: string;
  grade: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'score' | 'fileSize';
  sortOrder: 'asc' | 'desc';
}

// Report manager component
export const ReportManager: React.FC = () => {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportRecord[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    status: 'all',
    grade: 'all',
    dateRange: { start: null, end: null },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock report data
  useEffect(() => {
    const mockReports: ReportRecord[] = [
      {
        id: '1',
        title: 'Comprehensive Feng Shui Analysis Report - Mr. Zhang\'s Residence',
        type: 'comprehensive',
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        generatedAt: new Date('2024-01-15'),
        fileSize: 2.5,
        format: 'pdf',
        userId: 'user1',
        propertyId: 'prop1',
        score: 85,
        grade: 'A',
        tags: ['Residence', 'Comprehensive Analysis', '2024'],
        isPublic: false,
        downloadCount: 3,
        shareCount: 1,
        lastViewedAt: new Date('2024-01-16'),
      },
      {
        id: '2',
        title: 'Basic Feng Shui Report - Office',
        type: 'basic',
        status: 'completed',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        generatedAt: new Date('2024-01-14'),
        fileSize: 1.2,
        format: 'pdf',
        userId: 'user1',
        propertyId: 'prop2',
        score: 72,
        grade: 'B+',
        tags: ['Office', 'Basic Analysis'],
        isPublic: true,
        downloadCount: 8,
        shareCount: 2,
        lastViewedAt: new Date('2024-01-15'),
      },
      {
        id: '3',
        title: 'Detailed Technical Report - Commercial Space',
        type: 'detailed',
        status: 'generating',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
        fileSize: undefined,
        format: 'pdf',
        userId: 'user1',
        propertyId: 'prop3',
        score: 0,
        grade: 'F',
        tags: ['Commercial Space', 'Technical Analysis'],
        isPublic: false,
        downloadCount: 0,
        shareCount: 0,
      },
      {
        id: '4',
        title: 'Executive Summary Report - Corporate Headquarters',
        type: 'executive',
        status: 'completed',
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
        generatedAt: new Date('2024-01-13'),
        fileSize: 0.8,
        format: 'pdf',
        userId: 'user1',
        propertyId: 'prop4',
        score: 91,
        grade: 'A+',
        tags: ['Corporate Headquarters', 'Executive Summary'],
        isPublic: false,
        downloadCount: 1,
        shareCount: 0,
        lastViewedAt: new Date('2024-01-14'),
      },
    ];

    setReports(mockReports);
    setFilteredReports(mockReports);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...reports];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        report =>
          report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          report.tags.some(tag =>
            tag.toLowerCase().includes(filters.search.toLowerCase())
          )
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(report => report.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    // Grade filter
    if (filters.grade !== 'all') {
      filtered = filtered.filter(report => report.grade === filters.grade);
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        report => report.createdAt >= filters.dateRange.start!
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(
        report => report.createdAt <= filters.dateRange.end!
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'fileSize':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReports(filtered);
  }, [reports, filters]);

  // 处理报告选择
  const handleReportSelect = useCallback((reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  }, []);

  // 处理全选
  // const handleSelectAll = useCallback(() => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  }, [filteredReports, selectedReports]);

  // 删除报告
  const handleDeleteReports = useCallback((reportIds: string[]) => {
    setReports(prev => prev.filter(report => !reportIds.includes(report.id)));
    setSelectedReports([]);
  }, []);

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'generating':
        return <Clock className='h-4 w-4 text-blue-500 animate-spin' />;
      case 'failed':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      default:
        return <FileText className='h-4 w-4 text-gray-500' />;
    }
  };

  // 获取等级颜色
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 格式化文件大小
  const formatFileSize = (size?: number) => {
    if (!size) return '未知';
    return size < 1
      ? `${(size * 1024).toFixed(0)} KB`
      : `${size.toFixed(1)} MB`;
  };

  return (
    <div className='w-full max-w-7xl mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>报告管理</h1>
          <p className='text-gray-600'>管理和查看您的风水分析报告</p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? '列表视图' : '网格视图'}
          </Button>
          <Button
            variant='outline'
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className='h-4 w-4 mr-2' />
            筛选
          </Button>
        </div>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>筛选和排序</span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowFilters(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>搜索</label>
                <Input
                  placeholder='搜索报告标题或标签...'
                  value={filters.search}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>类型</label>
                <select
                  value={filters.type}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, type: e.target.value }))
                  }
                  className='w-full p-2 border rounded-md'
                >
                  <option value='all'>全部类型</option>
                  <option value='comprehensive'>综合报告</option>
                  <option value='basic'>基础报告</option>
                  <option value='detailed'>详细报告</option>
                  <option value='executive'>高管摘要</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>状态</label>
                <select
                  value={filters.status}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, status: e.target.value }))
                  }
                  className='w-full p-2 border rounded-md'
                >
                  <option value='all'>全部状态</option>
                  <option value='completed'>已完成</option>
                  <option value='generating'>生成中</option>
                  <option value='draft'>草稿</option>
                  <option value='failed'>失败</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>等级</label>
                <select
                  value={filters.grade}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, grade: e.target.value }))
                  }
                  className='w-full p-2 border rounded-md'
                >
                  <option value='all'>全部等级</option>
                  <option value='A+'>A+</option>
                  <option value='A'>A</option>
                  <option value='B+'>B+</option>
                  <option value='B'>B</option>
                  <option value='C+'>C+</option>
                  <option value='C'>C</option>
                  <option value='D'>D</option>
                  <option value='F'>F</option>
                </select>
              </div>
            </div>
            <div className='mt-4 flex items-center gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  排序方式
                </label>
                <select
                  value={filters.sortBy}
                  onChange={e =>
                    setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value as any,
                    }))
                  }
                  className='p-2 border rounded-md'
                >
                  <option value='createdAt'>创建时间</option>
                  <option value='updatedAt'>更新时间</option>
                  <option value='title'>标题</option>
                  <option value='score'>评分</option>
                  <option value='fileSize'>文件大小</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  排序顺序
                </label>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                    }))
                  }
                >
                  {filters.sortOrder === 'asc' ? (
                    <SortAsc className='h-4 w-4' />
                  ) : (
                    <SortDesc className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 批量操作 */}
      {selectedReports.length > 0 && (
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>
                已选择 {selectedReports.length} 个报告
              </span>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleDeleteReports(selectedReports)}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  删除
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedReports([])}
                >
                  取消选择
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 报告列表 */}
      <div className='space-y-4'>
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <FileText className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                没有找到报告
              </h3>
              <p className='text-gray-600'>尝试调整筛选条件或创建新报告</p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredReports.map(report => (
              <Card
                key={report.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedReports.includes(report.id)
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
                onClick={() => handleReportSelect(report.id)}
              >
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg mb-2 line-clamp-2'>
                        {report.title}
                      </h3>
                      <div className='flex items-center gap-2 mb-2'>
                        {getStatusIcon(report.status)}
                        <Badge variant='outline'>
                          {report.type === 'comprehensive'
                            ? '综合'
                            : report.type === 'basic'
                              ? '基础'
                              : report.type === 'detailed'
                                ? '详细'
                                : '高管'}
                        </Badge>
                        <Badge className={getGradeColor(report.grade)}>
                          {report.grade}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation();
                        // 显示更多选项
                      }}
                    >
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='space-y-2 text-sm text-gray-600'>
                    <div className='flex items-center justify-between'>
                      <span>创建时间:</span>
                      <span>
                        {report.createdAt.toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {report.fileSize && (
                      <div className='flex items-center justify-between'>
                        <span>文件大小:</span>
                        <span>{formatFileSize(report.fileSize)}</span>
                      </div>
                    )}
                    <div className='flex items-center justify-between'>
                      <span>评分:</span>
                      <span className='font-medium'>{report.score}/100</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>下载次数:</span>
                      <span>{report.downloadCount}</span>
                    </div>
                  </div>

                  <div className='mt-4 flex flex-wrap gap-1'>
                    {report.tags.map(tag => (
                      <Badge key={tag} variant='secondary' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className='mt-4 flex items-center gap-2'>
                    <Button size='sm' variant='outline'>
                      <Eye className='h-4 w-4 mr-1' />
                      查看
                    </Button>
                    <Button size='sm' variant='outline'>
                      <Download className='h-4 w-4 mr-1' />
                      下载
                    </Button>
                    <Button size='sm' variant='outline'>
                      <Share2 className='h-4 w-4 mr-1' />
                      分享
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-gray-600'>
          显示 {filteredReports.length} 个报告，共 {reports.length} 个
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' disabled>
            上一页
          </Button>
          <Button variant='outline' size='sm' disabled>
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;

