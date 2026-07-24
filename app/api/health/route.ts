import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  try {
    // Basic connectivity check
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      status: 'operational',
      latency: `${Date.now() - start}ms`
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('[HealthCheck] DB Error:', error.message);
    return NextResponse.json({ ok: false, error: 'Database connection failed' }, { status: 503 });
  }
}
