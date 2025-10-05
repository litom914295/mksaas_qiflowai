'use client';

import { useState } from 'react';

export function AgeVerification() {
  const [isVerified, setIsVerified] = useState(false);

  if (isVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">年龄验证</h2>
        <p className="mb-4 text-sm text-gray-600">
          本服务涉及传统文化内容，请确认您已年满18岁。
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsVerified(true)}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            我已年满18岁
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
