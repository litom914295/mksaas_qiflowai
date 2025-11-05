'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type AvatarCategory,
  type DefaultAvatar,
  avatarCategories,
  defaultAvatars,
} from '@/config/default-avatars';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface DefaultAvatarPickerProps {
  onSelect: (avatar: DefaultAvatar) => void;
  disabled?: boolean;
}

export function DefaultAvatarPicker({
  onSelect,
  disabled,
}: DefaultAvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AvatarCategory>('shengxiao');

  const handleSelect = (avatar: DefaultAvatar) => {
    onSelect(avatar);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="cursor-pointer gap-2"
        >
          <Sparkles className="h-4 w-4" />
          选择玄学头像
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">选择玄学风格头像</DialogTitle>
          <DialogDescription>
            选择一个具有中国传统玄学元素的头像，彰显您的独特气质
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as AvatarCategory)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(avatarCategories).map(([key, info]) => (
              <TabsTrigger key={key} value={key} className="gap-1 text-xs">
                <span>{info.emoji}</span>
                <span className="hidden sm:inline">{info.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(defaultAvatars).map(([category, avatars]) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleSelect(avatar)}
                      className="group relative flex flex-col items-center gap-2 rounded-lg border-2 border-transparent p-3 transition-all hover:border-primary hover:shadow-lg"
                      title={avatar.description}
                    >
                      {/* 头像预览 */}
                      <div
                        className={cn(
                          'flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white shadow-md transition-transform group-hover:scale-110',
                          avatar.color
                        )}
                      >
                        {avatar.symbol}
                      </div>

                      {/* 名称 */}
                      <div className="text-center">
                        <div className="text-sm font-medium">{avatar.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {avatar.description}
                        </div>
                      </div>

                      {/* 悬浮效果 */}
                      <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* 分类说明 */}
              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <CategoryDescription category={category as AvatarCategory} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function CategoryDescription({ category }: { category: AvatarCategory }) {
  const descriptions: Record<AvatarCategory, string> = {
    tiangan:
      '天干共十位：甲乙丙丁戊己庚辛壬癸，代表天之气象，与五行、阴阳相配，是八字命理的重要组成部分。',
    dizhi:
      '地支共十二位：子丑寅卯辰巳午未申酉戌亥，代表地之方位与时辰，与生肖对应，是中国传统历法的基础。',
    bagua:
      '八卦源于《易经》：乾坤震巽坎离艮兑，代表天地雷风水火山泽八种自然现象，蕴含宇宙万物变化之理。',
    wuxing:
      '五行相生相克：金木水火土，是中国古代哲学的核心概念，用以阐释万物的生成变化规律。',
    shengxiao:
      '十二生肖与地支对应：鼠牛虎兔龙蛇马羊猴鸡狗猪，是中国传统纪年方式，每个生肖代表不同的性格特质。',
  };

  return <p>{descriptions[category]}</p>;
}
