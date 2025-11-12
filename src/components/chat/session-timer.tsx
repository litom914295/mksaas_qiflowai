"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type SessionTimerProps = {
  expiresAt: Date;
  onExpire: () => void;
  onRenew: () => void;
  isRenewing?: boolean;
};

export function SessionTimer({
  expiresAt,
  onExpire,
  onRenew,
  isRenewing = false,
}: SessionTimerProps) {
  const { toast } = useToast();
  const [remainingMs, setRemainingMs] = useState(0);
  const [hasNotified5Min, setHasNotified5Min] = useState(false);
  const [hasNotified1Min, setHasNotified1Min] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const expiresMs = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiresMs - now);
      setRemainingMs(remaining);

      // 过期检查
      if (remaining === 0) {
        onExpire();
        return;
      }

      // 5 分钟提醒
      if (
        remaining <= 5 * 60 * 1000 &&
        remaining > 4 * 60 * 1000 &&
        !hasNotified5Min
      ) {
        toast({
          title: "会话即将到期",
          description: "您的会话将在 5 分钟后到期，请及时续费",
        });
        setHasNotified5Min(true);
      }

      // 1 分钟提醒
      if (
        remaining <= 1 * 60 * 1000 &&
        remaining > 59 * 1000 &&
        !hasNotified1Min
      ) {
        toast({
          title: "会话即将到期",
          description: "您的会话将在 1 分钟后到期",
          variant: "destructive",
        });
        setHasNotified1Min(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, hasNotified5Min, hasNotified1Min, onExpire, toast]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  const isWarning = remainingMs <= 5 * 60 * 1000 && remainingMs > 1 * 60 * 1000;
  const isDanger = remainingMs <= 1 * 60 * 1000 && remainingMs > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <Badge
          variant={
            isDanger ? "destructive" : isWarning ? "secondary" : "default"
          }
          className="font-mono"
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </Badge>
      </div>

      {isWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>会话即将到期</span>
            <Button size="sm" onClick={onRenew} disabled={isRenewing}>
              {isRenewing ? "续费中..." : "续费 (40 积分)"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isDanger && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>会话即将到期！</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={onRenew}
              disabled={isRenewing}
            >
              {isRenewing ? "续费中..." : "立即续费"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
