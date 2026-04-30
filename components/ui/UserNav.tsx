'use client';

import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

type Props = {
  session: { name: string; email: string; phone: string } | null;
};

export default function UserNav({ session }: Props) {
  if (!session) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)] hover:bg-white/90 hover:text-[var(--deep-black)]"
      >
        <User className="h-3.5 w-3.5" />
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)] hover:bg-white/90 hover:text-[var(--deep-black)]"
        title={session.email}
      >
        <User className="h-3.5 w-3.5" />
        <span className="max-w-[7rem] truncate">{session.name.split(' ')[0]}</span>
      </Link>
      <form action={logout}>
        <button
          type="submit"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/65 text-[var(--foreground-soft)] hover:bg-white/90 hover:text-red-600"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
