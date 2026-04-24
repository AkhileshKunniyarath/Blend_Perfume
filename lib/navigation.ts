export type NavigationLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavigationGroup = {
  title: string;
  links: NavigationLink[];
};

export const DISCOVERY_LINKS: NavigationLink[] = [
  {
    label: 'All Fragrances',
    href: '/products',
    description: 'Browse the complete Blend perfume catalogue.',
  },
  {
    label: 'Best Sellers',
    href: '/#best-sellers',
    description: 'Signature scents customers return to most.',
  },
  {
    label: 'Explore Collection',
    href: '/#collections',
    description: 'Shop by mood, direction, and fragrance style.',
  },
];

export const PAGE_LINKS: NavigationLink[] = [
  {
    label: 'Our Story',
    href: '/#story',
    description: 'The Blend philosophy and premium oil craft.',
  },
  {
    label: 'Testimonials',
    href: '/#testimonials',
    description: 'What fragrance lovers say about the experience.',
  },
  {
    label: 'Cart',
    href: '/cart',
    description: 'Review items before checkout.',
  },
  {
    label: 'Checkout',
    href: '/checkout',
    description: 'Move quickly from discovery to purchase.',
  },
];

export const SUPPORT_LINKS: NavigationLink[] = [
  {
    label: 'Contact',
    href: 'mailto:hello@blendperfume.com',
    description: 'Reach the Blend team for assistance.',
  },
  {
    label: 'Newsletter',
    href: 'mailto:hello@blendperfume.com?subject=Blend%20Newsletter',
    description: 'Get launch drops and fragrance stories first.',
  },
];
