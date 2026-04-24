import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeroBannerProps = {
  title?: string;
  data: {
    imageUrl?: string;
    subtitle?: string;
    eyebrow?: string;
    buttonText?: string;
    link?: string;
    alignment?: 'left' | 'center' | 'right';
    overlayOpacity?: number;
  };
};

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

export default function HeroBanner({ title, data }: HeroBannerProps) {
  const overlayOpacity = Math.max(18, Math.min(data.overlayOpacity ?? 42, 72));
  const alignment = data.alignment ?? 'left';

  return (
    <section className="section-shell pt-6 sm:pt-8">
      <div className="soft-fade-up relative min-h-[76vh] overflow-hidden rounded-[2.4rem] border border-white/45 bg-[var(--deep-black)] shadow-[0_36px_80px_rgba(15,15,15,0.18)]">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={title || 'Blend Perfume hero'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] ease-out hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#5c4d3f,transparent_34%),linear-gradient(135deg,#161616,#40352a_50%,#171717)]" />
        )}

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, rgba(15,15,15,${overlayOpacity / 100}) 0%, rgba(15,15,15,${overlayOpacity / 100 - 0.14}) 46%, rgba(15,15,15,0.12) 100%)`,
          }}
        />

        <div className="relative flex min-h-[76vh] px-6 py-12 sm:px-10 lg:px-16">
          <div className={cn('flex max-w-2xl flex-1 justify-center', alignmentClasses[alignment])}>
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.42em] text-white/70">
                {data.eyebrow || 'Blend Perfume'}
              </p>
              <h1 className="mt-5 text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                {title || 'Craft Your Signature Scent'}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/82 sm:text-lg">
                {data.subtitle || 'Premium fragrance storytelling built around depth, elegance, and modern everyday luxury.'}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={data.link || '/'}
                  className="gold-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
                >
                  {data.buttonText || 'Shop Now'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="rounded-full border border-white/28 bg-white/10 px-5 py-3 text-sm text-white/80 backdrop-blur">
                  Crafted with premium oils
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
