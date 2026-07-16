import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { NextResponse } from "next/server";

/**
 * این API به عنوان یک واسطه عمل می‌کند تا تصاویر را به صورت امن از
 * استوریج خصوصی لیارا دریافت کرده و به مرورگر نمایش دهد.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const key = path.join("/");
  const bucket = process.env.LIARA_BUCKET_NAME;

  if (!key || !bucket) {
    return new NextResponse("Missing file key or bucket name", { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3.send(command);

    if (!response.Body) {
      return new NextResponse("File not found", { status: 404 });
    }

    // تبدیل جریان داده S3 به فرمت قابل ارسال در NextResponse
    // در Next.js جدید، NextResponse می‌تواند مستقیماً ReadableStream را دریافت کند
    return new NextResponse(response.Body as any, {
      headers: {
        "Content-Type": response.ContentType || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable", // کش کردن تصویر در مرورگر
        "Content-Length": response.ContentLength?.toString() || "",
      },
    });
  } catch (error: any) {
    console.error(`[Media Proxy Error] for key ${key}:`, error);
    return new NextResponse("File not found or access denied", { status: 404 });
  }
}
