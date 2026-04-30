'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { getProductPrimaryImage } from '@/lib/storefront';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="section-shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="mb-6 h-14 w-14 text-[var(--accent)]/50" />
        <h2 className="font-display text-3xl text-[var(--foreground)]">Your cart is empty</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/products"
          className="gold-button mt-8 inline-flex rounded-full px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em]"
        >
          Browse Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="section-shell py-8 sm:py-12">
      <h1 className="mb-8 font-display text-3xl sm:text-4xl text-[var(--foreground)]">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* ── Items ── */}
        <div className="space-y-4">
          {items.map((item) => {
            const itemImage = getProductPrimaryImage(item.image ? [item.image] : []);
            return (
              <div
                key={`${item.id}-${item.size}`}
                className="luxury-panel flex gap-4 rounded-[1.8rem] p-4 sm:gap-6 sm:p-5"
              >
                {/* Image */}
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1rem] bg-[var(--background-strong)] sm:h-24 sm:w-24">
                  <img
                    src={itemImage}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-[var(--foreground)]">{item.name}</h3>
                      {item.size && (
                        <p className="mt-0.5 text-xs text-[var(--foreground-soft)]">Size: {item.size}</p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">₹{item.price}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="flex-shrink-0 rounded-full p-2 text-[var(--foreground-soft)] hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Qty + subtotal row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center overflow-hidden rounded-full border border-[var(--border)] bg-white/70">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size)}
                        className="flex h-9 w-9 items-center justify-center text-[var(--foreground-soft)] hover:bg-[var(--background-strong)]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-[var(--foreground)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        className="flex h-9 w-9 items-center justify-center text-[var(--foreground-soft)] hover:bg-[var(--background-strong)]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Order summary ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="luxury-panel rounded-[2rem] p-6">
            <h2 className="mb-5 font-display text-xl text-[var(--foreground)]">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm text-[var(--foreground-soft)]">
                <span>Subtotal</span>
                <span className="font-medium text-[var(--foreground)]">₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--foreground-soft)]">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-semibold text-[var(--foreground)]">
                <span>Total</span>
                <span>₹{getTotalPrice()}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="gold-button mt-6 block w-full rounded-full py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="mt-3 block w-full rounded-full border border-[var(--border)] bg-white/70 py-3 text-center text-xs uppercase tracking-[0.2em] text-[var(--foreground-soft)] hover:bg-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
