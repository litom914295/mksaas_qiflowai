import { routing } from '@/i18n/routing';
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to default locale
  redirect(`/${routing.defaultLocale}`);
}
