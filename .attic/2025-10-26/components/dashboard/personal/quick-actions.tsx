'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Calendar, Coins, History, Home } from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

interface QuickActionsProps {
  quickActions: QuickAction[];
}

// 图标映射
const iconMap: { [key: string]: any } = {
  Calendar: Calendar,
  Home: Home,
  History: History,
  Coins: Coins,
};

export default function QuickActions({ quickActions }: QuickActionsProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle>快速入口</CardTitle>
        <CardDescription>快速访问您常用的功能</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = iconMap[action.icon] || Calendar;
            return (
              <Link
                key={action.id}
                href={action.href}
                className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="flex flex-col items-start space-y-2">
                  <div className={`rounded-lg p-2 ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
