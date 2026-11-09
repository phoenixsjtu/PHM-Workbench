import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-slate-100">
      <div className="max-w-md rounded-[28px] border border-white/10 bg-slate-900 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">The requested route does not exist in this workspace.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          Return home
        </Link>
      </div>
    </main>
  );
}
