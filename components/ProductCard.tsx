'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { formatCurrency, cn } from '@/lib/utils';
import {
  getEffectivePrice,
  getProductPrimaryImage,
  getValidProductImages,
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const price = getEffectivePrice(product);
  const defaultVariant = product.variants?.[0];
  const validImages = getValidProductImages(product.images);
  const primaryImage = validImages[0] || getProductPrimaryImage([]);

  const totalStock = product.variants && product.variants.length > 0
    ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
    : (product.stock || 0);

  const handleAddToCart = () => {
    if (totalStock <= 0) return;
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#f7f7f7] transition-shadow duration-300 hover:shadow-md">
      <div
        className="relative w-full overflow-hidden touch-pan-y"
        onMouseMove={(e) => {
          if (validImages.length > 1) {
            const rect = e.currentTarget.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const targetIndex = Math.min(validImages.length - 1, Math.floor(progress * validImages.length));
            if (targetIndex !== activeIndex) {
              setActiveIndex(targetIndex);
            }
          }
        }}
        onMouseLeave={() => {
          if (validImages.length > 1) {
            setActiveIndex(0);
          }
        }}
        onTouchStart={(e) => {
          setTouchStartX(e.touches[0].clientX);
        }}
        onTouchEnd={(e) => {
          if (touchStartX !== null) {
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchStartX - touchEndX;
            if (deltaX > 40 && activeIndex < validImages.length - 1) {
              setActiveIndex((prev) => prev + 1); // Swipe left
            } else if (deltaX < -40 && activeIndex > 0) {
              setActiveIndex((prev) => prev - 1); // Swipe right
            }
            setTouchStartX(null);
          }
        }}
      >
        {totalStock <= 0 && (
          <div className="absolute left-3 top-3 z-30 rounded bg-[var(--deep-black)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Sold Out
          </div>
        )}

        {validImages.length > 1 ? (
          <div className={cn("relative aspect-square w-full", totalStock <= 0 && "opacity-75 grayscale-[0.4]")}>
            <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10 block" />
            {validImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} - image ${idx + 1}`}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.25,1,0.5,1)]",
                  idx === activeIndex 
                    ? "translate-x-0 scale-100" 
                    : idx < activeIndex 
                      ? "-translate-x-full scale-[0.98]" 
                      : "translate-x-full scale-[0.98]"
                )}
              />
            ))}

            {/* Subtle gradient overlay & dots at bottom */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-16 bg-gradient-to-t from-[rgba(15,15,15,0.15)] to-transparent opacity-0 transition-opacity duration-[600ms] group-hover:opacity-100" />
            <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 opacity-0 transition-opacity duration-[600ms] group-hover:opacity-100">
              {validImages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "h-1 rounded-full shadow-sm transition-all duration-[600ms]",
                    idx === activeIndex ? "w-3 bg-white" : "w-1.5 bg-white/50"
                  )} 
                />
              ))}
            </div>
          </div>
        ) : (
          <Link href={`/product/${product.slug}`} className={cn("block relative aspect-square w-full group-hover:opacity-95 transition-opacity", totalStock <= 0 && "opacity-75 grayscale-[0.4]")}>
            <img
              src={primaryImage}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.02]"
            />
          </Link>
        )}
      </div>

      <div className="flex flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col flex-1 gap-1.5">
            <Link 
              href={`/product/${product.slug}`} 
              className="font-poppins text-lg font-medium tracking-wide leading-snug text-[var(--deep-black)] transition-colors hover:text-[var(--accent-strong)]"
            >
              {product.name}
            </Link>
            <p className={cn(
              "text-[10px] font-semibold tracking-wider uppercase",
              totalStock <= 0 ? "text-red-600" : (totalStock <= 5 ? "text-amber-600" : "text-green-700")
            )}>
              {totalStock <= 0 ? 'Out of Stock' : (totalStock <= 5 ? `Only ${totalStock} Left` : 'In Stock')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-[var(--foreground-soft)]">
              {product.variants && product.variants.length > 0 ? (
                <>From {formatCurrency(price)}</>
              ) : (
                <>{formatCurrency(price)}</>
              )}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
