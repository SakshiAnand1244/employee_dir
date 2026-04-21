import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import './globals.css';
import { ROUTES } from '@/lib/constants/routes';

export const metadata: Metadata = {
  title: 'Employee Directory',
  description: 'High-performance employee directory built with Next.js and MongoDB.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="relative isolate min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-[-12rem] top-[-8rem] h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute right-[-8rem] top-[18rem] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute bottom-[-10rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-slate-400/5 blur-3xl" />
          </div>

          <header className="sticky top-0 z-20 border-b border-white/8 bg-slate-950/40 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <Link href={ROUTES.home} className="group flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-sm font-semibold text-accent transition group-hover:bg-accent/20">
                  ED
                </span>
                <span>
                  <span className="block text-sm uppercase tracking-[0.35em] text-sky-300/70">SPACE Al</span>
                  <span className="block text-base font-semibold text-slate-50">Employee Directory</span>
                </span>
              </Link>

              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300 md:flex">
                Next.js App Router
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                MongoDB native driver
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
