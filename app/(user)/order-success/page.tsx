import React from 'react';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';

type OrderSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
    track?: string;
  }>;
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { order, track } = await searchParams;

  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md soft-fade-up">
        {/* Card */}
        <div className="luxury-panel rounded-[2rem] p-8 text-center sm:p-10">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">
            Payment Confirmed
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-[var(--foreground)]">
            Order Placed!
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
            Thank you for your purchase. We&apos;ve received your order and are currently preparing it.
          </p>

          {order && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2">
              <Package className="h-3.5 w-3.5 text-[var(--accent-strong)]" />
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)]">
                Order #{order.slice(-8).toUpperCase()}
              </span>
            </div>
          )}

          <p className="mt-5 text-xs leading-6 text-[var(--foreground-soft)]/80">
            A confirmation email with your order details and tracking link has been sent to your inbox.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            {track && (
              <Link
                href={track}
                className="gold-button block w-full rounded-full py-3.5 text-xs font-semibold uppercase tracking-[0.2em]"
              >
                Track Your Order
              </Link>
            )}
            <Link
              href="/"
              className="block w-full rounded-full border border-[var(--border)] bg-white/70 py-3.5 text-xs uppercase tracking-[0.2em] text-[var(--foreground-soft)] hover:bg-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
