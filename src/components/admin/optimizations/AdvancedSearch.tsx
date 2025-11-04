/**
 * 高级搜索组件
 * 支持多条件组合搜索、保存搜索条件、搜索历史
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { History, Plus, Save, Search, X } from 'lucide-react';
import { useState } from 'react';

export interface SearchField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { value: string; label: string }[];
}

interface AdvancedSearchProps {
  fields: SearchField[];
  onSearch: (filters: Record<string, any>) => void;
  onSave?: (name: string, filters: Record<string, any>) => void;
}

export function AdvancedSearch({
  fields,
  onSearch,
  onSave,
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const addFilter = (fieldName: string) => {
    if (!activeFilters.includes(fieldName)) {
      setActiveFilters([...activeFilters, fieldName]);
    }
  };

  const removeFilter = (fieldName: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== fieldName));
    const newFilters = { ...filters };
    delete newFilters[fieldName];
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleSave = () => {
    const name = prompt('保存搜索条件名称:');
    if (name && onSave) {
      onSave(name, filters);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* 搜索标题 */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Search className="h-4 w-4" />
            高级搜索
          </h3>
          <div className="flex gap-2">
            {onSave && (
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                保存条件
              </Button>
            )}
            <Button variant="outline" size="sm">
              <History className="mr-2 h-4 w-4" />
              历史
            </Button>
          </div>
        </div>

        {/* 激活的筛选条件 */}
        <div className="space-y-2">
          {activeFilters.map((fieldName) => {
            const field = fields.find((f) => f.name === fieldName);
            if (!field) return null;

            return (
              <div key={fieldName} className="flex items-center gap-2">
                <span className="text-sm font-medium w-24">{field.label}:</span>
                {field.type === 'text' && (
                  <Input
                    placeholder={`输入${field.label}`}
                    value={filters[fieldName] || ''}
                    onChange={(e) =>
                      setFilters({ ...filters, [fieldName]: e.target.value })
                    }
                    className="flex-1"
                  />
                )}
                {field.type === 'select' && field.options && (
                  <Select
                    value={filters[fieldName]}
                    onValueChange={(value) =>
                      setFilters({ ...filters, [fieldName]: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={`选择${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(fieldName)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* 添加筛选条件 */}
        <div className="flex items-center gap-2">
          <Select onValueChange={addFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="添加筛选条件" />
            </SelectTrigger>
            <SelectContent>
              {fields
                .filter((f) => !activeFilters.includes(f.name))
                .map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    <Plus className="mr-2 h-4 w-4 inline" />
                    {field.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} className="ml-auto">
            <Search className="mr-2 h-4 w-4" />
            搜索
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilters({});
              setActiveFilters([]);
            }}
          >
            重置
          </Button>
        </div>
      </div>
    </Card>
  );
}
