'use client';

import { XuankongForm, type XuankongFormData as BaseFormData } from '../analysis/xuankong-form';

export interface XuankongFormData {
  facingDirection: number;
  completionYear: number;
  completionMonth: number;
  address?: string;
  city?: string;
}

interface XuankongInputFormProps {
  onSubmit: (data: XuankongFormData) => void;
}

export function XuankongInputForm({ onSubmit }: XuankongInputFormProps) {
  const handleSubmit = (data: BaseFormData) => {
    onSubmit({
      facingDirection: data.facing,
      completionYear: data.buildYear,
      completionMonth: 1, // 默认1月
      address: data.address,
      city: data.city,
    });
  };

  return <XuankongForm onSubmit={handleSubmit} />;
}
