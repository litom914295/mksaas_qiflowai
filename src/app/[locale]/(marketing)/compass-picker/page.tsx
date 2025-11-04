import { CompassPicker } from '@/components/compass/compass-picker';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '罗盘定位 - 风水八字分析',
    description: '使用数字罗盘精确测量房屋朝向，获取专业风水分析建议',
  };
}

export default function CompassPickerPage() {
  return <CompassPicker />;
}
