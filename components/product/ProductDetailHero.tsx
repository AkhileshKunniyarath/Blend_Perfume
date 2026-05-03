'use client';

import { useMemo, useState } from 'react';
import AddToCartButton from '@/components/product/AddToCartButton';
import ProductGallery from '@/components/product/ProductGallery';
import { getValidProductImages, type ProductVariant, type StorefrontProduct } from '@/lib/storefront';

type ProductDetailHeroProduct = StorefrontProduct & {
  features?: string[];
  categoryId?: {
    _id?: string;
    name?: string;
    slug?: string;
  } | string;
  variants?: ProductVariant[];
};

export default function ProductDetailHero({ product }: { product: ProductDetailHeroProduct }) {
  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size || '');

  const selectedVariant = useMemo(
    () => product.variants?.find((variant) => variant.size === selectedSize),
    [product.variants, selectedSize]
  );

  const orderedImages = useMemo(
    () => getValidProductImages([selectedVariant?.image || '', ...(product.images || [])]),
    [product.images, selectedVariant?.image]
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
      <ProductGallery
        key={selectedVariant?.size || 'default'}
        images={orderedImages}
        name={product.name}
      />

      <div className="luxury-panel rounded-[2.4rem] p-6 sm:p-8 lg:p-10">
        <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">
          {typeof product.categoryId === 'object' && product.categoryId?.name
            ? product.categoryId.name
            : 'Blend Perfume'}
        </p>
        <h1 className="mt-4 text-4xl text-[var(--deep-black)] sm:text-5xl">
          {product.name}
        </h1>

        <AddToCartButton
          product={product}
          selectedSize={selectedSize}
          onSelectedSizeChange={setSelectedSize}
        />

        <div className="mt-10 grid gap-4 border-t border-[var(--border)] pt-8 sm:grid-cols-3">
          {product.features && product.features.length > 0 ? (
            product.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="rounded-[1.5rem] border border-white/60 bg-white/58 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Feature</p>
                <p className="mt-2 text-lg text-[var(--deep-black)]">{feature}</p>
              </div>
            ))
          ) : (
            <>
              <div className="rounded-[1.5rem] border border-white/60 bg-white/58 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Type</p>
                <p className="mt-2 text-lg text-[var(--deep-black)]">
                  {typeof product.categoryId === 'object' && product.categoryId?.name
                    ? product.categoryId.name
                    : 'Premium Fragrance'}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/60 bg-white/58 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Sizes</p>
                <p className="mt-2 text-lg text-[var(--deep-black)]">
                  {product.variants?.length
                    ? product.variants.map((variant) => variant.size).join(', ')
                    : 'Standard'}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/60 bg-white/58 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Availability</p>
                <p className="mt-2 text-lg text-[var(--deep-black)]">
                  {(product as { stock?: number }).stock && (product as { stock?: number }).stock! > 0
                    ? 'In Stock'
                    : 'Sold Out'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
