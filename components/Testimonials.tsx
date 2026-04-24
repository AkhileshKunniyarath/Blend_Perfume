import { Quote } from 'lucide-react';
import type { TestimonialItem } from '@/lib/widgets';

type TestimonialsProps = {
  title?: string;
  subtitle?: string;
  items: TestimonialItem[];
};

export default function Testimonials({ title, subtitle, items }: TestimonialsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="section-shell py-18 sm:py-24">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Testimonials</p>
        <h2 className="mt-3 text-4xl text-[var(--deep-black)] sm:text-5xl">{title || 'Loved by fragrance lovers'}</h2>
        {subtitle && <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--foreground-soft)]">{subtitle}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {items.map((item) => (
          <article key={`${item.author}-${item.quote}`} className="luxury-panel rounded-[2rem] p-7">
            <Quote className="h-8 w-8 text-[var(--accent-strong)]" />
            <p className="mt-6 text-lg leading-8 text-[var(--foreground)]">
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="mt-8">
              <p className="text-base font-semibold text-[var(--deep-black)]">{item.author}</p>
              {item.role && <p className="text-sm text-[var(--foreground-soft)]">{item.role}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
