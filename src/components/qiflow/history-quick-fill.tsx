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
import { ChevronRight, Clock, History, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PersonalInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female' | '';
  birthCity: string;
  calendarType: 'solar' | 'lunar';
}

interface HouseInfo {
  direction: string;
  roomCount: string;
  layoutImage: string | null;
  standardLayout: string;
}

interface FormData {
  personal: PersonalInfo;
  house: HouseInfo;
}

interface HistoryRecord extends FormData {
  timestamp: number;
}

interface HistoryQuickFillProps {
  /** 快速填充回调 */
  onQuickFill: (data: FormData) => void;
  /** 最大显示历史记录数 */
  maxRecords?: number;
}

/**
 * 历史数据快速填充组件
 * 显示用户最近的填写记录，支持一键回填
 */
export function HistoryQuickFill({
  onQuickFill,
  maxRecords = 3,
}: HistoryQuickFillProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // 加载历史记录
  useEffect(() => {
    try {
      const stored = localStorage.getItem('formHistory');
      console.log('[历史记录] 读取 localStorage:', stored);
      if (stored) {
        const records: HistoryRecord[] = JSON.parse(stored);
        console.log('[历史记录] 解析后的数据:', records);
        console.log('[历史记录] 记录数量:', records.length);
        setHistory(records.slice(0, maxRecords));
      } else {
        console.log('[历史记录] localStorage 中没有数据');
      }
    } catch (error) {
      console.error('[历史记录] 加载失败:', error);
    }
  }, [maxRecords]);

  // 删除历史记录
  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('formHistory', JSON.stringify(newHistory));
  };

  // 选择历史记录
  const handleSelect = (record: HistoryRecord) => {
    onQuickFill({
      personal: record.personal,
      house: record.house,
    });
    setShowHistory(false);
  };

  // 手动测试保存
  const handleTestSave = () => {
    try {
      const testData = {
        personal: {
          name: '测试用户',
          birthDate: '2000-01-01',
          birthTime: '12:00',
          gender: 'female',
          birthCity: '北京',
          calendarType: 'solar',
        },
        house: {
          direction: '180',
          roomCount: '3',
          layoutImage: null,
          standardLayout: 'type1',
        },
        timestamp: Date.now(),
      };

      const existing = localStorage.getItem('formHistory');
      const history = existing ? JSON.parse(existing) : [];
      history.unshift(testData);

      const savedData = JSON.stringify(history.slice(0, 5));
      localStorage.setItem('formHistory', savedData);

      alert('✅ 测试数据已保存！请刷新页面查看效果。');

      // 刷新组件状态
      window.location.reload();
    } catch (error) {
      alert(`❌ 保存失败: ${error}`);
      console.error('测试保存失败:', error);
    }
  };

  // 调试功能：显示 localStorage 原始数据
  const handleDebug = () => {
    try {
      const raw = localStorage.getItem('formHistory');

      // 测试 localStorage 是否可用
      let localStorageWorks = false;
      try {
        localStorage.setItem('test', 'test');
        localStorageWorks = localStorage.getItem('test') === 'test';
        localStorage.removeItem('test');
      } catch (e) {
        localStorageWorks = false;
      }

      const info = `
=== localStorage 调试信息 ===

1. localStorage 功能: ${localStorageWorks ? '✅ 正常' : '❌ 被禁用'}
2. formHistory 存在: ${raw ? '✅ 是' : '❌ 否'}
3. formHistory 长度: ${raw ? raw.length : 0} 字符
4. 当前加载记录数: ${history.length}
5. 当前 URL: ${window.location.href}
6. 原始 JSON 数据:
${raw || '（空）'}

提示：
- 如果 localStorage 被禁用，请检查浏览器设置
- 如果数据为空，请先提交一次表单
- localStorage 按域名+端口隔离，注意 URL
      `.trim();

      setDebugInfo(info);
      alert(info);
      console.log(info);

      // 额外输出更详细的信息
      console.log('='.repeat(50));
      console.log('🔍 localStorage 调试详情:');
      console.log('localStorage 可用:', localStorageWorks);
      console.log('formHistory 存在:', !!raw);
      console.log('原始数据:', raw);
      console.log('当前加载的 history:', history);
      console.log('='.repeat(50));
    } catch (error) {
      const errorMsg = `调试错误: ${error}`;
      setDebugInfo(errorMsg);
      alert(errorMsg);
      console.error(errorMsg, error);
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 如果没有历史记录，显示禁用状态的按钮
  if (history.length === 0) {
    return (
      <Card className="shadow-lg border-2 border-gray-100 bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Button
              disabled
              className="w-full h-12 bg-gray-200 text-gray-500 cursor-not-allowed"
            >
              <History className="w-5 h-5 mr-2" />
              暂无历史记录
            </Button>
            <p className="text-xs text-gray-500 text-center">
              提交一次表单后，即可快速回填历史数据
            </p>
            <Button
              onClick={handleDebug}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              🔍 调试：查看 localStorage
            </Button>
            <Button
              onClick={handleTestSave}
              variant="outline"
              size="sm"
              className="w-full text-xs bg-green-50 hover:bg-green-100"
            >
              🧪 测试：保存一条测试数据
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* 快速填充按钮 */}
      {!showHistory && (
        <Card className="shadow-lg border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="pt-6">
            <Button
              onClick={() => setShowHistory(true)}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-medium"
            >
              <History className="w-5 h-5 mr-2" />
              快速填充历史数据
              <Badge className="ml-2 bg-white text-orange-600">
                {history.length}
              </Badge>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 历史记录列表 */}
      {showHistory && (
        <Card className="shadow-lg border-2 border-orange-200 animate-in slide-in-from-top">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-orange-600" />
                <CardTitle>历史填写记录</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <CardDescription>点击任意记录快速填充表单</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {history.map((record, index) => (
                <div
                  key={index}
                  onClick={() => handleSelect(record)}
                  className="relative group p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer"
                >
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDelete(index, e)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                    title="删除此记录"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {record.personal.name || '未命名'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {record.personal.gender === 'male'
                          ? '男'
                          : record.personal.gender === 'female'
                            ? '女'
                            : ''}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {record.personal.birthDate || '未填写日期'}{' '}
                        {record.personal.birthTime || ''}
                      </span>
                    </div>
                    {record.personal.birthCity && (
                      <div className="text-xs text-gray-500">
                        出生城市：{record.personal.birthCity}
                      </div>
                    )}
                    {(record.house.direction || record.house.roomCount) && (
                      <div className="text-xs text-purple-600 mt-2">
                        ✓ 包含房屋风水信息
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {formatTime(record.timestamp)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <Button
                variant="outline"
                onClick={() => setShowHistory(false)}
                className="w-full"
              >
                取消，手动填写
              </Button>
              <Button
                onClick={handleDebug}
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500"
              >
                🔍 调试：查看 localStorage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
