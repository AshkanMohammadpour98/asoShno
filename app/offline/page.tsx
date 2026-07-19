import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-6xl mb-6">📶</div>
      <h1 className="text-2xl font-bold mb-2">شما آفلاین هستید</h1>
      <p className="text-muted-foreground mb-8">
        برای مشاهده این صفحه نیاز به اتصال اینترنت دارید. لطفاً اتصال خود را بررسی کنید.
      </p>
      <Link
        href="/"
        className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
      >
        تلاش مجدد
      </Link>
    </div>
  );
}
