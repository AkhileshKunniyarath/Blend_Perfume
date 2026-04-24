export type StorefrontCategory = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  seoDescription?: string;
};

export type ProductVariant = {
  size: string;
  price: number;
};

export type StorefrontProduct = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images?: string[];
  stock: number;
  variants?: ProductVariant[];
  categoryId?: StorefrontCategory | string;
};

export function getEffectivePrice(product: Pick<StorefrontProduct, 'price' | 'salePrice'>) {
  return product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
}

export function extractFragranceNotes(description: string) {
  const lines = description.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const matchFor = (label: string) =>
    lines.find((line) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`));

  const top = matchFor('top')?.split(':').slice(1).join(':').trim();
  const middle =
    matchFor('middle')?.split(':').slice(1).join(':').trim() ||
    matchFor('heart')?.split(':').slice(1).join(':').trim();
  const base = matchFor('base')?.split(':').slice(1).join(':').trim();

  return { top, middle, base };
}
