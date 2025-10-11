'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Voucher = {
  id: string;
  action: 'bazi' | 'fengshui' | 'ai_chat' | 'pdf_export';
  voucherCode: string;
  name: string;
  unitsTotal: number;
  unitsUsed: number;
  unitsRemain: number;
  expireAt: string | null;
  giftable: boolean;
};

export function VouchersList() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vouchers/list', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success) setVouchers(data.data || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onGift = async (id: string) => {
    try {
      const res = await fetch('/api/vouchers/prepare-gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ voucherId: id }) });
      const data = await res.json();
      if (data?.success) {
        const url = data.data?.sharePath || '';
        await navigator.clipboard.writeText(window.location.origin + url);
        toast.success('礼赠链接已复制，快去送给朋友吧');
      } else {
        toast.error(data?.error || '礼赠失败');
      }
    } catch (e) {
      toast.error('礼赠失败');
    }
  };

  if (loading) return <div className="text-sm text-muted-foreground">加载礼券中...</div>;
  if (!vouchers.length) return <div className="text-sm text-muted-foreground">暂无礼券</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {vouchers.map(v => (
        <Card key={v.id} className="">
          <CardHeader>
            <CardTitle className="text-base">{v.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm">
            <div>
              <div>用途：{v.action}</div>
              <div>剩余：{v.unitsRemain} / {v.unitsTotal}</div>
              <div>有效期：{v.expireAt ? new Date(v.expireAt).toLocaleDateString() : '长期有效'}</div>
            </div>
            <div className="flex items-center gap-2">
              {v.giftable ? (
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => onGift(v.id)}>送给朋友</Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}