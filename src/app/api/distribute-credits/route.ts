import { distributeCreditsToAllUsers } from '@/credits/distribute';
import { NextResponse } from 'next/server';

// Authentication middleware - supports both Vercel Cron Secret and Basic Auth
function validateAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return false;
  }

  // Method 1: Vercel Cron Secret (Bearer token)
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && token === cronSecret) {
      return true;
    }
  }

  // Method 2: Basic Auth (for external cron services)
  if (authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8'
    );
    const [username, password] = credentials.split(':');

    const expectedUsername = process.env.CRON_JOBS_USERNAME;
    const expectedPassword = process.env.CRON_JOBS_PASSWORD;

    if (
      expectedUsername &&
      expectedPassword &&
      username === expectedUsername &&
      password === expectedPassword
    ) {
      return true;
    }
  }

  return false;
}

/**
 * distribute credits to all users daily
 * Supports both Vercel Cron (Bearer token) and external cron services (Basic Auth)
 */
export async function GET(request: Request) {
  // Validate authentication (Vercel Cron Secret or Basic Auth)
  if (!validateAuth(request)) {
    console.error('distribute credits unauthorized');
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  console.log('route: distribute credits start');
  const { usersCount, processedCount, errorCount } =
    await distributeCreditsToAllUsers();
  console.log(
    `route: distribute credits end, users: ${usersCount}, processed: ${processedCount}, errors: ${errorCount}`
  );
  return NextResponse.json({
    message: `distribute credits success, users: ${usersCount}, processed: ${processedCount}, errors: ${errorCount}`,
    usersCount,
    processedCount,
    errorCount,
  });
}
