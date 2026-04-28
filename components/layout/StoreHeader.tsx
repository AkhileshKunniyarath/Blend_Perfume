'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { BlendLogo } from '@/components/brand/BlendLogo';
import CartIcon from '@/components/ui/CartIcon';
import { cn } from '@/lib/utils';
import {
  DISCOVERY_LINKS,
  PAGE_LINKS,
  SUPPORT_LINKS,
  type NavigationGroup,
} from '@/lib/navigation';

type NavCategory = {
  _id: string;
  name: string;
  slug: string;
};

type MenuItem = {
  label: string;
  href?: string;
  groups?: NavigationGroup[];
  featured?: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
  };
};

function isActivePath(pathname: string, href: string) {
  if (href.startsWith('/#')) {
    return pathname === '/';
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname.startsWith(href);
}

export default function StoreHeader({ categories }: { categories: NavCategory[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const categoryLinks = categories.slice(0, 8).map((category) => ({
    label: category.name,
    href: `/category/${category.slug}`,
    description: `Explore the ${category.name.toLowerCase()} fragrance edit.`,
  }));

  const menuItems: MenuItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    {
      label: 'Shop',
      groups: [
        {
          title: 'Discovery',
          links: DISCOVERY_LINKS,
        },
        {
          title: 'Quick Paths',
          links: [
            {
              label: 'Gift-worthy Picks',
              href: '/#testimonials',
              description: 'Browse social proof and gifting inspiration.',
            },
            {
              label: 'Category Collections',
              href: '/#collections',
              description: 'Move directly into curated collection themes.',
            },
          ],
        },
      ],
      featured: {
        eyebrow: 'Signature Edit',
        title: 'Craft your signature scent',
        description: 'Start with best sellers, then explore categories and mood-based collections.',
        href: '/products',
      },
    },
    {
      label: 'Categories',
      groups: [
        {
          title: 'Collections',
          links: categoryLinks,
        },
      ],
      featured: {
        eyebrow: 'Collections',
        title: 'Shop by fragrance direction',
        description: 'Browse the catalogue through signature collections inspired by mood, wear, and identity.',
        href: '/#collections',
      },
    },
    {
      label: 'Pages',
      groups: [
        {
          title: 'Brand & Journey',
          links: PAGE_LINKS,
        },
        {
          title: 'Support',
          links: SUPPORT_LINKS,
        },
      ],
      featured: {
        eyebrow: 'Blend House',
        title: 'More than a storefront',
        description: 'Use the header to move between story, trust, checkout, and support touchpoints.',
        href: '/#story',
      },
    },
    { label: 'Cart', href: '/cart' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/45 bg-[rgba(245,241,234,0.82)] backdrop-blur-xl">
      <div className="section-shell flex min-h-18 items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="min-w-fit"
          onClick={() => setMobileOpen(false)}
          aria-label="Blend Perfume home"
        >
          <BlendLogo className="w-24 sm:w-28" />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {menuItems.map((item) =>
            item.groups ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu((current) => (current === item.label ? null : current))}
              >
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm',
                    openMenu === item.label
                      ? 'bg-white/80 text-[var(--deep-black)]'
                      : 'text-[var(--foreground-soft)] hover:bg-white/70 hover:text-[var(--deep-black)]'
                  )}
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4" />
                </button>

                <div
                  className={cn(
                    'absolute left-1/2 top-full w-[46rem] -translate-x-1/2 pt-3 transition-all',
                    openMenu === item.label ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                  )}
                >
                  <div className="luxury-panel rounded-[2rem] p-4">
                    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {item.groups.map((group) => (
                          <div key={group.title} className="rounded-[1.5rem] border border-white/50 bg-white/52 p-3">
                            <p className="px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-soft)]">
                              {group.title}
                            </p>
                            <div className="space-y-1">
                              {group.links.map((child) => (
                                <Link
                                  key={child.href + child.label}
                                  href={child.href}
                                  className={cn(
                                    'block rounded-[1rem] px-3 py-3',
                                    isActivePath(pathname, child.href)
                                      ? 'bg-[var(--deep-black)] text-white'
                                      : 'text-[var(--foreground)] hover:bg-[var(--background-strong)]'
                                  )}
                                >
                                  <p className="text-sm font-medium">{child.label}</p>
                                  {child.description && (
                                    <p className={cn(
                                      'mt-1 text-xs leading-5',
                                      isActivePath(pathname, child.href) ? 'text-white/72' : 'text-[var(--foreground-soft)]'
                                    )}>
                                      {child.description}
                                    </p>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {item.featured && (
                        <Link
                          href={item.featured.href}
                          className="rounded-[1.6rem] bg-[linear-gradient(160deg,#171717,#5c4731)] p-6 text-white"
                        >
                          <p className="text-[10px] uppercase tracking-[0.34em] text-white/65">
                            {item.featured.eyebrow}
                          </p>
                          <h3 className="mt-4 font-display text-3xl">{item.featured.title}</h3>
                          <p className="mt-4 text-sm leading-7 text-white/72">
                            {item.featured.description}
                          </p>
                          <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">
                            Explore
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href || '/'}
                className={cn(
                  'rounded-full px-4 py-2 text-sm',
                  isActivePath(pathname, item.href || '/')
                    ? 'bg-[var(--deep-black)] text-white'
                    : 'text-[var(--foreground-soft)] hover:bg-white/70 hover:text-[var(--deep-black)]'
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-white/60 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[var(--foreground-soft)] sm:block">
            Premium Oils
          </div>
          <CartIcon />
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/72 text-[var(--deep-black)] md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/45 md:hidden">
          <div className="section-shell py-4">
            <div className="luxury-panel rounded-[1.8rem] p-4">
              <div className="space-y-2">
                {menuItems.map((item) =>
                  item.groups ? (
                    <div key={item.label} className="rounded-[1.3rem] border border-white/55 bg-white/58 p-2">
                      <p className="px-3 py-2 text-xs uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
                        {item.label}
                      </p>
                      <div className="space-y-3">
                        {item.groups.map((group) => (
                          <div key={group.title}>
                            <p className="px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
                              {group.title}
                            </p>
                            <div className="space-y-1">
                              {group.links.map((child) => (
                                <Link
                                  key={child.href + child.label}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={cn(
                                    'block rounded-[1rem] px-3 py-3',
                                    isActivePath(pathname, child.href)
                                      ? 'bg-[var(--deep-black)] text-white'
                                      : 'text-[var(--foreground)] hover:bg-[var(--background-strong)]'
                                  )}
                                >
                                  <p className="text-sm font-medium">{child.label}</p>
                                  {child.description && (
                                    <p className={cn(
                                      'mt-1 text-xs leading-5',
                                      isActivePath(pathname, child.href) ? 'text-white/72' : 'text-[var(--foreground-soft)]'
                                    )}>
                                      {child.description}
                                    </p>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href || '/'}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block rounded-[1.2rem] px-4 py-3 text-sm',
                        isActivePath(pathname, item.href || '/')
                          ? 'bg-[var(--deep-black)] text-white'
                          : 'bg-white/58 text-[var(--foreground)]'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
