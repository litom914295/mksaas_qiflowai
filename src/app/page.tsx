import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default function Home() {
  // Always redirect root to the default locale to avoid ambiguity
  redirect(`/${routing.defaultLocale}`);
}
