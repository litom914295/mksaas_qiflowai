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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Edit2, Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CreditRule {
  id: string;
  ruleKey: string;
  ruleName: string;
  ruleType: 'consumption' | 'reward';
  category: string;
  creditAmount: number;
  enabled: boolean;
  dailyLimit?: number;
  description?: string;
}

export default function CreditConfigPage() {
  const [rules, setRules] = useState<CreditRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<CreditRule | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const res = await fetch('/api/admin/credits/rules');
      const data = await res.json();
      setRules(data.rules || []);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(rule: Partial<CreditRule>) {
    try {
      const isNew = !rule.id;
      const res = await fetch('/api/admin/credits/rules', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });

      if (!res.ok) throw new Error('保存失败');

      toast.success(isNew ? '创建成功' : '更新成功');
      fetchRules();
      setEditingRule(null);
    } catch (error) {
      toast.error('操作失败');
    }
  }

  const qiflowRules = rules.filter((r) => r.category === 'qiflow');
  const engagementRules = rules.filter((r) => r.category === 'engagement');
  const referralRules = rules.filter((r) => r.category === 'referral');

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">积分规则配置</h1>
          <p className="text-sm text-gray-600">管理系统积分消费和奖励规则</p>
        </div>
        <Button onClick={() => setEditingRule({} as CreditRule)}>
          <Plus className="mr-2 h-4 w-4" />
          添加规则
        </Button>
      </div>

      <Tabs defaultValue="qiflow">
        <TabsList>
          <TabsTrigger value="qiflow">
            QiFlow服务 ({qiflowRules.length})
          </TabsTrigger>
          <TabsTrigger value="engagement">
            用户互动 ({engagementRules.length})
          </TabsTrigger>
          <TabsTrigger value="referral">
            推荐奖励 ({referralRules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qiflow">
          <RulesList
            rules={qiflowRules}
            onEdit={setEditingRule}
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="engagement">
          <RulesList
            rules={engagementRules}
            onEdit={setEditingRule}
            onSave={handleSave}
          />
        </TabsContent>

        <TabsContent value="referral">
          <RulesList
            rules={referralRules}
            onEdit={setEditingRule}
            onSave={handleSave}
          />
        </TabsContent>
      </Tabs>

      {editingRule && (
        <RuleEditDialog
          rule={editingRule}
          onClose={() => setEditingRule(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function RulesList({
  rules,
  onEdit,
  onSave,
}: {
  rules: CreditRule[];
  onEdit: (rule: CreditRule) => void;
  onSave: (rule: Partial<CreditRule>) => void;
}) {
  return (
    <div className="grid gap-4">
      {rules.map((rule) => (
        <Card key={rule.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
              <Coins
                className={`h-5 w-5 ${rule.ruleType === 'consumption' ? 'text-red-500' : 'text-green-500'}`}
              />
              <div>
                <CardTitle className="text-base">{rule.ruleName}</CardTitle>
                <CardDescription className="text-xs">
                  {rule.ruleKey}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                {rule.enabled ? '启用' : '禁用'}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => onEdit(rule)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600">积分: </span>
                <span
                  className={`font-medium ${rule.creditAmount < 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {rule.creditAmount > 0 ? '+' : ''}
                  {rule.creditAmount}
                </span>
              </div>
              {rule.dailyLimit && (
                <div>
                  <span className="text-gray-600">每日限制: </span>
                  <span className="font-medium">{rule.dailyLimit}次</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) =>
                    onSave({ id: rule.id, enabled })
                  }
                />
              </div>
            </div>
            {rule.description && (
              <p className="mt-2 text-xs text-gray-500">{rule.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
      {rules.length === 0 && (
        <div className="py-12 text-center text-gray-500">暂无规则</div>
      )}
    </div>
  );
}

function RuleEditDialog({
  rule,
  onClose,
  onSave,
}: {
  rule: CreditRule;
  onClose: () => void;
  onSave: (rule: Partial<CreditRule>) => void;
}) {
  const [formData, setFormData] = useState(rule);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{rule.id ? '编辑规则' : '创建规则'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>规则标识</Label>
            <Input
              value={formData.ruleKey || ''}
              onChange={(e) =>
                setFormData({ ...formData, ruleKey: e.target.value })
              }
              disabled={!!rule.id}
            />
          </div>
          <div>
            <Label>规则名称</Label>
            <Input
              value={formData.ruleName || ''}
              onChange={(e) =>
                setFormData({ ...formData, ruleName: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>类型</Label>
              <select
                className="w-full rounded-md border p-2"
                value={formData.ruleType || 'reward'}
                onChange={(e) =>
                  setFormData({ ...formData, ruleType: e.target.value as any })
                }
              >
                <option value="consumption">消费</option>
                <option value="reward">奖励</option>
              </select>
            </div>
            <div>
              <Label>分类</Label>
              <select
                className="w-full rounded-md border p-2"
                value={formData.category || 'qiflow'}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="qiflow">QiFlow服务</option>
                <option value="engagement">用户互动</option>
                <option value="referral">推荐奖励</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>积分数量</Label>
              <Input
                type="number"
                value={formData.creditAmount || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    creditAmount: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>每日限制</Label>
              <Input
                type="number"
                value={formData.dailyLimit || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dailyLimit: Number.parseInt(e.target.value) || undefined,
                  })
                }
                placeholder="不限制"
              />
            </div>
          </div>
          <div>
            <Label>描述</Label>
            <Input
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={() => onSave(formData)}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
