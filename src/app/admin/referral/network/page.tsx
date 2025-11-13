import { ReferralNetworkGraph } from '@/components/admin/referral/ReferralNetworkGraph';

export default function ReferralNetworkPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">推荐关系网络</h1>
        <p className="text-sm text-gray-600">可视化展示用户推荐关系图谱</p>
      </div>

      <ReferralNetworkGraph />
    </div>
  );
}
