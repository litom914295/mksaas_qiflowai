"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Report = {
  id: string;
  userId: string;
  reportType: "basic" | "essential";
  status: "generating" | "completed" | "failed";
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  creditsUsed: number;
  generatedAt: Date | null;
  expiresAt: Date | null;
  purchaseMethod: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

type Props = {
  reports: Report[];
};

const STATUS_CONFIG = {
  generating: {
    label: "生成中",
    icon: Loader2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    badgeVariant: "secondary" as const,
  },
  completed: {
    label: "已完成",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    badgeVariant: "default" as const,
  },
  failed: {
    label: "失败",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    badgeVariant: "destructive" as const,
  },
};

const REPORT_TYPE_LABELS = {
  basic: "基础报告",
  essential: "精华报告",
};

export function MyReportsView({ reports }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 过滤报告
  const filteredReports =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  // 如果没有报告
  if (reports.length === 0) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
            <FileText className="w-12 h-12 text-purple-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">还没有报告</h2>
            <p className="text-muted-foreground">
              购买您的第一份 AI 八字精华报告，开启命理探索之旅
            </p>
          </div>
          <Button
            onClick={() => router.push("/reports/essential/buy")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            购买精华报告
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              我的报告
            </h1>
            <p className="text-muted-foreground mt-2">
              共 {reports.length} 份报告
            </p>
          </div>

          <Button
            onClick={() => router.push("/reports/essential/buy")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            购买新报告
          </Button>
        </div>

        {/* 筛选器 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="generating">生成中</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                显示 {filteredReports.length} 份报告
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 报告列表 */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              没有符合条件的报告
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report, index) => {
              const statusConfig = STATUS_CONFIG[report.status];
              const StatusIcon = statusConfig.icon;
              const input = report.input as {
                birthDate?: string;
                birthHour?: string;
                gender?: string;
                location?: string;
              };

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      report.status === "generating" ? "animate-pulse" : ""
                    }`}
                    onClick={() => {
                      if (report.status === "completed") {
                        router.push(`/reports/${report.id}`);
                      }
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            {REPORT_TYPE_LABELS[report.reportType]}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            ID: {report.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                        <Badge variant={statusConfig.badgeVariant}>
                          <StatusIcon
                            className={`w-3 h-3 mr-1 ${
                              report.status === "generating" ? "animate-spin" : ""
                            }`}
                          />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* 基础信息 */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {input.birthDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {input.birthDate}
                            </span>
                          </div>
                        )}
                        {input.location && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              📍 {input.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 创建时间 */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleString("zh-CN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* 积分消耗 */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          消耗积分
                        </span>
                        <Badge variant="outline" className="font-mono">
                          {report.creditsUsed}
                        </Badge>
                      </div>

                      {/* 操作按钮 */}
                      {report.status === "completed" && (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/reports/${report.id}`);
                          }}
                        >
                          查看报告
                        </Button>
                      )}

                      {report.status === "failed" && (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/reports/essential/buy");
                          }}
                        >
                          重新购买
                        </Button>
                      )}

                      {report.status === "generating" && (
                        <div className="text-xs text-center text-muted-foreground pt-2">
                          预计还需 10-15 秒...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 底部说明 */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">关于报告：</p>
                <ul className="space-y-1">
                  <li>• 已完成的报告可随时查看，终身有效</li>
                  <li>• 报告生成失败的积分已自动退回</li>
                  <li>• 生成中的报告请稍等，刷新页面查看最新状态</li>
                  <li>• 支持导出 PDF 和分享报告链接</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
