import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

type SitemapEntity = {
  slug: string;
  updatedAt?: Date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  await connectToDatabase();
  
  // Fetch products
  const products = (await Product.find({}).select('slug updatedAt').lean()) as SitemapEntity[];
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Fetch categories
  const categories = (await Category.find({}).select('slug updatedAt').lean()) as SitemapEntity[];
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.updatedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Static routes
  const routes = ['', '/cart', '/checkout'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  return [...routes, ...categoryEntries, ...productEntries];
}
