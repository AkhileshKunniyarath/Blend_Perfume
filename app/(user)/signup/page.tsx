import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Create Account — Blend Perfume',
  description: 'Sign up for a Blend Perfume account to track orders and enjoy a seamless checkout experience.',
};

export default async function SignupPage() {
  // Redirect already-authenticated users
  const session = await getSession();
  if (session) redirect('/');

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md soft-fade-up">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">
            Welcome to Blend
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-[var(--foreground)]">
            Create Account
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
            Join to track orders and enjoy a seamless checkout.
          </p>
        </div>

        {/* Card */}
        <div className="luxury-panel rounded-[2rem] p-6 sm:p-8">
          <SignupForm />

          <p className="mt-6 text-center text-sm text-[var(--foreground-soft)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[var(--accent-strong)] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
