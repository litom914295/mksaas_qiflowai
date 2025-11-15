'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import Container from '@/components/layout/container';
import { CreditsNavBadge } from '@/components/layout/credits-nav-badge';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcher } from '@/components/layout/mode-switcher';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { UserButton } from '@/components/layout/user-button';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { getNavbarLinks } from '@/config/navbar-config';
import { useScroll } from '@/hooks/use-scroll';
import { LocaleLink, useLocalePathname } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { ArrowUpRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LanguageSwitcher } from '../language-switcher';
import { Skeleton } from '../ui/skeleton';

interface NavBarProps {
  scroll?: boolean;
}

const customNavigationMenuTriggerStyle = cn(
  navigationMenuTriggerStyle(),
  'relative bg-transparent text-muted-foreground cursor-pointer',
  'hover:bg-accent hover:text-accent-foreground',
  'focus:bg-accent focus:text-accent-foreground',
  'data-active:font-semibold data-active:bg-transparent data-active:text-accent-foreground',
  'data-[state=open]:bg-transparent data-[state=open]:text-accent-foreground'
);

export function Navbar({ scroll }: NavBarProps) {
  const t = useTranslations();
  const scrolled = useScroll(50);
  const menuLinks = getNavbarLinks();
  const localePathname = useLocalePathname();
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  const searchParams = useSearchParams();
  const abParam = searchParams?.get('ab');
  
  // 防止 hydration 不匹配：确保服务端和客户端初始渲染一致
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const getAbFromClient = () => {
    try {
      const m = document.cookie.match(/(?:^|; )ab_variant=([^;]+)/);
      if (m) return decodeURIComponent(m[1]);
    } catch {}
    try {
      return window.localStorage.getItem('ab_variant');
    } catch {}
    return null;
  };
  const ab = abParam ?? getAbFromClient();
  const variantB = ab === 'B';
  // console.log(`Navbar, user:`, user);

  return (
    <section
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
        variantB && 'shadow-[0_0_0_1px_rgba(255,255,255,.06)]',
        scroll
          ? scrolled
            ? cn(
                'backdrop-blur-md border-b supports-backdrop-filter:bg-muted/50',
                variantB ? 'bg-muted/40' : 'bg-muted/50'
              )
            : 'bg-transparent'
          : cn('border-b', variantB ? 'bg-muted/40' : 'bg-muted/50')
      )}
    >
      <Container className="px-4">
        {/* desktop navbar */}
        <nav className="hidden lg:flex">
          {/* logo */}
          <div className="flex items-center">
            <LocaleLink href="/">
              <Logo />
            </LocaleLink>
          </div>

          {/* menu links */}
          <div className="flex-1 flex items-center justify-center space-x-2">
            <NavigationMenu className="relative">
              <NavigationMenuList className="flex items-center">
                {menuLinks?.map((item, index) =>
                  item.items ? (
                    <NavigationMenuItem key={index} className="relative">
                      <NavigationMenuTrigger
                        data-active={
                          item.items.some((subItem) =>
                            subItem.href
                              ? localePathname.startsWith(subItem.href)
                              : false
                          )
                            ? 'true'
                            : undefined
                        }
                        className={customNavigationMenuTriggerStyle}
                      >
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-4 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.items?.map((subItem, subIndex) => {
                            const isSubItemActive =
                              subItem.href &&
                              localePathname.startsWith(subItem.href);
                            return (
                              <li key={subIndex}>
                                <NavigationMenuLink asChild>
                                  <LocaleLink
                                    href={subItem.href || '#'}
                                    target={
                                      subItem.external ? '_blank' : undefined
                                    }
                                    rel={
                                      subItem.external
                                        ? 'noopener noreferrer'
                                        : undefined
                                    }
                                    className={cn(
                                      'group flex select-none flex-row items-center gap-4 rounded-md',
                                      'p-2 leading-none no-underline outline-hidden transition-colors',
                                      'hover:bg-accent hover:text-accent-foreground',
                                      'focus:bg-accent focus:text-accent-foreground',
                                      isSubItemActive &&
                                        'bg-accent text-accent-foreground'
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'flex size-8 shrink-0 items-center justify-center transition-colors',
                                        'bg-transparent text-muted-foreground',
                                        'group-hover:bg-transparent group-hover:text-accent-foreground',
                                        'group-focus:bg-transparent group-focus:text-accent-foreground',
                                        isSubItemActive &&
                                          'bg-transparent text-accent-foreground'
                                      )}
                                    >
                                      {subItem.icon ? subItem.icon : null}
                                    </div>
                                    <div className="flex-1">
                                      <div
                                        className={cn(
                                          'text-sm font-medium text-muted-foreground',
                                          'group-hover:bg-transparent group-hover:text-accent-foreground',
                                          'group-focus:bg-transparent group-focus:text-accent-foreground',
                                          isSubItemActive &&
                                            'bg-transparent text-accent-foreground'
                                        )}
                                      >
                                        {subItem.title}
                                      </div>
                                      {subItem.description && (
                                        <div
                                          className={cn(
                                            'text-sm text-muted-foreground',
                                            'group-hover:bg-transparent group-hover:text-accent-foreground/80',
                                            'group-focus:bg-transparent group-focus:text-accent-foreground/80',
                                            isSubItemActive &&
                                              'bg-transparent text-accent-foreground/80'
                                          )}
                                        >
                                          {subItem.description}
                                        </div>
                                      )}
                                    </div>
                                    {subItem.external && (
                                      <ArrowUpRightIcon
                                        className={cn(
                                          'size-4 shrink-0 text-muted-foreground',
                                          'group-hover:bg-transparent group-hover:text-accent-foreground',
                                          'group-focus:bg-transparent group-focus:text-accent-foreground',
                                          isSubItemActive &&
                                            'bg-transparent text-accent-foreground'
                                        )}
                                      />
                                    )}
                                  </LocaleLink>
                                </NavigationMenuLink>
                              </li>
                            );
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        asChild
                        active={
                          item.href
                            ? item.href === '/'
                              ? localePathname === '/'
                              : localePathname.startsWith(item.href)
                            : false
                        }
                        className={customNavigationMenuTriggerStyle}
                      >
                        <LocaleLink
                          href={item.href || '#'}
                          target={item.external ? '_blank' : undefined}
                          rel={
                            item.external ? 'noopener noreferrer' : undefined
                          }
                        >
                          {item.title}
                        </LocaleLink>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* navbar right show sign in or user */}
          <div className="flex items-center gap-x-4">
            {!isMounted || isPending ? (
              <Skeleton className="size-8 border rounded-full" />
            ) : currentUser ? (
              <>
                <CreditsNavBadge />
                <UserButton user={currentUser} />
              </>
            ) : (
              <div className="flex items-center gap-x-4">
                <LoginWrapper mode="modal" asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    {t('Common.login')}
                  </Button>
                </LoginWrapper>

                <LocaleLink
                  href={Routes.Register}
                  className={cn(
                    buttonVariants({
                      variant: 'default',
                      size: 'sm',
                    })
                  )}
                >
                  {t('Common.signUp')}
                </LocaleLink>
              </div>
            )}

            <ModeSwitcher />
            <LanguageSwitcher />
          </div>
        </nav>

        {/* mobile navbar */}
        <NavbarMobile className="lg:hidden" />
      </Container>
    </section>
  );
}
