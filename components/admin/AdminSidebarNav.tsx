'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/inventory', label: 'Inventory' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/widgets', label: 'Widgets' },
  { href: '/admin/crm', label: 'CRM' },
];

function isActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export default function AdminSidebarNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={mobile ? 'grid grid-cols-2 gap-2 sm:grid-cols-3' : 'space-y-2'}>
      {navigationItems.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group block rounded-2xl border px-4 py-3 text-sm font-medium',
              active
                ? 'border-[rgba(15,15,15,0.12)] bg-[var(--deep-black)] text-white shadow-[0_20px_45px_rgba(15,15,15,0.18)]'
                : 'border-black/6 bg-white/70 text-[var(--foreground-soft)] hover:border-[rgba(171,132,81,0.28)] hover:bg-white hover:text-[var(--deep-black)]'
            )}
          >
            <span className="block tracking-[0.01em]">{item.label}</span>
            <span
              className={cn(
                'mt-1 block text-[10px] uppercase tracking-[0.26em]',
                active ? 'text-white/70' : 'text-[var(--foreground-soft)]/65 group-hover:text-[var(--accent-strong)]'
              )}
            >
              Manage
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
