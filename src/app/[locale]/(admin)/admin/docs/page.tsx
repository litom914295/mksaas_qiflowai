'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calendar, Clock, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { type DocumentItem, docCategories, documents } from './docs-config';

const AdminDocsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 获取所有唯一标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach((doc) => doc.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  // 过滤文档
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 分类过滤
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      // 标签过滤
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some((tag) =>
          doc.tags.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }

      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [selectedCategory, selectedTags, searchQuery]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">文档中心</h1>
        </div>
        <p className="text-gray-600">
          完整的项目文档、开发指南、API 参考和最佳实践
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索文档标题、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6 text-base"
          />
        </div>
      </div>

      {/* 标签过滤 */}
      {allTags.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">
              标签筛选：
            </span>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="h-6 text-xs"
              >
                清除全部
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-indigo-100 transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 分类标签页 */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2 h-auto p-2 bg-transparent">
          {docCategories.map((category) => {
            const Icon = category.icon;
            const count = documents.filter((doc) =>
              category.id === 'all' ? true : doc.category === category.id
            ).length;

            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{category.name}</span>
                <span className="text-xs text-gray-500">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {docCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            {/* 分类描述 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg border border-indigo-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {category.name}
              </h2>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>

            {/* 文档列表 */}
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <Card
                      key={doc.id}
                      className="hover:shadow-lg transition-shadow duration-300 flex flex-col"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Icon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {
                              docCategories.find((c) => c.id === doc.category)
                                ?.name
                            }
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {doc.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-indigo-50"
                              onClick={() => toggleTag(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{doc.readingTime} 分钟</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{doc.lastUpdated}</span>
                          </div>
                        </div>
                        <Link
                          href={`/zh-CN/admin${doc.path}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          阅读
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  没有找到文档
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `没有找到包含 "${searchQuery}" 的文档`
                    : '该分类下暂无文档'}
                </p>
                {(searchQuery || selectedTags.length > 0) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTags([]);
                    }}
                  >
                    清除筛选条件
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* 统计信息 */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">文档总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {documents.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">涵盖所有核心功能</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">文档分类</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {docCategories.length - 1}
            </div>
            <p className="text-sm text-gray-500 mt-1">系统化的知识体系</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">标签数量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {allTags.length}
            </div>
            <p className="text-sm text-gray-500 mt-1">快速定位相关内容</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDocsPage;
