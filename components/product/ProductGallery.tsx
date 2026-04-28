'use client';

import { useState } from 'react';
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getValidProductImages,
} from '@/lib/storefront';
import { cn } from '@/lib/utils';

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const galleryImages = getValidProductImages(images);
  const hasImages = galleryImages.length > 0;
  const hasThumbnailRail = galleryImages.length > 1;
  const primaryImage = galleryImages[0] || PRODUCT_IMAGE_PLACEHOLDER;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const activeImage =
    selectedImage && galleryImages.includes(selectedImage) ? selectedImage : primaryImage;

  return (
    <div className="grid gap-4">
      <div className="order-1 luxury-panel overflow-hidden rounded-[2.2rem] p-3 lg:order-2">
        {hasImages ? (
          <img
            src={activeImage}
            alt={name}
            className="aspect-[4/4.8] w-full rounded-[1.7rem] object-cover"
          />
        ) : (
          <img
            src={PRODUCT_IMAGE_PLACEHOLDER}
            alt={`${name} placeholder`}
            className="aspect-[4/4.8] w-full rounded-[1.7rem] object-cover"
          />
        )}
      </div>

      {hasThumbnailRail && (
        <div className="order-2 flex gap-3 overflow-x-auto overflow-y-hidden px-1 pb-1">
          {galleryImages.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={cn(
                'h-28 w-28 shrink-0 overflow-hidden rounded-[1.25rem] border bg-white/70 shadow-sm transition-colors sm:h-32 sm:w-32 lg:h-36 lg:w-36',
                activeImage === image ? 'border-[var(--deep-black)]' : 'border-[var(--border)]'
              )}
            >
              <img
                src={image}
                alt={`${name} thumbnail`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
