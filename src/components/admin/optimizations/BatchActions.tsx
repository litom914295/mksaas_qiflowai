/**
 * 批量操作组件
 * 支持批量选择、批量编辑、批量删除、批量导出
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckSquare,
  Download,
  Edit,
  MoreVertical,
  Trash2,
} from 'lucide-react';

export interface BatchAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  danger?: boolean;
  requireConfirm?: boolean;
}

interface BatchActionsProps {
  selectedIds: string[];
  totalCount: number;
  actions: BatchAction[];
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

export function BatchActions({
  selectedIds,
  totalCount,
  actions,
  onSelectAll,
  onClearSelection,
}: BatchActionsProps) {
  const selectedCount = selectedIds.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const handleActionClick = (action: BatchAction) => {
    if (action.requireConfirm) {
      if (confirm(`确定要对 ${selectedCount} 个项目执行此操作吗？`)) {
        action.onClick(selectedIds);
      }
    } else {
      action.onClick(selectedIds);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={() => {
            if (isAllSelected && onClearSelection) {
              onClearSelection();
            } else if (onSelectAll) {
              onSelectAll();
            }
          }}
        />
        <Badge variant="secondary">已选择 {selectedCount} 项</Badge>
        {selectedCount < totalCount && onSelectAll && (
          <Button variant="link" size="sm" onClick={onSelectAll}>
            全选 {totalCount} 项
          </Button>
        )}
        {onClearSelection && (
          <Button variant="link" size="sm" onClick={onClearSelection}>
            清除选择
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* 快捷操作按钮 */}
        {actions.slice(0, 3).map((action, index) => (
          <Button
            key={index}
            variant={action.danger ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleActionClick(action)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}

        {/* 更多操作 */}
        {actions.length > 3 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.slice(3).map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleActionClick(action)}
                  className={action.danger ? 'text-destructive' : ''}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// 使用示例
export function BatchActionsExample() {
  return (
    <BatchActions
      selectedIds={['1', '2', '3']}
      totalCount={100}
      actions={[
        {
          label: '批量编辑',
          icon: <Edit className="mr-2 h-4 w-4" />,
          onClick: (ids) => console.log('编辑', ids),
        },
        {
          label: '批量导出',
          icon: <Download className="mr-2 h-4 w-4" />,
          onClick: (ids) => console.log('导出', ids),
        },
        {
          label: '批量删除',
          icon: <Trash2 className="mr-2 h-4 w-4" />,
          onClick: (ids) => console.log('删除', ids),
          danger: true,
          requireConfirm: true,
        },
      ]}
      onSelectAll={() => console.log('全选')}
      onClearSelection={() => console.log('清除')}
    />
  );
}
