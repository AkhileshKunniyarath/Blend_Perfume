import ProductCard from '@/components/ProductCard';
import type { StorefrontProduct } from '@/lib/storefront';
import { Sparkles } from 'lucide-react';

type ProductSliderProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  products: StorefrontProduct[];
};

export default function ProductSlider({ id, title, subtitle, products }: ProductSliderProps) {
  return (
    <section id={id} className="section-shell py-18 sm:py-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Best Sellers</p>
          <h2 className="mt-3 text-4xl text-[var(--deep-black)] sm:text-5xl">{title || 'Best Sellers'}</h2>
        </div>
        {subtitle && <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">{subtitle}</p>}
      </div>

      <div className="flex snap-x gap-5 overflow-x-auto pb-4">
        {products.length > 0
          ? products.map((product, index) => (
              <div key={product._id} className="min-w-[78vw] max-w-[78vw] snap-start sm:min-w-[21rem] sm:max-w-[21rem]">
                <ProductCard product={product} priority={index === 0 ? 'featured' : 'default'} />
              </div>
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="luxury-panel min-w-[78vw] max-w-[78vw] snap-start rounded-[2rem] p-5 sm:min-w-[21rem] sm:max-w-[21rem]"
              >
                <div className="aspect-[4/5] rounded-[1.6rem] bg-[radial-gradient(circle_at_top,#f7f0e6,#dfcfb8)]" />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--foreground-soft)]">
                      Coming Soon
                    </p>
                    <h3 className="mt-2 text-2xl text-[var(--deep-black)]">Signature Blend {index + 1}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                      Add products in admin to replace these editorial placeholders with your catalog.
                    </p>
                  </div>
                  <Sparkles className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
