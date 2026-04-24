'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [activeImage, setActiveImage] = useState(images[0] || '');

  return (
    <div className="grid gap-4 lg:grid-cols-[6rem_1fr]">
      {images.length > 1 && (
        <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
          {images.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(image)}
              className={cn(
                'overflow-hidden rounded-[1.25rem] border bg-white/70',
                activeImage === image ? 'border-[var(--deep-black)]' : 'border-[var(--border)]'
              )}
            >
              <img src={image} alt={`${name} thumbnail`} className="h-20 w-20 object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="order-1 luxury-panel overflow-hidden rounded-[2.2rem] p-3 lg:order-2">
        {activeImage ? (
          <img src={activeImage} alt={name} className="aspect-[4/4.8] w-full rounded-[1.7rem] object-cover" />
        ) : (
          <div className="aspect-[4/4.8] w-full rounded-[1.7rem] bg-[radial-gradient(circle_at_top,#f8f3ea,#e1d4c0)]" />
        )}
      </div>
    </div>
  );
}
