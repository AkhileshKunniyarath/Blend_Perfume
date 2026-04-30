'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-5" noValidate>
      {/* General error */}
      {state?.message && (
        <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)]"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="w-full rounded-[1rem] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-soft)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        {state?.errors?.email && (
          <p className="mt-1.5 text-xs text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          required
          className="w-full rounded-[1rem] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-soft)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        {state?.errors?.password && (
          <p className="mt-1.5 text-xs text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="gold-button mt-2 w-full rounded-full py-3.5 text-xs font-semibold uppercase tracking-[0.2em] disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
