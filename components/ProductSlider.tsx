'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import type { StorefrontProduct } from '@/lib/storefront';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProductSliderProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  products: StorefrontProduct[];
};

export default function ProductSlider({ id, title, subtitle, products }: ProductSliderProps) {
  if (products.length === 0) {
    return (
      <section id={id} className="section-shell py-18 sm:py-24">
        <div className="luxury-panel rounded-[2.4rem] px-8 py-14 text-center">
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Best Sellers</p>
          <h2 className="mt-3 text-4xl text-[var(--deep-black)] sm:text-5xl">{title || 'Best Sellers'}</h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[var(--foreground-soft)]">
            Add products in the admin panel to populate this slider.
          </p>
          <a
            href="/admin/products"
            className="gold-button mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Manage Products
          </a>
        </div>
      </section>
    );
  }

  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(products.length > 1);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const updateControls = () => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      setCanScrollLeft(rail.scrollLeft > 8);
      setCanScrollRight(rail.scrollLeft < maxScrollLeft - 8);
    };

    updateControls();
    rail.addEventListener('scroll', updateControls, { passive: true });
    window.addEventListener('resize', updateControls);

    return () => {
      rail.removeEventListener('scroll', updateControls);
      window.removeEventListener('resize', updateControls);
    };
  }, [products.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const firstCard = rail.querySelector<HTMLElement>('[data-slider-card]');
    const cardWidth = firstCard?.offsetWidth ?? rail.clientWidth * 0.82;
    const gap = 20;
    const offset = cardWidth + gap;

    rail.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth',
    });
  };

  return (
    <section id={id} className="section-shell py-18 sm:py-24">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Best Sellers</p>
          <h2 className="mt-3 text-4xl text-[var(--deep-black)] sm:text-5xl">{title || 'Best Sellers'}</h2>
        </div>
        <div className="flex items-end gap-4">
          {subtitle && <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">{subtitle}</p>}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/78 backdrop-blur',
                canScrollLeft
                  ? 'border-[var(--border)] text-[var(--deep-black)] hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--foreground-soft)] opacity-45'
              )}
              aria-label="Scroll products left"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/78 backdrop-blur',
                canScrollRight
                  ? 'border-[var(--border)] text-[var(--deep-black)] hover:border-[var(--accent-strong)] hover:text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--foreground-soft)] opacity-45'
              )}
              aria-label="Scroll products right"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className="hide-scrollbar flex snap-x gap-5 overflow-x-auto pb-4"
      >
        {products.map((product, index) => (
          <div
            key={product._id}
            data-slider-card
            className="min-w-[78vw] max-w-[78vw] shrink-0 snap-start sm:min-w-[calc(50%-10px)] sm:max-w-[calc(50%-10px)] lg:min-w-[calc(25%-15px)] lg:max-w-[calc(25%-15px)]"
          >
            <ProductCard product={product} priority={index === 0 ? 'featured' : 'default'} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/78 backdrop-blur',
            canScrollLeft
              ? 'border-[var(--border)] text-[var(--deep-black)]'
              : 'border-[var(--border)] text-[var(--foreground-soft)] opacity-45'
          )}
          aria-label="Scroll products left"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/78 backdrop-blur',
            canScrollRight
              ? 'border-[var(--border)] text-[var(--deep-black)]'
              : 'border-[var(--border)] text-[var(--foreground-soft)] opacity-45'
          )}
          aria-label="Scroll products right"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
