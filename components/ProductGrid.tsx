import ProductCard from '@/components/ProductCard';
import type { StorefrontProduct } from '@/lib/storefront';
import { Sparkles } from 'lucide-react';

type ProductGridProps = {
  title?: string;
  subtitle?: string;
  products: StorefrontProduct[];
};

export default function ProductGrid({ title, subtitle, products }: ProductGridProps) {
  return (
    <section className="section-shell py-18 sm:py-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Explore</p>
          <h2 className="mt-3 text-4xl text-[var(--deep-black)] sm:text-5xl">{title || 'Explore Collection'}</h2>
        </div>
        {subtitle && <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">{subtitle}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.length > 0
          ? products.map((product) => <ProductCard key={product._id} product={product} />)
          : Array.from({ length: 4 }).map((_, index) => (
              <article key={`placeholder-${index}`} className="luxury-panel rounded-[2rem] p-5">
                <div className="aspect-[4/5] rounded-[1.6rem] bg-[radial-gradient(circle_at_top,#f8f1e7,#ddcfbe)]" />
                <div className="mt-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--foreground-soft)]">
                      Blend Edit
                    </p>
                    <h3 className="mt-2 text-2xl text-[var(--deep-black)]">Collection Drop {index + 1}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
                      This grid will populate automatically once products are added.
                    </p>
                  </div>
                  <Sparkles className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}
