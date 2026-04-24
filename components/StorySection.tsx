import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

type StorySectionProps = {
  title?: string;
  data: {
    imageUrl?: string;
    subtitle?: string;
    eyebrow?: string;
    buttonText?: string;
    link?: string;
    points?: string[];
  };
};

export default function StorySection({ title, data }: StorySectionProps) {
  const points = data.points?.filter(Boolean) ?? [];

  return (
    <section id="story" className="section-shell py-18 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="luxury-panel overflow-hidden rounded-[2.4rem]">
          <div className="grid md:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[20rem]">
              {data.imageUrl ? (
                <img src={data.imageUrl} alt={title || 'Our story'} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#dcc9a8,transparent_33%),linear-gradient(145deg,#171717,#564838)]" />
              )}
            </div>
            <div className="px-8 py-10 sm:px-10 sm:py-12">
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">
                {data.eyebrow || 'Our Story'}
              </p>
              <h2 className="mt-4 text-4xl text-[var(--deep-black)] sm:text-5xl">
                {title || 'Crafted with premium oils'}
              </h2>
              <p className="mt-5 text-base leading-7 text-[var(--foreground-soft)]">
                {data.subtitle || 'Perfume is emotion. Blend is designed as a sensory ritual that feels polished, personal, and lasting.'}
              </p>
            </div>
          </div>
        </div>

        <div className="luxury-panel rounded-[2.4rem] p-8 sm:p-10">
          <p className="text-sm uppercase tracking-[0.34em] text-[var(--foreground-soft)]">Why it resonates</p>
          <div className="mt-6 space-y-4">
            {points.map((point) => (
              <div key={point} className="flex gap-3 rounded-[1.5rem] border border-white/60 bg-white/55 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--accent-strong)]" />
                <p className="text-sm leading-7 text-[var(--foreground)]">{point}</p>
              </div>
            ))}
          </div>
          <Link
            href={data.link || '/'}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--deep-black)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--deep-black)] hover:bg-[var(--deep-black)] hover:text-white"
          >
            {data.buttonText || 'Read More'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
