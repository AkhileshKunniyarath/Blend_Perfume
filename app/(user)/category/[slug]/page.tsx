import { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { notFound } from 'next/navigation';
import ProductListingPage from '@/components/product/ProductListingPage';
import type { StorefrontCategory, StorefrontProduct } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connectToDatabase();
  const { slug } = await params;
  const category = await Category.findOne({ slug }).lean();

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: category.seoTitle || `${category.name} | Blend Perfume`,
    description: category.seoDescription || `Shop Blend Perfume's ${category.name} collection.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const { slug } = await params;
  
  const category = await Category.findOne({ slug }).lean();
  if (!category) {
    notFound();
  }

  const [products, categories] = await Promise.all([
    Product.find({ categoryId: category._id }).populate('categoryId', 'name slug').sort({ createdAt: -1 }).lean(),
    Category.find({}).sort({ createdAt: 1, _id: 1 }).lean(),
  ]);
  const serializedProducts = JSON.parse(JSON.stringify(products)) as StorefrontProduct[];
  const serializedCategories = JSON.parse(JSON.stringify(categories)) as StorefrontCategory[];

  return (
    <ProductListingPage
      title={category.name}
      description={
        category.seoDescription ||
        `Discover ${category.name} fragrances shaped with premium oils, clean luxury, and a polished scent trail.`
      }
      products={serializedProducts}
      categories={serializedCategories}
      activeCategorySlug={category.slug}
      eyebrow="Collection"
    />
  );
}
