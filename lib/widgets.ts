export const WIDGET_TYPES = [
  'HERO_BANNER',
  'CATEGORY_GRID',
  'HORIZONTAL_PRODUCT',
  'FULL_BANNER',
  'VERTICAL_PRODUCT_GRID',
  'HALF_BANNER',
  'STORY_SECTION',
  'TESTIMONIALS',
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export type TestimonialItem = {
  quote: string;
  author: string;
  role?: string;
};

export type HeroSlide = {
  imageUrl?: string;
  mobileImageUrl?: string;
  heading?: string;
  subtitle?: string;
  eyebrow?: string;
  buttonText?: string;
  link?: string;
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
};

export const HERO_BANNER_AUTOPLAY_MS = 5000;

export type WidgetData = {
  imageUrl?: string;
  mobileImageUrl?: string;
  link?: string;
  subtitle?: string;
  eyebrow?: string;
  buttonText?: string;
  alignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  limit?: number;
  categoryId?: string;
  productIds?: string[];
  categoryIds?: string[];
  points?: string[];
  reverse?: boolean;
  testimonials?: TestimonialItem[];
  slides?: HeroSlide[];
};

export type WidgetRecord = {
  _id: string;
  type: WidgetType;
  title?: string;
  data: WidgetData;
  position: number;
  isActive: boolean;
};

export const WIDGET_LIBRARY: Array<{
  type: WidgetType;
  label: string;
  description: string;
}> = [
  {
    type: 'HERO_BANNER',
    label: 'Hero Banner',
    description: 'Full-width statement section with large imagery and a CTA.',
  },
  {
    type: 'CATEGORY_GRID',
    label: 'Category Grid',
    description: 'Show signature fragrance collections in a clean editorial grid.',
  },
  {
    type: 'HORIZONTAL_PRODUCT',
    label: 'Product Slider',
    description: 'Best sellers carousel with quick add actions.',
  },
  {
    type: 'FULL_BANNER',
    label: 'Full Banner',
    description: 'Immersive lifestyle banner with a soft overlay and CTA.',
  },
  {
    type: 'VERTICAL_PRODUCT_GRID',
    label: 'Product Grid',
    description: 'Editorial product grid for deeper exploration.',
  },
  {
    type: 'HALF_BANNER',
    label: 'Split Banner',
    description: 'Two-column image and copy section for campaigns or launches.',
  },
  {
    type: 'STORY_SECTION',
    label: 'Story Section',
    description: 'Brand storytelling block for craft, ingredients, and ethos.',
  },
  {
    type: 'TESTIMONIALS',
    label: 'Testimonials',
    description: 'Minimal customer quotes that reinforce trust and aspiration.',
  },
];

export function getDefaultHeroSlide(): HeroSlide {
  return {
    eyebrow: 'Blend Perfume',
    heading: 'Craft Your Signature Scent',
    subtitle: 'Craft your signature scent with long-lasting oils and modern perfume rituals.',
    buttonText: 'Shop Now',
    link: '/#best-sellers',
    alignment: 'left',
    overlayOpacity: 42,
  };
}

export function getHeroSlides(data: WidgetData, fallbackTitle?: string): HeroSlide[] {
  if (Array.isArray(data.slides)) {
    return data.slides;
  }

  const hasLegacyHeroData = [
    data.imageUrl,
    data.mobileImageUrl,
    fallbackTitle,
    data.subtitle,
    data.eyebrow,
    data.buttonText,
    data.link,
    data.alignment,
    data.overlayOpacity,
  ].some((value) => value !== undefined && value !== '');

  if (!hasLegacyHeroData) {
    return [getDefaultHeroSlide()];
  }

  return [
    {
      ...getDefaultHeroSlide(),
      imageUrl: data.imageUrl,
      mobileImageUrl: data.mobileImageUrl,
      heading: fallbackTitle || getDefaultHeroSlide().heading,
      subtitle: data.subtitle || getDefaultHeroSlide().subtitle,
      eyebrow: data.eyebrow || getDefaultHeroSlide().eyebrow,
      buttonText: data.buttonText || getDefaultHeroSlide().buttonText,
      link: data.link || getDefaultHeroSlide().link,
      alignment: data.alignment || getDefaultHeroSlide().alignment,
      overlayOpacity: data.overlayOpacity ?? getDefaultHeroSlide().overlayOpacity,
    },
  ];
}

export function getDefaultWidgetData(type: WidgetType): WidgetData {
  switch (type) {
    case 'HERO_BANNER':
      return {
        slides: [getDefaultHeroSlide()],
      };
    case 'CATEGORY_GRID':
      return {
        subtitle: 'Curated collections for every mood.',
        categoryIds: [],
      };
    case 'HORIZONTAL_PRODUCT':
      return {
        subtitle: 'The fragrances our community keeps coming back to.',
        limit: 6,
        productIds: [],
      };
    case 'FULL_BANNER':
      return {
        eyebrow: 'Signature Wear',
        subtitle: 'Long-lasting fragrance built for everyday luxury and special nights out.',
        buttonText: 'Discover More',
        link: '/',
        alignment: 'center',
        overlayOpacity: 36,
      };
    case 'VERTICAL_PRODUCT_GRID':
      return {
        subtitle: 'Explore the collection.',
        limit: 8,
        productIds: [],
      };
    case 'HALF_BANNER':
      return {
        eyebrow: 'Layered Luxury',
        subtitle: 'Pair expressive scents with elegant presentation for a ritual that lasts beyond the first spray.',
        buttonText: 'View Collection',
        link: '/',
        reverse: false,
      };
    case 'STORY_SECTION':
      return {
        eyebrow: 'Our Story',
        subtitle: 'Crafted with premium oils and a clean modern point of view.',
        points: [
          'Premium oils chosen for smooth projection and longevity.',
          'Balanced top, heart, and base notes for a fuller scent journey.',
          'A refined ritual designed for gifting and daily wear.',
        ],
        buttonText: 'Read More',
        link: '/',
      };
    case 'TESTIMONIALS':
      return {
        subtitle: 'What customers are saying.',
        testimonials: [
          {
            quote: 'Sophisticated, soft, and still noticeable hours later.',
            author: 'Aarav',
            role: 'Verified Buyer',
          },
          {
            quote: 'The packaging feels premium and the scent profile is beautifully balanced.',
            author: 'Riya',
            role: 'Fragrance Lover',
          },
          {
            quote: 'A clean luxury feel from the first spray to the dry down.',
            author: 'Mehul',
            role: 'Repeat Customer',
          },
        ],
      };
    default:
      return {};
  }
}
