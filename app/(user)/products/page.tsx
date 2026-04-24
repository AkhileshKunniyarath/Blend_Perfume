import { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import ProductListingPage from '@/components/product/ProductListingPage';
import type { StorefrontCategory, StorefrontProduct } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Products | Blend Perfume',
  description: 'Browse the full Blend Perfume collection with filters, sorting, and category navigation.',
};

export default async function ProductsPage() {
  await connectToDatabase();

  const [products, categories] = await Promise.all([
    Product.find({}).populate('categoryId', 'name slug').sort({ createdAt: -1 }).lean(),
    Category.find({}).sort({ createdAt: 1, _id: 1 }).lean(),
  ]);

  const serializedProducts = JSON.parse(JSON.stringify(products)) as StorefrontProduct[];
  const serializedCategories = JSON.parse(JSON.stringify(categories)) as StorefrontCategory[];

  return (
    <ProductListingPage
      title="All Fragrances"
      description="Browse the full Blend catalogue with category shortcuts, size filters, stock visibility, and luxury fragrance discovery tools."
      products={serializedProducts}
      categories={serializedCategories}
      eyebrow="Blend Catalogue"
    />
  );
}
