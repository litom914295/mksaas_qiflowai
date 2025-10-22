import { randomUUID } from 'crypto';
import { getDb } from '@/db';
import { sql } from 'drizzle-orm';

export type VoucherAction = 'bazi' | 'fengshui' | 'ai_chat' | 'pdf_export';

export type IssueVoucherInput = {
  userId: string;
  action: VoucherAction;
  units: number; // 一次性券=1；对话券=轮数
  voucherCode: string; // bazi_ticket_1 / ai_chat_rounds_5 / ai_chat_rounds_100 等
  reason: string; // daily_signin / streak_7 / streak_30 / streak_90 / referral ...
  expireAt?: Date | null; // 不传=不过期
  giftable?: boolean; // 是否可礼赠（默认false）
  metadata?: Record<string, unknown>;
};

export async function issueVoucher(input: IssueVoucherInput) {
  const db = await getDb();
  const meta = {
    giftable: !!input.giftable,
    ...(input.metadata || {}),
  } as Record<string, unknown>;

  await db.execute(sql`
    INSERT INTO user_vouchers
      (id, user_id, action, units_total, units_used, voucher_code, issued_reason, expire_at, metadata, created_at, updated_at)
    VALUES
      (${randomUUID()}, ${input.userId}, ${input.action}, ${input.units}, 0, ${input.voucherCode}, ${input.reason}, ${input.expireAt ?? null}, ${JSON.stringify(meta)}, NOW(), NOW())
  `);
}

export async function getUserVouchers(userId: string) {
  const db = await getDb();
  const result = (await db.execute(sql`
    SELECT id, user_id, action, units_total, units_used, voucher_code, issued_reason, expire_at, metadata, created_at, updated_at
    FROM user_vouchers
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `)) as any[];
  const rows = result || [];
  return rows.map((r: any) => ({
    id: r.id,
    action: r.action as VoucherAction,
    voucherCode: r.voucher_code as string,
    name: mapVoucherName(r.voucher_code as string),
    unitsTotal: Number(r.units_total) || 0,
    unitsUsed: Number(r.units_used) || 0,
    unitsRemain: Math.max(
      0,
      (Number(r.units_total) || 0) - (Number(r.units_used) || 0)
    ),
    expireAt: r.expire_at ? new Date(r.expire_at) : null,
    giftable:
      !!(
        r.metadata &&
        (r.metadata.giftable === true || r.metadata.giftable === 'true')
      ) || isVoucherGiftableByCode(r.voucher_code as string),
    metadata: r.metadata || {},
    createdAt: r.created_at ? new Date(r.created_at) : null,
  }));
}

export async function redeemVoucherUnits(
  userId: string,
  action: VoucherAction,
  needUnits: number
) {
  if (needUnits <= 0) return { used: 0 };
  const db = await getDb();

  // 取可用券：未过期、未用尽，按expire_at/created_at排序，FIFO
  const result = (await db.execute(sql`
    SELECT id, units_total, units_used
    FROM user_vouchers
    WHERE user_id = ${userId}
      AND action = ${action}
      AND (expire_at IS NULL OR expire_at > NOW())
      AND (units_total - units_used) > 0
    ORDER BY expire_at NULLS LAST, created_at ASC
    FOR UPDATE
  `)) as any[];

  let remain = needUnits;
  for (const row of result || []) {
    if (remain <= 0) break;
    const total = Number(row.units_total) || 0;
    const used = Number(row.units_used) || 0;
    const canUse = Math.max(0, total - used);
    if (canUse <= 0) continue;
    const useNow = Math.min(canUse, remain);
    await db.execute(sql`
      UPDATE user_vouchers
      SET units_used = units_used + ${useNow}, updated_at = NOW()
      WHERE id = ${row.id}
    `);
    remain -= useNow;
  }
  return { used: needUnits - remain };
}

export async function prepareGift(userId: string, voucherId: string) {
  const db = await getDb();
  // 生成礼赠token
  const token = randomUUID();
  const res = await db.execute(sql`
    UPDATE user_vouchers
    SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{giftToken}', ${JSON.stringify(token)}::jsonb, true),
        updated_at = NOW()
    WHERE id = ${voucherId}
      AND user_id = ${userId}
      AND (metadata->>'giftable')::boolean = true
      AND (units_total - units_used) > 0
    RETURNING id
  `);
  if (!res || (res as any[]).length === 0) {
    throw new Error('VOUCHER_NOT_GIFTABLE_OR_NOT_FOUND');
  }
  return { token };
}

export async function claimGift(recipientUserId: string, token: string) {
  const db = await getDb();
  const res = (await db.execute(sql`
    SELECT id, user_id, units_total, units_used
    FROM user_vouchers
    WHERE metadata->>'giftToken' = ${token}
      AND (units_total - units_used) > 0
    LIMIT 1
  `)) as any[];
  if (!res || res.length === 0) throw new Error('GIFT_TOKEN_INVALID');
  const v = res[0];
  if (v.user_id === recipientUserId) throw new Error('GIFT_SAME_OWNER');

  // 转移所有剩余单位的券
  await db.execute(sql`
    UPDATE user_vouchers
    SET user_id = ${recipientUserId},
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{giftStatus}', '"claimed"'::jsonb, true),
        updated_at = NOW()
    WHERE id = ${v.id}
  `);
}

function isVoucherGiftableByCode(code: string) {
  // 灰度：仅小对话券可礼赠
  return code === 'ai_chat_rounds_5';
}

export function mapVoucherName(code: string) {
  switch (code) {
    case 'ai_chat_rounds_5':
      return '问道卡·小（5轮）';
    case 'ai_chat_rounds_100':
      return '问道卡·月（100轮）';
    case 'bazi_ticket_1':
      return '命理开悟券（1次）';
    case 'fengshui_ticket_1':
      return '安宅点金券（1次）';
    case 'pdf_export_3':
      return '锦囊导出券（3次）';
    default:
      return code;
  }
}
