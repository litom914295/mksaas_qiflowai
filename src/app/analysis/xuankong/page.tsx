import { redirect } from 'next/navigation';

export default function Page() {
  // 将未带 locale 的访问引导至简体中文路径（项目使用 zh-CN）
  redirect('/zh-CN/analysis/xuankong');
}
