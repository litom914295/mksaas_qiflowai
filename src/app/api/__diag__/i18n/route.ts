import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Check message files existence
  const exists: Record<string, boolean> = {};
  for (const loc of routing.locales) {
    try {
      await import(`../../../../messages/${loc}.json`);
      exists[loc] = true;
    } catch {
      exists[loc] = false;
    }
  }

  return NextResponse.json({
    routing: {
      locales: routing.locales,
      defaultLocale: routing.defaultLocale,
    },
    messages: exists,
  });
}