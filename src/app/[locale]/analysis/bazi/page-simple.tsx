'use client';

import { calculateBaziAction } from '@/actions/qiflow/calculate-bazi';
import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';

function SimpleBaziForm() {
  const [state, formAction] = useActionState(
    async (_prev: any, formData: FormData) => {
      console.log('表单提交数据:', {
        name: formData.get('name'),
        birth: formData.get('birth'),
        gender: formData.get('gender'),
      });
      return await calculateBaziAction(formData);
    },
    null
  );

  const t = useTranslations('QiFlow');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('male');

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">八字分析</h1>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">姓名</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">出生日期时间</label>
          <input
            type="datetime-local"
            name="birth"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">性别</label>
          <select
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          开始分析
        </button>
      </form>

      {state && (
        <div className="mt-6 p-4 border rounded-md">
          <h3 className="font-semibold mb-2">分析结果:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return <SimpleBaziForm />;
}
