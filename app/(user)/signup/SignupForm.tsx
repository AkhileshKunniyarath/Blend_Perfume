'use client';

import { useActionState } from 'react';
import { signup } from '@/app/actions/auth';

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  const inputClass =
    'w-full rounded-[1rem] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-soft)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20';

  const labelClass =
    'mb-1.5 block text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)]';

  return (
    <form action={action} className="space-y-5" noValidate>
      {/* General error */}
      {state?.message && (
        <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          required
          className={inputClass}
        />
        {state?.errors?.name && (
          <p className="mt-1.5 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={inputClass}
        />
        {state?.errors?.email && (
          <p className="mt-1.5 text-xs text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className={labelClass}>
          Mobile Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          required
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-[var(--foreground-soft)]/70">
          Used to match any guest orders you placed with this number.
        </p>
        {state?.errors?.phone && (
          <p className="mt-1.5 text-xs text-red-600">{state.errors.phone[0]}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          required
          className={inputClass}
        />
        {state?.errors?.password && (
          <ul className="mt-1.5 space-y-0.5">
            {state.errors.password.map((err) => (
              <li key={err} className="text-xs text-red-600">
                — {err}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="gold-button mt-2 w-full rounded-full py-3.5 text-xs font-semibold uppercase tracking-[0.2em] disabled:opacity-60"
      >
        {pending ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
