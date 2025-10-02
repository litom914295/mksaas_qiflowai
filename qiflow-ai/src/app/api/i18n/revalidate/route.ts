import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { locale } = await req.json();
    if (!locale || typeof locale !== 'string') {
      return NextResponse.json({ ok: false, error: 'INVALID_LOCALE' }, { status: 400 });
    }
    revalidateTag(`i18n:${locale}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }
}


