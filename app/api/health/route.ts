import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  try {
    // Ultra-lightweight query to check DB connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      services: {
        backend: true,
        database: true
      },
      latency: `${Date.now() - start}ms`
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('[HealthCheck] Database error:', error.message);

    return NextResponse.json({
      ok: false,
      services: {
        backend: true,
        database: false
      }
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
}
