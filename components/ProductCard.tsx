'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { formatCurrency, cn } from '@/lib/utils';
import { getEffectivePrice, type StorefrontProduct } from '@/lib/storefront';

type ProductCardProps = {
  product: StorefrontProduct;
  priority?: 'default' | 'featured';
};

export default function ProductCard({ product, priority = 'default' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const price = getEffectivePrice(product);
  const defaultVariant = product.variants?.[0];

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: defaultVariant?.price ?? price,
      quantity: 1,
      size: defaultVariant?.size,
      image: product.images?.[0],
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article
      className={cn(
        'group luxury-panel relative overflow-hidden rounded-[2rem] p-4 sm:p-5',
        priority === 'featured' && 'sm:p-6'
      )}
    >
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between">
        <span className="rounded-full border border-white/60 bg-white/72 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--foreground-soft)] backdrop-blur">
          Eau de parfum
        </span>
        <button
          type="button"
          onClick={() => setWishlisted((value) => !value)}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 text-[var(--deep-black)] backdrop-blur',
            wishlisted && 'border-[var(--accent)] text-[var(--accent-strong)]'
          )}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')} />
        </button>
      </div>

      <Link href={`/product/${product.slug}`} className="block">
        <div className="hover-image-zoom relative overflow-hidden rounded-[1.6rem] bg-[#e9e2d7]">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="aspect-[4/5] w-full bg-[radial-gradient(circle_at_top,#f8f5f0,#ddd2c2)]" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(15,15,15,0.18)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="mt-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--foreground-soft)]">
              Signature Blend
            </p>
            <Link href={`/product/${product.slug}`} className="mt-1 block text-xl leading-tight text-[var(--deep-black)]">
              {product.name}
            </Link>
          </div>
          <Sparkles className="mt-1 h-4 w-4 text-[var(--accent-strong)]" />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-[var(--deep-black)]">{formatCurrency(price)}</p>
            {product.salePrice && product.salePrice < product.price && (
              <p className="text-sm text-[var(--foreground-soft)] line-through">
                {formatCurrency(product.price)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--deep-black)] px-4 py-2 text-sm font-medium text-[var(--deep-black)] hover:bg-[var(--deep-black)] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ShoppingBag className="h-4 w-4" />
            {product.stock > 0 ? (added ? 'Added' : 'Add to cart') : 'Sold out'}
          </button>
        </div>
      </div>
    </article>
  );
}
