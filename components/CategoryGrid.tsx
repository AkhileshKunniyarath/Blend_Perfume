import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { StorefrontCategory } from '@/lib/storefront';

type CategoryGridProps = {
  title?: string;
  subtitle?: string;
  categories: StorefrontCategory[];
};

export default function CategoryGrid({ title, subtitle, categories }: CategoryGridProps) {
  const items =
    categories.length > 0
      ? categories
      : [
          { _id: 'men', name: 'Men', slug: '#', image: '' },
          { _id: 'women', name: 'Women', slug: '#', image: '' },
          { _id: 'unisex', name: 'Unisex', slug: '#', image: '' },
          { _id: 'luxury', name: 'Luxury', slug: '#', image: '' },
        ];

  return (
    <section id="collections" className="section-shell py-18 sm:py-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Collections</p>
          <h2 className="mt-3 text-4xl text-[var(--deep-black)] sm:text-5xl">{title || 'Shop by Mood'}</h2>
        </div>
        {subtitle && <p className="max-w-xl text-sm leading-7 text-[var(--foreground-soft)] sm:text-base">{subtitle}</p>}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((category, index) => (
          <Link
            key={category._id}
            href={categories.length > 0 ? `/category/${category.slug}` : '/'}
            className="group relative overflow-hidden rounded-[2rem] border border-white/45 bg-[var(--deep-black)]"
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="h-[22rem] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="h-[22rem] w-full bg-[radial-gradient(circle_at_top,#d8c3a0,transparent_34%),linear-gradient(180deg,#2a2823,#121212)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/10 transition-opacity duration-300 group-hover:from-black/76" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-white/65">
                  {index === 0 ? 'Men' : index === 1 ? 'Women' : index === 2 ? 'Unisex' : 'Luxury'}
                </p>
                <h3 className="mt-2 text-3xl">{category.name}</h3>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/24 bg-white/10 backdrop-blur">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
