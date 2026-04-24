import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SplitBannerProps = {
  title?: string;
  data: {
    imageUrl?: string;
    subtitle?: string;
    eyebrow?: string;
    buttonText?: string;
    link?: string;
    reverse?: boolean;
  };
};

export default function SplitBanner({ title, data }: SplitBannerProps) {
  return (
    <section className="section-shell py-18 sm:py-24">
      <div className="luxury-panel overflow-hidden rounded-[2.4rem]">
        <div className={cn('grid items-stretch lg:grid-cols-2', data.reverse && 'lg:[&>*:first-child]:order-2')}>
          <div className="relative min-h-[22rem]">
            {data.imageUrl ? (
              <img src={data.imageUrl} alt={title || 'Blend campaign'} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#dac39e,transparent_34%),linear-gradient(135deg,#25231e,#74614a)]" />
            )}
          </div>

          <div className="flex items-center px-8 py-12 sm:px-12 lg:px-14">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">
                {data.eyebrow || 'Layered Luxury'}
              </p>
              <h2 className="mt-4 text-4xl text-[var(--deep-black)] sm:text-5xl">
                {title || 'A ritual that feels intentional'}
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--foreground-soft)] sm:text-lg">
                {data.subtitle || 'Pair elevated presentation with enduring scent composition for a signature experience.'}
              </p>
              <Link
                href={data.link || '/'}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--deep-black)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--deep-black)] hover:bg-[var(--deep-black)] hover:text-white"
              >
                {data.buttonText || 'Explore'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
