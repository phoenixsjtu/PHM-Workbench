import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeProvider } from './theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'PHM Workbench | 预测性维护工作台',
  description: 'A browser-based PHM workflow prototype for rotating machinery, with a local blueprint editor and synthetic demo data.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeProvider>
          <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--panel-strong)] backdrop-blur">
            <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-xs sm:px-6 lg:px-8">
              <Link href="/" className="font-semibold text-[color:var(--text)]">PHM Workbench</Link>
              <span className="rounded-full border border-[color:var(--border)] px-2.5 py-1 font-medium text-[color:var(--accent)]">
                Demo data / 示例数据
              </span>
              <span className="text-[color:var(--muted)]">Synthetic examples · Blueprint edits stay in this browser</span>
              <a href="https://phoenixsjtu.github.io/" className="ml-auto text-[color:var(--muted)] hover:text-[color:var(--text)]">Portfolio ↗</a>
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
