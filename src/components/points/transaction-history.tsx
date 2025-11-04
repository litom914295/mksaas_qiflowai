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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Coins,
  Download,
  Filter,
  Gift,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  category:
    | 'analysis'
    | 'recharge'
    | 'gift'
    | 'referral'
    | 'signin'
    | 'mission';
  amount: number;
  balance: number;
  description: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
};

// 模拟交易数据
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    category: 'analysis',
    amount: 30,
    balance: 970,
    description: '八字深度解析',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'success',
  },
  {
    id: '2',
    type: 'income',
    category: 'recharge',
    amount: 500,
    balance: 1000,
    description: '积分充值',
    timestamp: new Date('2024-01-14T15:20:00'),
    status: 'success',
  },
  {
    id: '3',
    type: 'income',
    category: 'signin',
    amount: 5,
    balance: 500,
    description: '每日签到奖励',
    timestamp: new Date('2024-01-14T09:00:00'),
    status: 'success',
  },
  {
    id: '4',
    type: 'income',
    category: 'referral',
    amount: 50,
    balance: 495,
    description: '邀请好友奖励',
    timestamp: new Date('2024-01-13T18:45:00'),
    status: 'success',
  },
  {
    id: '5',
    type: 'expense',
    category: 'analysis',
    amount: 10,
    balance: 445,
    description: 'AI智能对话',
    timestamp: new Date('2024-01-13T14:20:00'),
    status: 'success',
  },
];

export default function TransactionHistory() {
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 过滤交易记录
  const filteredTransactions = transactions.filter((tx) => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (selectedCategory !== 'all' && tx.category !== selectedCategory)
      return false;
    if (
      searchTerm &&
      !tx.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // 获取分类图标和颜色
  const getCategoryIcon = (category: Transaction['category']) => {
    switch (category) {
      case 'analysis':
        return <Activity className="h-4 w-4" />;
      case 'recharge':
        return <Coins className="h-4 w-4" />;
      case 'gift':
        return <Gift className="h-4 w-4" />;
      case 'referral':
        return <ShoppingBag className="h-4 w-4" />;
      case 'signin':
        return <Calendar className="h-4 w-4" />;
      case 'mission':
        return <Gift className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: Transaction['category']) => {
    const labels = {
      analysis: '分析消费',
      recharge: '充值',
      gift: '赠送',
      referral: '推荐奖励',
      signin: '签到',
      mission: '任务奖励',
    };
    return labels[category] || '其他';
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">交易记录</CardTitle>
            <CardDescription>查看您的积分收支明细</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            导出明细
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 筛选工具栏 */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索交易记录..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="分类筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="analysis">分析消费</SelectItem>
              <SelectItem value="recharge">充值</SelectItem>
              <SelectItem value="signin">签到</SelectItem>
              <SelectItem value="referral">推荐奖励</SelectItem>
              <SelectItem value="mission">任务奖励</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-lg border">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-r-none"
            >
              全部
            </Button>
            <Button
              variant={filter === 'income' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('income')}
              className="rounded-none border-x"
            >
              收入
            </Button>
            <Button
              variant={filter === 'expense' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('expense')}
              className="rounded-l-none"
            >
              支出
            </Button>
          </div>
        </div>

        {/* 交易列表 */}
        <ScrollArea className="h-[400px]">
          <AnimatePresence>
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer border-b p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        tx.type === 'income'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-500'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-500'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tx.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryIcon(tx.category)}
                          <span className="ml-1">
                            {getCategoryLabel(tx.category)}
                          </span>
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {format(tx.timestamp, 'yyyy年MM月dd日 HH:mm', {
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {tx.amount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      余额: {tx.balance}
                    </p>
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        {/* 底部提示 */}
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            共 {filteredTransactions.length} 条记录
          </p>
          <Button variant="link" size="sm">
            查看更早记录
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
