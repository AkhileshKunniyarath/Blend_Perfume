'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  HERO_BANNER_AUTOPLAY_MS,
  getDefaultHeroSlide,
  getHeroSlides,
  type WidgetData,
} from '@/lib/widgets';

type HeroBannerProps = {
  title?: string;
  data: WidgetData;
};

const alignmentClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
};

export default function HeroBanner({ title, data }: HeroBannerProps) {
  const slides = getHeroSlides(data, title);
  const visibleSlides = slides.length > 0 ? slides : [getDefaultHeroSlide()];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasUserPaused, setHasUserPaused] = useState(false);
  const activeSlideIndex = currentSlide % visibleSlides.length;
  const isAutoPlaying = !hasUserPaused && visibleSlides.length > 1;

  useEffect(() => {
    if (!isAutoPlaying || visibleSlides.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentSlide((activeSlide) => (activeSlide + 1) % visibleSlides.length);
    }, HERO_BANNER_AUTOPLAY_MS);

    return () => window.clearInterval(intervalId);
  }, [isAutoPlaying, visibleSlides.length]);

  return (
    <section className="section-shell pt-6 sm:pt-8">
      <div className="soft-fade-up relative min-h-[76vh] overflow-hidden rounded-[2.4rem] border border-white/45 bg-[var(--deep-black)] shadow-[0_36px_80px_rgba(15,15,15,0.18)]">
        {visibleSlides.map((slide, index) => {
          const fallbackSlide = getDefaultHeroSlide();
          const overlayOpacity = Math.max(18, Math.min(slide.overlayOpacity ?? fallbackSlide.overlayOpacity ?? 42, 72));
          const alignment = slide.alignment ?? fallbackSlide.alignment ?? 'left';
          const heading = slide.heading || title || fallbackSlide.heading;
          const eyebrow = slide.eyebrow || fallbackSlide.eyebrow;
          const subtitle = slide.subtitle || fallbackSlide.subtitle;
          const buttonText = slide.buttonText || fallbackSlide.buttonText;
          const link = slide.link || fallbackSlide.link || '/';
          const isActive = index === activeSlideIndex;

          return (
            <div
              key={`${slide.imageUrl || 'hero-slide'}-${index}`}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-out',
                isActive ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
              aria-hidden={!isActive}
            >
              {slide.imageUrl ? (
                <picture>
                  {slide.mobileImageUrl ? <source media="(max-width: 640px)" srcSet={slide.mobileImageUrl} /> : null}
                  <img
                    src={slide.imageUrl}
                    alt={heading || 'Blend Perfume hero'}
                    className={cn(
                      'absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] ease-out',
                      isActive ? 'scale-100' : 'scale-[1.02]'
                    )}
                  />
                </picture>
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
                      {eyebrow}
                    </p>
                    <h1 className="mt-5 text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                      {heading}
                    </h1>
                    <p className="mt-6 max-w-lg text-base leading-7 text-white/82 sm:text-lg">
                      {subtitle}
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <Link
                        href={link}
                        className="gold-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
                      >
                        {buttonText}
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
          );
        })}

        {visibleSlides.length > 1 ? (
          <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center px-6">
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/25 px-4 py-3 backdrop-blur">
              {visibleSlides.map((slide, index) => (
                <button
                  key={`${slide.heading || 'slide-dot'}-${index}`}
                  type="button"
                  onClick={() => {
                    setCurrentSlide(index);
                    setHasUserPaused(true);
                  }}
                  aria-label={`Go to hero slide ${index + 1}`}
                  aria-pressed={index === activeSlideIndex}
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-300',
                    index === activeSlideIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/75'
                  )}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
