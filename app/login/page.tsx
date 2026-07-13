import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authenticate } from '@/lib/actions/auth-actions';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="relative min-h-screen flex items-center justify-center py-20 px-4 bg-secondary">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in text-right">
        <div className="bg-card border border-border rounded-[3rem] p-10 lg:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-foreground mb-3">خوش آمدید</h1>
            <p className="text-muted-foreground text-sm font-medium">به حساب کاربری خود وارد شوید</p>
          </div>

          <form action={dispatch} className="space-y-8">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-3 mr-4">شماره همراه</label>
              <input
                type="tel"
                name="phone"
                placeholder="09123456789"
                className="w-full h-16 bg-muted border-2 border-transparent focus:border-primary focus:bg-card rounded-[1.5rem] px-8 text-sm font-black text-foreground transition-all outline-none text-left dir-ltr"
                required
                disabled={isPending}
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-3 mr-4">رمز عبور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full h-16 bg-muted border-2 border-transparent focus:border-primary focus:bg-card rounded-[1.5rem] px-8 pl-16 text-sm font-black text-foreground transition-all outline-none"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                   {showPassword ? "👀" : "👁️"}
                </button>
              </div>
            </div>

            {errorMessage && <p className="text-xs font-black text-red-500 text-center animate-shake bg-red-500/10 p-3 rounded-xl">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-18 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'در حال ورود...' : 'ورود به حساب'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-border text-center space-y-4">
            <p className="text-sm font-bold text-muted-foreground">حساب کاربری ندارید؟ <Link href="/signup" className="text-primary hover:underline">ثبت‌نام</Link></p>
            <Link href="/" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors block">خانه</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
