'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '@/lib/store/cart';
import { getProductPrimaryImage } from '@/lib/storefront';

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export type CheckoutSession = {
  userId: string;
  name: string;
  email: string;
  phone: string;
} | null;

export default function CheckoutClient({ session }: { session: CheckoutSession }) {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || session.name,
        email: prev.email || session.email,
        phone: prev.phone || session.phone,
      }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.userId ?? undefined,
          products: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            image: item.image,
          })),
          address: formData,
          totalAmount: getTotalPrice(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create order. Please try again.');
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: data.amount,
        currency: data.currency,
        name: 'Blend Perfume',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async function (response: RazorpayResponse) {
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            const searchParams = new URLSearchParams();
            if (verifyData.orderId) searchParams.set('order', verifyData.orderId);
            if (verifyData.trackingUrl) searchParams.set('track', verifyData.trackingUrl);
            router.push(`/order-success?${searchParams.toString()}`);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#c9a96e' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section-shell py-16 text-center">
        <h2 className="font-display text-3xl text-[var(--foreground)]">Your cart is empty</h2>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-[0.9rem] border border-[var(--border)] bg-white/70 px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-soft)]/60 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20';

  const labelClass =
    'mb-1.5 block text-xs uppercase tracking-[0.2em] text-[var(--foreground-soft)]';

  return (
    <div className="section-shell py-8 sm:py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <h1 className="mb-8 font-display text-3xl sm:text-4xl text-[var(--foreground)]">Checkout</h1>

      {/* On mobile: summary first (collapsed), form below. On lg: side-by-side */}
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">

        {/* ── Order summary (shown above form on mobile) ── */}
        <div className="order-first lg:order-last lg:sticky lg:top-24 lg:self-start">
          <div className="luxury-panel rounded-[2rem] p-5 sm:p-6">
            <h2 className="mb-4 font-display text-xl text-[var(--foreground)]">Order Summary</h2>

            <div className="space-y-3">
              {items.map((item) => {
                const itemImage = getProductPrimaryImage(item.image ? [item.image] : []);
                return (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex items-center gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-[0.7rem] bg-[var(--background-strong)]">
                      <img src={itemImage} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.name}</p>
                      <p className="text-xs text-[var(--foreground-soft)]">
                        Qty: {item.quantity}{item.size ? ` · ${item.size}` : ''}
                      </p>
                    </div>
                    <p className="flex-shrink-0 text-sm font-medium text-[var(--foreground)]">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
              <div className="flex justify-between text-sm text-[var(--foreground-soft)]">
                <span>Subtotal</span>
                <span>₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--foreground-soft)]">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold text-[var(--foreground)]">
                <span>Total</span>
                <span>₹{getTotalPrice()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Shipping form ── */}
        <div className="order-last lg:order-first">
          <h2 className="mb-5 text-xs uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
            Shipping Information
          </h2>

          <form onSubmit={handlePayment} className="space-y-4">
            {/* Full name — full width on mobile, half on sm+ */}
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                required
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                className={inputClass}
              />
            </div>

            {/* Email + Phone — stack on mobile, side-by-side on sm+ */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Street Address</label>
              <input
                required
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="House / flat / street"
                className={inputClass}
              />
            </div>

            {/* City + State */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>City</label>
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  required
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className={inputClass}
                />
              </div>
            </div>

            {/* PIN + Country */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>PIN Code</label>
                <input
                  required
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="PIN code"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  readOnly
                  className={`${inputClass} cursor-not-allowed opacity-60`}
                />
              </div>
            </div>

            <p className="text-[11px] text-[var(--foreground-soft)]/70">
              Email and mobile number are required for order tracking and delivery updates.
            </p>

            {error && (
              <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="gold-button mt-2 w-full rounded-full py-4 text-xs font-semibold uppercase tracking-[0.2em] disabled:opacity-60"
            >
              {loading ? 'Processing…' : `Pay ₹${getTotalPrice()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
