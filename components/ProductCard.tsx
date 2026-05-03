'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { formatCurrency, cn } from '@/lib/utils';
import {
  getEffectivePrice,
  getProductPrimaryImage,
  type StorefrontProduct,
} from '@/lib/storefront';

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
  const primaryImage = getProductPrimaryImage(product.images);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: defaultVariant?.price ?? price,
      quantity: 1,
      size: defaultVariant?.size,
      image: primaryImage,
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
          {typeof product.categoryId === 'object' && product.categoryId?.name
            ? product.categoryId.name
            : 'Blend Perfume'}
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
          <img
            src={primaryImage}
            alt={product.name}
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(15,15,15,0.18)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <div className="mt-6 text-center pb-2">
        <Link href={`/product/${product.slug}`} className="block text-xl font-medium tracking-wide text-[var(--deep-black)]">
          {product.name.toUpperCase()}
        </Link>

        <div className="mt-4 space-y-2 text-sm font-medium text-[var(--deep-black)]">
          {product.variants && product.variants.length > 0 ? (
            product.variants.map((variant, idx) => (
              <p key={idx} className="tracking-wide">
                {formatCurrency(variant.price)}{variant.cutPrice ? <span className="ml-2 text-[var(--foreground-soft)] line-through">{formatCurrency(variant.cutPrice)}</span> : null}-{variant.size}
              </p>
            ))
          ) : (
            <p className="tracking-wide">{formatCurrency(price)}</p>
          )}
        </div>
      </div>
    </article>
  );
}
