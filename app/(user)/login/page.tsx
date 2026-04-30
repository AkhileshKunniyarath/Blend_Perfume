import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — Blend Perfume',
  description: 'Sign in to your Blend Perfume account to track orders and manage your profile.',
};

export default async function LoginPage() {
  // Redirect already-authenticated users
  const session = await getSession();
  if (session) redirect('/');

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md soft-fade-up">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">
            Welcome back
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-[var(--foreground)]">
            Sign In
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
            Access your orders and saved details.
          </p>
        </div>

        {/* Card */}
        <div className="luxury-panel rounded-[2rem] p-6 sm:p-8">
          <LoginForm />

          <p className="mt-6 text-center text-sm text-[var(--foreground-soft)]">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-[var(--accent-strong)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
