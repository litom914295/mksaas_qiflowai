'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle,
  Database,
  Download,
  FileJson,
  FileText,
  Loader2,
  RefreshCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface KnowledgeDocument {
  id: string;
  category: string;
  file_name: string;
  file_size: number;
  chunk_count: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  error_message?: string;
}

const CATEGORIES = [
  { value: 'bazi', label: '八字命理' },
  { value: 'fengshui', label: '风水玄学' },
  { value: 'general', label: '通用知识' },
  { value: 'xuankong', label: '玄空风水' },
  { value: 'custom', label: '自定义' },
];

const SUPPORTED_FORMATS = ['.txt', '.md', '.json', '.pdf', '.docx', '.doc'];

export function KnowledgeBaseManager() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // 获取文档列表
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/knowledge/list');
      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // 处理文件上传
  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: '请选择文件',
        description: '请先选择要上传的文档文件',
        variant: 'destructive',
      });
      return;
    }

    const category =
      selectedCategory === 'custom' ? customCategory : selectedCategory;

    if (!category) {
      toast({
        title: '请输入分类',
        description: '自定义分类名称不能为空',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('category', category);

      // 添加所有文件
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '上传成功！',
          description: `已上传 ${selectedFiles.length} 个文件，正在处理中...`,
        });

        // 重置表单
        setSelectedFiles(null);
        setSelectedCategory('general');
        setCustomCategory('');

        // 刷新列表
        setTimeout(fetchDocuments, 1000);
      } else {
        throw new Error(data.error || '上传失败');
      }
    } catch (error: any) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 删除文档
  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch('/api/admin/knowledge/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '删除成功',
          description: '文档及其所有块已被删除',
        });

        fetchDocuments();
      } else {
        throw new Error(data.error || '删除失败');
      }
    } catch (error: any) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: '等待中', className: 'bg-gray-500' },
      processing: { label: '处理中', className: 'bg-blue-500' },
      completed: { label: '已完成', className: 'bg-green-500' },
      error: { label: '错误', className: 'bg-red-500' },
    };

    const { label, className } =
      config[status as keyof typeof config] || config.pending;

    return (
      <Badge className={className}>
        {status === 'processing' && (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        )}
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 上传区域 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">上传文档</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* 文件选择 */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">选择文件</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept={SUPPORTED_FORMATS.join(',')}
              onChange={(e) => setSelectedFiles(e.target.files)}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              支持格式: {SUPPORTED_FORMATS.join(', ')} | 可多选
            </p>
          </div>

          {/* 分类选择 */}
          <div className="space-y-2">
            <Label>文档分类</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory === 'custom' && (
              <Input
                placeholder="输入自定义分类名称"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                disabled={uploading}
              />
            )}
          </div>
        </div>

        {/* 上传按钮和进度 */}
        <div className="mt-4 space-y-3">
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                上传中... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFiles || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  开始上传
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={fetchDocuments}
              disabled={uploading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium">处理流程：</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>文件上传到服务器</li>
                <li>自动分块处理（1000字符/块，200字符重叠）</li>
                <li>生成向量嵌入（OpenAI Embeddings）</li>
                <li>存储到向量数据库（自动索引）</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>

      {/* 文档列表 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">已上传文档</h2>
            <Badge variant="secondary">{documents.length} 个文档</Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">暂无文档</p>
            <p className="text-sm text-muted-foreground mt-1">
              上传文档后将显示在这里
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文件名</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>块数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>上传时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {doc.file_name.endsWith('.json') ? (
                          <FileJson className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-500" />
                        )}
                        {doc.file_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell>{doc.chunk_count || 0}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      {new Date(doc.created_at).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDocumentToDelete(doc.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* 统计信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总文档数</p>
              <p className="text-2xl font-bold">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总块数</p>
              <p className="text-2xl font-bold">
                {documents.reduce(
                  (sum, doc) => sum + (doc.chunk_count || 0),
                  0
                )}
              </p>
            </div>
            <Database className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">已完成</p>
              <p className="text-2xl font-bold">
                {documents.filter((d) => d.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              此操作将删除该文档及其所有文本块和向量索引，无法恢复。确定要继续吗？
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
              onClick={() => documentToDelete && handleDelete(documentToDelete)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
