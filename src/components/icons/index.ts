import type { ComponentType, SVGProps } from 'react';
import { AlertCircle, Loader2, Mail } from 'lucide-react';

import { NextjsIcon } from './nextjs';
import { ProductHuntIcon } from './product-hunt';
import { ResendIcon } from './resend';
import { ShadcnuiIcon } from './shadcnui';
import { StripeIcon } from './stripe';
import { TailwindcssIcon } from './tailwindcss';
import { TwitterIcon } from './twitter';
import { VercelIcon } from './vercel';
import { GoogleIcon } from './google';
import { GithubIcon } from './github';
import { FacebookIcon } from './facebook';
import { LinkedinIcon } from './linkedin';
import { InstagramIcon } from './instagram';
import { YoutubeIcon } from './youtube';
import { TelegramIcon } from './telegram';
import { TiktokIcon } from './tiktok';
import { BlueskyIcon } from './bluesky';
import { MastodonIcon } from './mastodon';
import { XIcon } from './x';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const Icons: Record<string, IconComponent> = {
  // Lucide icons (commonly used in UI)
  mail: Mail,
  alertCircle: AlertCircle,
  spinner: Loader2,

  // Brand/Logo icons
  nextjs: NextjsIcon,
  productHunt: ProductHuntIcon,
  resend: ResendIcon,
  shadcnui: ShadcnuiIcon,
  stripe: StripeIcon,
  tailwindcss: TailwindcssIcon,
  twitter: TwitterIcon,
  vercel: VercelIcon,
  google: GoogleIcon,
  github: GithubIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  telegram: TelegramIcon,
  tiktok: TiktokIcon,
  bluesky: BlueskyIcon,
  mastodon: MastodonIcon,
  x: XIcon,
};

export type { SVGProps } from 'react';
