'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarkdownEditor from '@/components/admin/content/markdown-editor';
import { 
  Save,
  Send,
  ArrowLeft,
  Settings,
  FileText,
  Image as ImageIcon,
  Tag,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  X,
  Upload
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: string;
  isFeature: boolean;
  allowComments: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export default function ArticleEditPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const isNew = articleId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string }>>([]);
  const [newTag, setNewTag] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    categoryId: '',
    tags: [],
    status: 'draft',
    publishedAt: '',
    isFeature: false,
    allowComments: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  // 加载文章数据
  useEffect(() => {
    if (!isNew) {
      fetchArticle();
    }
    fetchMetadata();
  }, [articleId]);

  // 获取文章数据
  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/admin/content/articles/${articleId}`);
      const data = await res.json();
      
      if (data.success) {
        const article = data.article;
        setFormData({
          title: article.title || '',
          slug: article.slug || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          coverImage: article.coverImage || '',
          categoryId: article.category?.id || '',
          tags: article.tags?.map((t: any) => t.id) || [],
          status: article.status || 'draft',
          publishedAt: article.publishedAt ? format(new Date(article.publishedAt), 'yyyy-MM-dd\'T\'HH:mm') : '',
          isFeature: article.isFeature || false,
          allowComments: article.allowComments !== false,
          metaTitle: article.metaTitle || '',
          metaDescription: article.metaDescription || '',
          metaKeywords: article.metaKeywords || '',
        });
        setPreviewUrl(`/article/${article.slug}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error instanceof Error ? error.message : '无法加载文章数据',
        variant: 'destructive',
      });
      router.push('/admin/content/articles');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类和标签
  const fetchMetadata = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/admin/content/categories'),
        fetch('/api/admin/content/tags'),
      ]);

      const categoriesData = await categoriesRes.json();
      const tagsData = await tagsRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
      if (tagsData.success) {
        setAvailableTags(tagsData.tags);
      }
    } catch (error) {
      console.error('加载元数据失败:', error);
    }
  };

  // 自动生成slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  // 处理标题变化
  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
      metaTitle: prev.metaTitle || value,
    }));
  };

  // 添加新标签
  const handleAddTag = () => {
    if (newTag.trim()) {
      // TODO: 创建新标签并添加到选中列表
      toast({
        title: '添加标签',
        description: `标签 "${newTag}" 已添加`,
      });
      setNewTag('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(id => id !== tagId),
    }));
  };

  // 处理封面图片上传
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: 实现图片上传到服务器
    // 这里暂时使用Base64
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        coverImage: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // 处理Markdown编辑器中的图片上传
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    // TODO: 实现图片上传到CDN
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 保存文章
  const handleSave = async (publish: boolean = false) => {
    if (!formData.title || !formData.content || !formData.categoryId) {
      toast({
        title: '请填写必要信息',
        description: '标题、内容和分类为必填项',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const url = isNew 
        ? '/api/admin/content/articles'
        : `/api/admin/content/articles/${articleId}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const submitData = {
        ...formData,
        status: publish ? 'published' : formData.status,
        publishedAt: publish && !formData.publishedAt 
          ? new Date().toISOString()
          : formData.publishedAt,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '保存成功',
          description: publish ? '文章已发布' : '文章已保存',
        });
        
        if (isNew) {
          router.push(`/admin/content/articles/${data.article.id}/edit`);
        } else {
          fetchArticle(); // 重新加载最新数据
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">加载中...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/content/articles')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
          <h1 className="text-2xl font-bold">
            {isNew ? '创建文章' : '编辑文章'}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isNew && previewUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(previewUrl, '_blank')}
            >
              <Eye className="mr-2 h-4 w-4" />
              预览
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            保存草稿
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Send className="mr-2 h-4 w-4" />
            发布文章
          </Button>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主内容 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="请输入文章标题"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">URL别名</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="自动生成或自定义URL"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">摘要</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="文章摘要，将显示在列表页"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>文章内容</CardTitle>
              <CardDescription>支持Markdown格式编辑</CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                height={600}
                onImageUpload={handleEditorImageUpload}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO设置</CardTitle>
              <CardDescription>搜索引擎优化相关设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta标题</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="留空则使用文章标题"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta描述</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="留空则使用文章摘要"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metaKeywords">关键词</Label>
                <Input
                  id="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="多个关键词用逗号分隔"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧设置面板 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>发布设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="review">待审核</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="publishedAt">发布时间</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeature">设为推荐</Label>
                <Switch
                  id="isFeature"
                  checked={formData.isFeature}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeature: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowComments">允许评论</Label>
                <Switch
                  id="allowComments"
                  checked={formData.allowComments}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowComments: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>分类和标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="category">分类 *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>标签</Label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.tags.map(tagId => {
                    const tag = availableTags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge key={tagId} variant="secondary">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tagId)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!formData.tags.includes(value)) {
                      setFormData({ ...formData, tags: [...formData.tags, value] });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择标签" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags
                      .filter(tag => !formData.tags.includes(tag.id))
                      .map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>封面图片</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.coverImage ? (
                <div className="relative">
                  <img
                    src={formData.coverImage}
                    alt="封面"
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">点击上传封面图片</p>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}