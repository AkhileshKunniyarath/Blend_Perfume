import React from 'react';
import Link from 'next/link';
import AdminSidebarNav from '@/components/admin/AdminSidebarNav';
import { BlendLogo } from '@/components/brand/BlendLogo';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f2_0%,#f4ede3_40%,#efe7dc_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] gap-4 p-4 md:gap-6 md:p-6">
        <aside className="hidden w-72 shrink-0 flex-col rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0.76))] p-5 shadow-[0_28px_80px_rgba(15,15,15,0.08)] backdrop-blur-xl md:flex">
          <Link href="/admin" className="block" aria-label="Blend admin dashboard">
            <BlendLogo className="w-32" />
          </Link>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--foreground-soft)]">
            Admin Panel
          </p>

          <div className="mt-8">
            <AdminSidebarNav />
          </div>

          <div className="mt-auto rounded-[1.7rem] border border-white/60 bg-[rgba(15,15,15,0.92)] p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Blend House</p>
            <p className="mt-3 text-lg">Refined control over catalog, orders, and customer care.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="rounded-[1.8rem] border border-black/8 bg-[rgba(255,255,255,0.78)] px-5 py-4 shadow-[0_18px_50px_rgba(15,15,15,0.06)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--foreground-soft)]">Blend Control Room</p>
                <h1 className="mt-2 text-2xl text-[var(--deep-black)] sm:text-[2rem]">Premium operations panel</h1>
              </div>
              <button className="inline-flex min-h-11 items-center rounded-full border border-black/8 bg-white px-5 text-sm font-medium text-[var(--foreground)] hover:border-[rgba(171,132,81,0.28)] hover:text-[var(--deep-black)]">
                Logout
              </button>
            </div>
          </header>

          <div className="mt-4 md:hidden">
            <AdminSidebarNav mobile />
          </div>

          <main className="mt-4 flex-1 overflow-auto rounded-[2rem] border border-black/8 bg-[rgba(255,255,255,0.52)] p-4 shadow-[0_18px_50px_rgba(15,15,15,0.04)] backdrop-blur md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
