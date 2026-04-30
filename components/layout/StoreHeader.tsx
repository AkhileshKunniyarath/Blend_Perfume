'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BlendLogo } from '@/components/brand/BlendLogo';
import CartIcon from '@/components/ui/CartIcon';
import UserNav from '@/components/ui/UserNav';
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

type UserSession = {
  name: string;
  email: string;
  phone: string;
} | null;

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

// Returns true when the given href matches the current page + hash
function isActivePath(pathname: string, hash: string, href: string): boolean {
  // External links (mailto:, https:, etc.) are never active
  if (href.includes(':')) return false;

  // Hash-anchor links: active only when on the same base path AND same hash
  if (href.includes('#')) {
    const [hrefPath, hrefHash] = href.split('#');
    const basePath = hrefPath || '/';
    return pathname === basePath && hash === `#${hrefHash}`;
  }

  // Exact match for home
  if (href === '/') return pathname === '/';

  // Exact match for all other routes (avoids /products matching /product/[slug])
  return pathname === href;
}

// Returns true when a nav item (plain link or dropdown) is "active"
function isMenuActive(pathname: string, hash: string, item: MenuItem | undefined): boolean {
  if (!item) return false;
  if (item.href) return isActivePath(pathname, hash, item.href);
  // Dropdown: active when any child link is active
  return (
    item.groups?.some((group) =>
      group.links.some((link) => isActivePath(pathname, hash, link.href))
    ) ?? false
  );
}

export default function StoreHeader({
  categories,
  session,
}: {
  categories: NavCategory[];
  session: UserSession;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hash, setHash] = useState('');

  // Single effect: syncs hash from URL on non-home pages,
  // and runs scroll-spy on the homepage.
  useEffect(() => {
    if (pathname !== '/') {
      setHash(window.location.hash || '');
      return;
    }

    // On homepage: seed from URL hash first (handles direct links like /#best-sellers)
    if (window.location.hash) {
      setHash(window.location.hash);
    }

    const sectionIds = ['best-sellers', 'collections', 'story', 'testimonials'];

    const handleScroll = () => {
      if (window.scrollY < 80) {
        setHash('');
        return;
      }

      const mid = window.innerHeight / 2;
      let closest: string | null = null;
      let closestDist = Infinity;

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        const dist = Math.abs(top - mid);
        if (top <= mid + 100 && dist < closestDist) {
          closestDist = dist;
          closest = id;
        }
      });

      setHash(closest ? `#${closest}` : '');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // When a nav link is clicked, immediately sync the hash so active state updates
  function handleNavClick(href: string) {
    if (href.includes('#')) {
      const hashPart = '#' + href.split('#')[1];
      setHash(hashPart);
    } else {
      setHash('');
    }
    setMobileOpen(false);
  }

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
          onClick={() => { setMobileOpen(false); setHash(''); }}
          aria-label="Blend Perfume home"
        >
          <BlendLogo className="w-24 sm:w-28" />
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-2 md:flex">
          {menuItems.map((item) =>
            item.groups ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                {/* Dropdown trigger */}
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm',
                    openMenu === item.label || isMenuActive(pathname, hash, item)
                      ? 'bg-[var(--deep-black)] text-white'
                      : 'text-[var(--foreground-soft)] hover:bg-white/70 hover:text-[var(--deep-black)]'
                  )}
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown panel */}
                <div
                  className={cn(
                    'absolute left-1/2 top-full w-[46rem] -translate-x-1/2 pt-3 transition-all duration-150',
                    openMenu === item.label
                      ? 'pointer-events-auto opacity-100'
                      : 'pointer-events-none opacity-0'
                  )}
                >
                  <div className="luxury-panel rounded-[2rem] p-4">
                    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {item.groups.map((group) => (
                          <div
                            key={group.title}
                            className="rounded-[1.5rem] border border-white/50 bg-white/52 p-3"
                          >
                            <p className="px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-soft)]">
                              {group.title}
                            </p>
                            <div className="space-y-1">
                              {group.links.map((child) => {
                                const active = isActivePath(pathname, hash, child.href);
                                return (
                                  <Link
                                    key={child.href + child.label}
                                    href={child.href}
                                    onClick={() => handleNavClick(child.href)}
                                    className={cn(
                                      'block rounded-[1rem] px-3 py-3',
                                      active
                                        ? 'bg-[var(--deep-black)] text-white'
                                        : 'text-[var(--foreground)] hover:bg-[var(--background-strong)]'
                                    )}
                                  >
                                    <p className="text-sm font-medium">{child.label}</p>
                                    {child.description && (
                                      <p
                                        className={cn(
                                          'mt-1 text-xs leading-5',
                                          active
                                            ? 'text-white/72'
                                            : 'text-[var(--foreground-soft)]'
                                        )}
                                      >
                                        {child.description}
                                      </p>
                                    )}
                                  </Link>
                                );
                              })}
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
                onClick={() => handleNavClick(item.href || '/')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm',
                  isMenuActive(pathname, hash, item)
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
          <UserNav session={session} />
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

      {/* ── Mobile nav ── */}
      {mobileOpen && (
        <div className="border-t border-white/45 md:hidden">
          <div className="section-shell py-4">
            <div className="luxury-panel rounded-[1.8rem] p-4">
              <div className="space-y-2">
                {menuItems.map((item) =>
                  item.groups ? (
                    <div
                      key={item.label}
                      className="rounded-[1.3rem] border border-white/55 bg-white/58 p-2"
                    >
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
                              {group.links.map((child) => {
                                const active = isActivePath(pathname, hash, child.href);
                                return (
                                  <Link
                                    key={child.href + child.label}
                                    href={child.href}
                                    onClick={() => handleNavClick(child.href)}
                                    className={cn(
                                      'block rounded-[1rem] px-3 py-3',
                                      active
                                        ? 'bg-[var(--deep-black)] text-white'
                                        : 'text-[var(--foreground)] hover:bg-[var(--background-strong)]'
                                    )}
                                  >
                                    <p className="text-sm font-medium">{child.label}</p>
                                    {child.description && (
                                      <p
                                        className={cn(
                                          'mt-1 text-xs leading-5',
                                          active
                                            ? 'text-white/72'
                                            : 'text-[var(--foreground-soft)]'
                                        )}
                                      >
                                        {child.description}
                                      </p>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href || '/'}
                      onClick={() => handleNavClick(item.href || '/')}
                      className={cn(
                        'block rounded-[1.2rem] px-4 py-3 text-sm',
                        isMenuActive(pathname, hash, item)
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
