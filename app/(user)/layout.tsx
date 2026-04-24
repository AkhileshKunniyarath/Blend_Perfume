import React from 'react';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import StoreHeader from '@/components/layout/StoreHeader';

export const dynamic = 'force-dynamic';

async function getHeaderCategories() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}, { name: 1, slug: 1 })
      .sort({ createdAt: 1, _id: 1 })
      .limit(6)
      .lean();

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error('Error fetching header categories:', error);
    return [];
  }
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getHeaderCategories();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <StoreHeader categories={categories} />

      <main className="flex-grow">
        {children}
      </main>

      <footer className="mt-10 border-t border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.8))]">
        <div className="section-shell grid gap-10 py-14 lg:grid-cols-[1.1fr_0.7fr_0.7fr_1fr]">
          <div>
            <p className="font-display text-4xl text-[var(--deep-black)]">Blend</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--foreground-soft)]">
              Clean luxury fragrances with expressive storytelling, refined ingredients, and a premium ritual from first spray to dry down.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">Explore</p>
            <div className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
              <Link href="/" className="block hover:text-[var(--accent-strong)]">Homepage</Link>
              <Link href="/products" className="block hover:text-[var(--accent-strong)]">All Products</Link>
              <Link href="/#best-sellers" className="block hover:text-[var(--accent-strong)]">Best Sellers</Link>
              <Link href="/cart" className="block hover:text-[var(--accent-strong)]">Cart</Link>
              <Link href="/checkout" className="block hover:text-[var(--accent-strong)]">Checkout</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">Contact</p>
            <div className="mt-4 space-y-3 text-sm text-[var(--foreground)]">
              <a href="mailto:hello@blendperfume.com" className="block hover:text-[var(--accent-strong)]">
                hello@blendperfume.com
              </a>
              <a href="tel:+910000000000" className="block hover:text-[var(--accent-strong)]">
                +91 00000 00000
              </a>
              <a href="https://instagram.com" className="block hover:text-[var(--accent-strong)]">
                Instagram
              </a>
              <a href="https://facebook.com" className="block hover:text-[var(--accent-strong)]">
                Facebook
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">Newsletter</p>
            <div className="luxury-panel mt-4 rounded-[1.75rem] p-5">
              <p className="text-sm leading-7 text-[var(--foreground-soft)]">
                Receive launch drops, best seller alerts, and fragrance stories in your inbox.
              </p>
              <a
                href="mailto:hello@blendperfume.com?subject=Blend%20Newsletter"
                className="gold-button mt-5 inline-flex rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
              >
                Join Newsletter
              </a>
            </div>
          </div>
        </div>

        <div className="section-shell border-t border-[var(--border)] py-5 text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)]">
          © {new Date().getFullYear()} Blend Perfume. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
