import ProductCard from '@/components/ProductCard';
import type { StorefrontProduct } from '@/lib/storefront';
import { Sparkles } from 'lucide-react';

type ProductGridProps = {
  title?: string;
  subtitle?: string;
  products: StorefrontProduct[];
};

export default function ProductGrid({ title, subtitle, products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <section className="section-shell py-18 sm:py-24">
        <div className="luxury-panel rounded-[2.4rem] px-8 py-14 text-center">
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Explore</p>
          <h2 className="mt-3 text-4xl text-[var(--deep-black)] sm:text-5xl">{title || 'Explore Collection'}</h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[var(--foreground-soft)]">
            Add products in the admin panel to populate this grid.
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
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
