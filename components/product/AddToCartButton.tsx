'use client';

import React, { useMemo, useState } from 'react';
import { ShoppingBag, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { getProductPrimaryImage, type ProductVariant } from '@/lib/storefront';
import { formatCurrency, cn } from '@/lib/utils';

type ProductLike = {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  stock: number;
  images?: string[];
  description?: string;
  features?: string[];
  variants?: ProductVariant[];
};

export default function AddToCartButton({
  product,
  selectedSize: selectedSizeProp,
  onSelectedSizeChange,
}: {
  product: ProductLike;
  selectedSize?: string;
  onSelectedSizeChange?: (size: string) => void;
}) {
  const [internalSelectedSize, setInternalSelectedSize] = useState(product.variants?.[0]?.size || '');
  const [processingAction, setProcessingAction] = useState<'cart' | 'checkout' | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const selectedSize = selectedSizeProp ?? internalSelectedSize;

  const selectedVariant = useMemo(
    () => product.variants?.find((variant) => variant.size === selectedSize),
    [product.variants, selectedSize]
  );

  const price = selectedVariant?.price ?? product.salePrice ?? product.price;
  const hasVariants = Boolean(product.variants?.length);
  const activeImage = selectedVariant?.image?.trim() || getProductPrimaryImage(product.images);
  const effectiveStock = selectedVariant?.stock ?? product.stock;

  function handleSizeChange(size: string) {
    if (selectedSizeProp === undefined) {
      setInternalSelectedSize(size);
    }

    onSelectedSizeChange?.(size);
  }

  const commitToCart = (nextPath: '/cart' | '/checkout') => {
    setProcessingAction(nextPath === '/cart' ? 'cart' : 'checkout');

    addItem({
      id: product._id,
      name: product.name,
      price,
      quantity: 1,
      size: selectedSize || undefined,
      image: activeImage,
    });

    router.push(nextPath);
  };

  return (
    <>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <p className="text-3xl font-semibold text-[var(--deep-black)]">{formatCurrency(price)}</p>
        {selectedVariant?.cutPrice && selectedVariant.cutPrice > price ? (
          <p className="text-lg text-[var(--foreground-soft)] line-through">
            {formatCurrency(selectedVariant.cutPrice)}
          </p>
        ) : product.salePrice && product.salePrice < product.price ? (
          <p className="text-lg text-[var(--foreground-soft)] line-through">
            {formatCurrency(product.price)}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">
        <span className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2">
          {effectiveStock > 5 ? 'In stock' : effectiveStock > 0 ? `Only ${effectiveStock} left` : 'Sold out'}
        </span>
        {product.features && product.features.length > 0 ? (
          product.features.map((feature: string, idx: number) => (
            <span key={idx} className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2">
              {feature}
            </span>
          ))
        ) : (
          <>
            <span className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2">
              Long lasting fragrance
            </span>
            <span className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2">
              Premium oils
            </span>
          </>
        )}
      </div>

      <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-[var(--foreground-soft)]">
        {product.description}
      </p>

      <div className="mt-10 flex flex-col gap-7">
        {hasVariants && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Size</h3>
              <span className="text-sm text-[var(--foreground)]">{selectedSize || 'Select a size'}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.variants?.map((variant) => (
                <button
                  key={variant.size}
                  type="button"
                  onClick={() => handleSizeChange(variant.size)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm',
                    selectedSize === variant.size
                      ? 'border-[var(--deep-black)] bg-[var(--deep-black)] text-white'
                      : 'border-[var(--border)] bg-white/75 text-[var(--foreground)] hover:border-[var(--deep-black)]'
                  )}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => commitToCart('/cart')}
            disabled={effectiveStock <= 0}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--deep-black)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--deep-black)] hover:bg-[var(--deep-black)] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ShoppingBag className="h-4 w-4" />
            {effectiveStock > 0 ? (processingAction === 'cart' ? 'Adding...' : 'Add to cart') : 'Out of stock'}
          </button>
          <button
            type="button"
            onClick={() => commitToCart('/checkout')}
            disabled={effectiveStock <= 0}
            className="gold-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Zap className="h-4 w-4" />
            {processingAction === 'checkout' ? 'Processing...' : 'Buy now'}
          </button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[rgba(255,255,255,0.94)] px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Blend Price</p>
            <p className="truncate text-lg font-semibold text-[var(--deep-black)]">{formatCurrency(price)}</p>
          </div>
          <button
            type="button"
            onClick={() => commitToCart('/cart')}
            disabled={effectiveStock <= 0}
            className="gold-button inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {effectiveStock > 0 ? 'Add to cart' : 'Sold out'}
          </button>
        </div>
      </div>
    </>
  );
}
