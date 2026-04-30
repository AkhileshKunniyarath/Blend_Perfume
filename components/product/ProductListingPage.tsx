'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal, Sparkles, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { StorefrontCategory, StorefrontProduct } from '@/lib/storefront';
import { cn, formatCurrency } from '@/lib/utils';

type ProductListingPageProps = {
  title: string;
  description: string;
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  activeCategorySlug?: string;
  eyebrow?: string;
};

const PRICE_FILTERS = [
  { id: 'all', label: 'All Prices' },
  { id: 'under-1000', label: 'Under ₹1000' },
  { id: '1000-2000', label: '₹1000 – ₹2000' },
  { id: 'above-2000', label: 'Above ₹2000' },
] as const;

type PriceFilter = (typeof PRICE_FILTERS)[number]['id'];
type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'name';

function getDisplayPrice(product: StorefrontProduct) {
  return product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
}

function matchesPrice(product: StorefrontProduct, priceFilter: PriceFilter) {
  const price = getDisplayPrice(product);
  switch (priceFilter) {
    case 'under-1000': return price < 1000;
    case '1000-2000': return price >= 1000 && price <= 2000;
    case 'above-2000': return price > 2000;
    default: return true;
  }
}

function sortProducts(products: StorefrontProduct[], sortBy: SortOption) {
  const next = [...products];
  switch (sortBy) {
    case 'price-low': return next.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    case 'price-high': return next.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    case 'name': return next.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest': return next.reverse();
    default: return next;
  }
}

// ── Filter panel content (shared between sidebar and drawer) ─────────────────
function FilterPanel({
  search, setSearch,
  priceFilter, setPriceFilter,
  sizeFilter, setSizeFilter,
  stockOnly, setStockOnly,
  sizes, categories, activeCategorySlug,
}: {
  search: string; setSearch: (v: string) => void;
  priceFilter: PriceFilter; setPriceFilter: (v: PriceFilter) => void;
  sizeFilter: string; setSizeFilter: (v: string) => void;
  stockOnly: boolean; setStockOnly: (v: boolean) => void;
  sizes: string[]; categories: StorefrontCategory[]; activeCategorySlug?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-soft)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search fragrances"
          className="w-full rounded-full border border-[var(--border)] bg-white/78 py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--accent)]"
        />
      </label>

      {/* Categories */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Categories</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className={cn(
              'rounded-full px-4 py-2 text-sm',
              !activeCategorySlug
                ? 'bg-[var(--deep-black)] text-white'
                : 'border border-[var(--border)] bg-white/70 text-[var(--foreground)]'
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className={cn(
                'rounded-full px-4 py-2 text-sm',
                activeCategorySlug === cat.slug
                  ? 'bg-[var(--deep-black)] text-white'
                  : 'border border-[var(--border)] bg-white/70 text-[var(--foreground)]'
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Price</p>
        <div className="flex flex-wrap gap-2">
          {PRICE_FILTERS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPriceFilter(opt.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm',
                priceFilter === opt.id
                  ? 'bg-[var(--deep-black)] text-white'
                  : 'border border-[var(--border)] bg-white/70 text-[var(--foreground)]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      {sizes.length > 0 && (
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Size</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSizeFilter('all')}
              className={cn(
                'rounded-full px-4 py-2 text-sm',
                sizeFilter === 'all'
                  ? 'bg-[var(--deep-black)] text-white'
                  : 'border border-[var(--border)] bg-white/70 text-[var(--foreground)]'
              )}
            >
              All Sizes
            </button>
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSizeFilter(size)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm',
                  sizeFilter === size
                    ? 'bg-[var(--deep-black)] text-white'
                    : 'border border-[var(--border)] bg-white/70 text-[var(--foreground)]'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* In-stock toggle */}
      <button
        type="button"
        onClick={() => setStockOnly(!stockOnly)}
        className={cn(
          'flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left text-sm',
          stockOnly
            ? 'border-[var(--accent)] bg-[rgba(201,169,110,0.12)] text-[var(--deep-black)]'
            : 'border-[var(--border)] bg-white/70 text-[var(--foreground)]'
        )}
      >
        <span>Show in-stock only</span>
        <span className="text-xs uppercase tracking-[0.2em]">{stockOnly ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductListingPage({
  title, description, products, categories, activeCategorySlug, eyebrow = 'Product Listing',
}: ProductListingPageProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [stockOnly, setStockOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const sizes = Array.from(
    new Set(products.flatMap((p) => p.variants?.map((v) => v.size).filter(Boolean) || []))
  );

  const filteredProducts = sortProducts(
    products.filter((p) => {
      const matchesSearch =
        deferredSearch.trim().length === 0 ||
        p.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesStock = !stockOnly || p.stock > 0;
      const matchesSize = sizeFilter === 'all' || p.variants?.some((v) => v.size === sizeFilter);
      return matchesSearch && matchesStock && matchesSize && matchesPrice(p, priceFilter);
    }),
    sortBy
  );

  const inStockCount = products.filter((p) => p.stock > 0).length;
  const priceValues = products.map(getDisplayPrice);
  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const highestPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;

  const hasFilters = search.trim().length > 0 || stockOnly || sizeFilter !== 'all' || priceFilter !== 'all';

  const filterProps = {
    search, setSearch, priceFilter, setPriceFilter,
    sizeFilter, setSizeFilter, stockOnly, setStockOnly,
    sizes, categories, activeCategorySlug,
  };

  return (
    <div className="pb-20">
      {/* ── Hero banner ── */}
      <section className="section-shell py-8 sm:py-12">
        <div className="luxury-panel overflow-hidden rounded-[2.6rem]">
          <div className="grid gap-6 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-strong)]">{eyebrow}</p>
              <h1 className="mt-4 text-4xl text-[var(--deep-black)] sm:text-5xl lg:text-6xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--foreground-soft)]">{description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/60 bg-white/65 p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Products</p>
                <p className="mt-2 text-2xl sm:text-3xl text-[var(--deep-black)]">{products.length}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/60 bg-white/65 p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">In Stock</p>
                <p className="mt-2 text-2xl sm:text-3xl text-[var(--deep-black)]">{inStockCount}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/60 bg-white/65 p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Range</p>
                <p className="mt-2 text-base text-[var(--deep-black)]">
                  {products.length > 0
                    ? `${formatCurrency(lowestPrice)}–${formatCurrency(highestPrice)}`
                    : 'Soon'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        {/* ── Mobile/tablet filter bar ── */}
        <div className="mb-4 flex items-center gap-3 xl:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2.5 text-sm text-[var(--foreground-soft)]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="flex-1 rounded-full border border-[var(--border)] bg-white/78 px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name">Name</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={() => { setSearch(''); setStockOnly(false); setPriceFilter('all'); setSizeFilter('all'); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/80 px-3 py-2.5 text-sm text-[var(--foreground-soft)]"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* ── Mobile filter drawer ── */}
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm xl:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 z-50 flex w-[min(22rem,90vw)] flex-col bg-[var(--background)] shadow-2xl xl:hidden">
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[var(--accent-strong)]" />
                  <span className="font-medium text-[var(--foreground)]">Filters</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full p-2 hover:bg-[var(--background-strong)]"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-[var(--foreground-soft)]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FilterPanel {...filterProps} />
              </div>
              <div className="border-t border-[var(--border)] p-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="gold-button w-full rounded-full py-3 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Show {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Desktop layout: sidebar + grid ── */}
        <div className="grid gap-6 xl:grid-cols-[18rem_1fr]">
          {/* Sidebar — hidden on mobile/tablet */}
          <aside className="hidden space-y-5 xl:block xl:sticky xl:top-24 xl:self-start">
            <div className="luxury-panel rounded-[2rem] p-6">
              <div className="mb-5 flex items-center gap-2 text-[var(--deep-black)]">
                <SlidersHorizontal className="h-4 w-4 text-[var(--accent-strong)]" />
                <h2 className="text-xl">Browse</h2>
              </div>
              <FilterPanel {...filterProps} />
            </div>

            <div className="luxury-panel rounded-[2rem] p-6">
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">Why shop Blend</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--foreground-soft)]">
                <p>Premium fragrance storytelling with clean luxury presentation.</p>
                <p>Balanced notes and long-lasting wear designed for gifting and repeat use.</p>
                <p>Browse by collection, size, price, and stock without leaving the page.</p>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="space-y-5">
            {/* Toolbar — desktop only */}
            <div className="luxury-panel hidden rounded-[2rem] p-5 xl:block sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Selection</p>
                  <p className="mt-2 text-lg text-[var(--deep-black)]">
                    {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} available
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={() => { setSearch(''); setStockOnly(false); setPriceFilter('all'); setSizeFilter('all'); }}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/72 px-4 py-2 text-sm text-[var(--foreground)]"
                    >
                      <X className="h-4 w-4" />
                      Clear filters
                    </button>
                  )}
                  <div className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2 text-sm text-[var(--foreground)]">
                    {title}
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="rounded-full border border-[var(--border)] bg-white/78 px-4 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Result count — mobile/tablet */}
            <p className="text-sm text-[var(--foreground-soft)] xl:hidden">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>

            {filteredProducts.length === 0 ? (
              <div className="luxury-panel rounded-[2rem] px-6 py-20 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-[var(--accent-strong)]" />
                <h2 className="mt-5 text-2xl sm:text-3xl text-[var(--deep-black)]">No products match these filters</h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--foreground-soft)]">
                  Try widening your search, removing a size filter, or returning to the full collection.
                </p>
                <Link
                  href="/products"
                  className="gold-button mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
                >
                  View All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
