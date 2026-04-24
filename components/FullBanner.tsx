import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type FullBannerProps = {
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

export default function FullBanner({ title, data }: FullBannerProps) {
  const overlayOpacity = Math.max(18, Math.min(data.overlayOpacity ?? 36, 72));
  const alignment = data.alignment ?? 'center';

  return (
    <section className="section-shell py-18 sm:py-24">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/45 bg-[var(--deep-black)]">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={title || 'Blend banner'} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#1b1b1b,#6b573e,#191919)]" />
        )}

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(15,15,15,${overlayOpacity / 100}) 0%, rgba(15,15,15,${overlayOpacity / 100 - 0.12}) 100%)`,
          }}
        />

        <div className={cn('relative flex min-h-[28rem] justify-center px-8 py-14 sm:px-12', alignmentClasses[alignment])}>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">{data.eyebrow || 'Long Lasting Fragrance'}</p>
            <h2 className="mt-4 text-4xl text-white sm:text-5xl">{title || 'Long Lasting Fragrance'}</h2>
            <p className="mt-5 text-base leading-7 text-white/78 sm:text-lg">
              {data.subtitle || 'A refined fragrance profile with a smooth opening, expressive heart, and memorable dry down.'}
            </p>
            <Link
              href={data.link || '/'}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white backdrop-blur hover:bg-white hover:text-[var(--deep-black)]"
            >
              {data.buttonText || 'Discover'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
