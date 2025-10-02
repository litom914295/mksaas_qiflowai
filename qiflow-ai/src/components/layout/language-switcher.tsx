"use client";

import { usePathname, useRouter } from "@/lib/i18n/routing";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localeFlags, localeNames, locales } from "@/lib/i18n/config";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (newLocale: string) => {
    startTransition(() => {
      // Get path without locale (only remove the starting language segment)
      const pathWithoutLocale = pathname.replace(/^\/(?:[a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/, '') || '/';
      // Use next-intl routing method for language switching
      router.replace(pathWithoutLocale, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleSelect(loc)}
            disabled={locale === loc}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
