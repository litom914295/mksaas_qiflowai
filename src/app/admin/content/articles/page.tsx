'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/admin/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Tag,
  Calendar,
  User,
  TrendingUp
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // 获取文章列表
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const res = await fetch(`/api/admin/content/articles?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setArticles(data.articles);
        if (data.categories) {
          setCategories(data.categories);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '获取文章列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, statusFilter, categoryFilter]);

  // 删除文章
  const handleDeleteArticle = async (article: Article) => {
    try {
      const res = await fetch(`/api/admin/content/articles/${article.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '删除成功',
          description: `文章《${article.title}》已被删除`,
        });
        fetchArticles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  // 更改文章状态
  const handleStatusChange = async (articleId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/content/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '状态更新成功',
          description: `文章状态已更新为${getStatusLabel(status)}`,
        });
        fetchArticles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '状态更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 批量操作
  const handleBulkAction = async (action: string) => {
    if (selectedArticles.length === 0) {
      toast({
        title: '请选择文章',
        description: '请先选择要操作的文章',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/admin/content/articles/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          articleIds: selectedArticles,
          action 
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '批量操作成功',
          description: `已对 ${selectedArticles.length} 篇文章执行${action}操作`,
        });
        setSelectedArticles([]);
        fetchArticles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '批量操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 获取状态标签
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      published: '已发布',
      archived: '已归档',
    };
    return statusMap[status] || status;
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-3 w-3" />;
      case 'review':
        return <Clock className="h-3 w-3" />;
      case 'published':
        return <CheckCircle className="h-3 w-3" />;
      case 'archived':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // 获取状态变体
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'review':
        return 'warning';
      case 'published':
        return 'default';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // 定义表格列
  const columns: ColumnDef<Article>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
    },
    {
      accessorKey: 'title',
      header: '标题',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{row.original.title}</div>
          <div className="text-sm text-gray-500 truncate">{row.original.excerpt}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: '分类',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.category.name}
        </Badge>
      ),
    },
    {
      accessorKey: 'tags',
      header: '标签',
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap max-w-xs">
          {row.original.tags.slice(0, 3).map(tag => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              <Tag className="h-2 w-2 mr-1" />
              {tag.name}
            </Badge>
          ))}
          {row.original.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{row.original.tags.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: '作者',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-gray-500" />
          <span className="text-sm">{row.original.author.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getStatusVariant(status)} className="gap-1">
            {getStatusIcon(status)}
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'stats',
      header: '数据',
      cell: ({ row }) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <Eye className="h-3 w-3 text-gray-500" />
            <span>{row.original.viewCount}</span>
            <TrendingUp className="h-3 w-3 text-gray-500 ml-2" />
            <span>{row.original.likeCount}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: '发布时间',
      cell: ({ row }) => {
        const date = row.original.publishedAt;
        return date ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-500" />
            <span className="text-sm">
              {format(new Date(date), 'yyyy-MM-dd', { locale: zhCN })}
            </span>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const article = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>文章操作</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => window.open(`/article/${article.slug}`, '_blank')}
              >
                <Eye className="mr-2 h-4 w-4" />
                预览文章
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/content/articles/${article.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                编辑文章
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(article.id, 'published')}
                disabled={article.status === 'published'}
              >
                <Send className="mr-2 h-4 w-4" />
                发布文章
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(article.id, 'draft')}
                disabled={article.status === 'draft'}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                撤回发布
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setArticleToDelete(article);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除文章
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>文章管理</CardTitle>
              <CardDescription>管理和发布系统内容</CardDescription>
            </div>
            <Button onClick={() => router.push('/admin/content/articles/new')}>
              <Plus className="mr-2 h-4 w-4" />
              新建文章
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选栏 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="搜索文章标题、内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="review">审核中</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="分类筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/content/categories')}
            >
              <Tag className="mr-2 h-4 w-4" />
              管理分类
            </Button>
          </div>

          {/* 批量操作栏 */}
          {selectedArticles.length > 0 && (
            <div className="flex gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                已选择 {selectedArticles.length} 篇文章
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('publish')}
              >
                批量发布
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('archive')}
              >
                批量归档
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600"
              >
                批量删除
              </Button>
            </div>
          )}

          {/* 文章列表表格 */}
          <DataTable
            columns={columns}
            data={articles}
            loading={loading}
            onRowSelectionChange={(rows) => {
              setSelectedArticles(rows.map(r => r.original.id));
            }}
          />
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除文章《<strong>{articleToDelete?.title}</strong>》吗？
              此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => articleToDelete && handleDeleteArticle(articleToDelete)}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}