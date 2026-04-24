'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
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
  { id: 'under-1000', label: 'Under 1000' },
  { id: '1000-2000', label: '1000 - 2000' },
  { id: 'above-2000', label: 'Above 2000' },
] as const;

type PriceFilter = (typeof PRICE_FILTERS)[number]['id'];
type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest' | 'name';

function getDisplayPrice(product: StorefrontProduct) {
  return product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
}

function matchesPrice(product: StorefrontProduct, priceFilter: PriceFilter) {
  const price = getDisplayPrice(product);

  switch (priceFilter) {
    case 'under-1000':
      return price < 1000;
    case '1000-2000':
      return price >= 1000 && price <= 2000;
    case 'above-2000':
      return price > 2000;
    default:
      return true;
  }
}

function sortProducts(products: StorefrontProduct[], sortBy: SortOption) {
  const nextProducts = [...products];

  switch (sortBy) {
    case 'price-low':
      return nextProducts.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    case 'price-high':
      return nextProducts.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    case 'name':
      return nextProducts.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return nextProducts.reverse();
    default:
      return nextProducts;
  }
}

export default function ProductListingPage({
  title,
  description,
  products,
  categories,
  activeCategorySlug,
  eyebrow = 'Product Listing',
}: ProductListingPageProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [stockOnly, setStockOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const deferredSearch = useDeferredValue(search);

  const sizes = Array.from(
    new Set(
      products.flatMap((product) => product.variants?.map((variant) => variant.size).filter(Boolean) || [])
    )
  );

  const filteredProducts = sortProducts(
    products.filter((product) => {
      const matchesSearch =
        deferredSearch.trim().length === 0 ||
        product.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesStock = !stockOnly || product.stock > 0;
      const matchesSelectedSize =
        sizeFilter === 'all' || product.variants?.some((variant) => variant.size === sizeFilter);

      return matchesSearch && matchesStock && matchesSelectedSize && matchesPrice(product, priceFilter);
    }),
    sortBy
  );

  const inStockCount = products.filter((product) => product.stock > 0).length;
  const priceValues = products.map((product) => getDisplayPrice(product));
  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const highestPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;

  const hasFilters =
    search.trim().length > 0 || stockOnly || sizeFilter !== 'all' || priceFilter !== 'all';

  return (
    <div className="pb-20">
      <section className="section-shell py-8 sm:py-12">
        <div className="luxury-panel overflow-hidden rounded-[2.6rem]">
          <div className="grid gap-6 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-strong)]">{eyebrow}</p>
              <h1 className="mt-4 text-5xl text-[var(--deep-black)] sm:text-6xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--foreground-soft)]">{description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/60 bg-white/65 p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Products</p>
                <p className="mt-3 text-3xl text-[var(--deep-black)]">{products.length}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/60 bg-white/65 p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">In Stock</p>
                <p className="mt-3 text-3xl text-[var(--deep-black)]">{inStockCount}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/60 bg-white/65 p-5">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Price Range</p>
                <p className="mt-3 text-lg text-[var(--deep-black)]">
                  {products.length > 0 ? `${formatCurrency(lowestPrice)} - ${formatCurrency(highestPrice)}` : 'Coming soon'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-6 xl:grid-cols-[18rem_1fr]">
          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <div className="luxury-panel rounded-[2rem] p-6">
              <div className="flex items-center gap-2 text-[var(--deep-black)]">
                <SlidersHorizontal className="h-4 w-4 text-[var(--accent-strong)]" />
                <h2 className="text-xl">Browse</h2>
              </div>

              <div className="mt-5">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-soft)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search fragrances"
                    className="w-full rounded-full border border-[var(--border)] bg-white/78 py-3 pl-11 pr-4 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </label>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Categories</p>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/category/${category.slug}`}
                        className={cn(
                          'rounded-full px-4 py-2 text-sm',
                          activeCategorySlug === category.slug
                            ? 'bg-[var(--deep-black)] text-white'
                            : 'border border-[var(--border)] bg-white/70 text-[var(--foreground)]'
                        )}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Price</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRICE_FILTERS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPriceFilter(option.id)}
                        className={cn(
                          'rounded-full px-4 py-2 text-sm',
                          priceFilter === option.id
                            ? 'bg-[var(--deep-black)] text-white'
                            : 'border border-[var(--border)] bg-white/70 text-[var(--foreground)]'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {sizes.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Size</p>
                    <div className="mt-3 flex flex-wrap gap-2">
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

                <button
                  type="button"
                  onClick={() => setStockOnly((current) => !current)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left text-sm',
                    stockOnly
                      ? 'border-[var(--accent)] bg-[rgba(201,169,110,0.12)] text-[var(--deep-black)]'
                      : 'border-[var(--border)] bg-white/70 text-[var(--foreground)]'
                  )}
                >
                  <span>Show in-stock only</span>
                  <span>{stockOnly ? 'On' : 'Off'}</span>
                </button>
              </div>
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

          <div className="space-y-5">
            <div className="luxury-panel rounded-[2rem] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-soft)]">Selection</p>
                  <p className="mt-2 text-lg text-[var(--deep-black)]">
                    {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} available
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap gap-2">
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          setStockOnly(false);
                          setPriceFilter('all');
                          setSizeFilter('all');
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/72 px-4 py-2 text-sm text-[var(--foreground)]"
                      >
                        <X className="h-4 w-4" />
                        Clear filters
                      </button>
                    )}
                    <div className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2 text-sm text-[var(--foreground)]">
                      {title}
                    </div>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
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

            {filteredProducts.length === 0 ? (
              <div className="luxury-panel rounded-[2rem] px-6 py-20 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-[var(--accent-strong)]" />
                <h2 className="mt-5 text-3xl text-[var(--deep-black)]">No products match these filters</h2>
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
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
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
