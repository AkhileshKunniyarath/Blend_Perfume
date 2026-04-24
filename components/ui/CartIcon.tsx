'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export default function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href="/cart"
      className="relative rounded-full border border-white/60 bg-white/72 p-2.5 text-[var(--deep-black)] shadow-[0_8px_18px_rgba(15,15,15,0.05)] hover:border-[var(--accent)] hover:bg-white"
    >
      <ShoppingCart size={24} />
      {mounted && itemCount > 0 && (
        <span className="absolute top-0 right-0 flex h-5 w-5 translate-x-1 -translate-y-1 items-center justify-center rounded-full bg-[var(--deep-black)] text-[10px] font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
