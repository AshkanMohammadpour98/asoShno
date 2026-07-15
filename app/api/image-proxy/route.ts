import { NextRequest, NextResponse } from 'next/server';
import { getSignedImageUrl } from '@/lib/upload-image';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.redirect(new URL('/logo/logo.png', request.url));
  }

  try {
    const signedUrl = await getSignedImageUrl(key);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error('Image Proxy Error:', error);
    return NextResponse.redirect(new URL('/logo/logo.png', request.url));
  }
}
