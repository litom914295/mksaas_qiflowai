'use client';

import { useCallback } from 'react';
import FengShuiCompass from './feng-shui-compass';

const MOUNTAIN_NAMES: readonly string[] = [
  '子',
  '癸',
  '丑',
  '艮',
  '寅',
  '甲',
  '卯',
  '乙',
  '辰',
  '巽',
  '巳',
  '丙',
  '午',
  '丁',
  '未',
  '坤',
  '申',
  '庚',
  '酉',
  '辛',
  '戌',
  '乾',
  '亥',
  '壬',
];

const CARDINAL_NAMES: readonly string[] = [
  '正北',
  '东北',
  '正东',
  '东南',
  '正南',
  '西南',
  '正西',
  '西北',
];

interface ChatContextEventDetail {
  sessionId: string;
  userId: string;
  updates: {
    fengshui?: {
      degrees: number;
      mountain: string;
      facing: string;
      cardinal: string;
      updatedAt: string;
    };
    bazi?: Record<string, string | number>;
  };
}

interface CompassWithChatContextProps
  extends React.ComponentProps<typeof FengShuiCompass> {
  sessionId: string;
  userId: string;
  onContextUpdate?: (
    context: ChatContextEventDetail['updates']['fengshui']
  ) => void;
}

const normalizeAngle = (angle: number): number => {
  const value = angle % 360;
  return value < 0 ? value + 360 : value;
};

const getMountainName = (angle: number): string => {
  const index = Math.round(normalizeAngle(angle) / 15) % MOUNTAIN_NAMES.length;
  return MOUNTAIN_NAMES[index];
};

const getFacingName = (angle: number): string => {
  const index = Math.round(normalizeAngle(angle) / 15) % MOUNTAIN_NAMES.length;
  return MOUNTAIN_NAMES[(index + 12) % MOUNTAIN_NAMES.length];
};

const getCardinalDirection = (angle: number): string => {
  const normalized = normalizeAngle(angle);
  const index =
    Math.floor(((normalized + 22.5) % 360) / 45) % CARDINAL_NAMES.length;
  return CARDINAL_NAMES[index];
};

export const CompassWithChatContext = ({
  sessionId,
  userId,
  onContextUpdate,
  onDirectionChange,
  ...rest
}: CompassWithChatContextProps) => {
  const emitContextUpdate = useCallback(
    (degrees: number) => {
      const normalized = normalizeAngle(degrees);
      const context = {
        degrees: normalized,
        mountain: getMountainName(normalized),
        facing: getFacingName(normalized),
        cardinal: getCardinalDirection(normalized),
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        const detail: ChatContextEventDetail = {
          sessionId,
          userId,
          updates: {
            fengshui: context,
          },
        };
        window.dispatchEvent(
          new CustomEvent<ChatContextEventDetail>('qiflow-chat-context', {
            detail,
          })
        );
      }

      if (onContextUpdate) {
        onContextUpdate(context);
      }
    },
    [onContextUpdate, sessionId, userId]
  );

  const handleDirectionChange = useCallback(
    (degrees: number) => {
      emitContextUpdate(degrees);
      if (onDirectionChange) {
        onDirectionChange(degrees);
      }
    },
    [emitContextUpdate, onDirectionChange]
  );

  return (
    <FengShuiCompass {...rest} onDirectionChange={handleDirectionChange} />
  );
};
