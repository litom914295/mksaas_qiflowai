import type { ComponentType, SVGProps } from 'react';
import { AlertCircle, Loader2, Mail, Github, Linkedin, Youtube, Twitter } from 'lucide-react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const Icons: Record<string, IconComponent> = {
  // Lucide icons (commonly used in UI)
  mail: Mail,
  alertCircle: AlertCircle,
  spinner: Loader2,

  // Common brands (fallback to lucide icons)
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: Twitter,

  // Fallbacks for previously present keys (map to generic icons to avoid runtime break)
  vercel: AlertCircle,
  nextjs: AlertCircle,
  tailwindcss: AlertCircle,
  stripe: AlertCircle,
  resend: AlertCircle,
  google: AlertCircle,
  productHunt: AlertCircle,
  instagram: AlertCircle,
  telegram: AlertCircle,
  tiktok: AlertCircle,
  bluesky: AlertCircle,
  mastodon: AlertCircle,
  x: Twitter,
};

export type { SVGProps } from 'react';
