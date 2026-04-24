import Category from '@/models/Category';
import Product from '@/models/Product';
import connectToDatabase from '@/lib/db';
import { clamp } from '@/lib/utils';
import {
  type WidgetRecord,
  type WidgetData,
} from '@/lib/widgets';
import type { StorefrontCategory, StorefrontProduct } from '@/lib/storefront';
import HeroBanner from '@/components/HeroBanner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductSlider from '@/components/ProductSlider';
import FullBanner from '@/components/FullBanner';
import ProductGrid from '@/components/ProductGrid';
import SplitBanner from '@/components/SplitBanner';
import StorySection from '@/components/StorySection';
import Testimonials from '@/components/Testimonials';

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

async function resolveProducts(data: WidgetData, fallbackLimit: number) {
  const limit = clamp(data.limit ?? fallbackLimit, 1, 12);

  if (data.productIds?.length) {
    const products = serialize(
      await Product.find({ _id: { $in: data.productIds } })
        .populate('categoryId', 'name slug')
        .lean()
    ) as unknown as StorefrontProduct[];

    const sortOrder = new Map(data.productIds.map((id, index) => [id, index]));
    return products.sort(
      (a, b) => (sortOrder.get(String(a._id)) ?? 0) - (sortOrder.get(String(b._id)) ?? 0)
    );
  }

  const query = data.categoryId ? { categoryId: data.categoryId } : {};
  return serialize(
    await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean()
  ) as unknown as StorefrontProduct[];
}

async function resolveCategories(data: WidgetData, fallbackLimit: number) {
  const limit = clamp(data.categoryIds?.length || fallbackLimit, 1, 8);

  if (data.categoryIds?.length) {
    const categories = serialize(await Category.find({ _id: { $in: data.categoryIds } }).lean()) as unknown as StorefrontCategory[];
    const sortOrder = new Map(data.categoryIds.map((id, index) => [id, index]));
    return categories.sort(
      (a, b) => (sortOrder.get(String(a._id)) ?? 0) - (sortOrder.get(String(b._id)) ?? 0)
    );
  }

  return serialize(await Category.find({}).sort({ createdAt: -1 }).limit(limit).lean()) as unknown as StorefrontCategory[];
}

async function renderWidget(widget: WidgetRecord, index: number) {
  switch (widget.type) {
    case 'HERO_BANNER':
      return <HeroBanner key={widget._id} title={widget.title} data={widget.data} />;
    case 'CATEGORY_GRID': {
      const categories = await resolveCategories(widget.data, 4);
      return (
        <CategoryGrid
          key={widget._id}
          title={widget.title || 'Shop by Collection'}
          subtitle={widget.data.subtitle}
          categories={categories}
        />
      );
    }
    case 'HORIZONTAL_PRODUCT': {
      const products = await resolveProducts(widget.data, 6);
      return (
        <ProductSlider
          key={widget._id}
          id={index === 0 ? 'best-sellers' : undefined}
          title={widget.title || 'Best Sellers'}
          subtitle={widget.data.subtitle}
          products={products}
        />
      );
    }
    case 'FULL_BANNER':
      return <FullBanner key={widget._id} title={widget.title} data={widget.data} />;
    case 'VERTICAL_PRODUCT_GRID': {
      const products = await resolveProducts(widget.data, 8);
      return (
        <ProductGrid
          key={widget._id}
          title={widget.title || 'Explore Collection'}
          subtitle={widget.data.subtitle}
          products={products}
        />
      );
    }
    case 'HALF_BANNER':
      return <SplitBanner key={widget._id} title={widget.title} data={widget.data} />;
    case 'STORY_SECTION':
      return <StorySection key={widget._id} title={widget.title} data={widget.data} />;
    case 'TESTIMONIALS':
      return (
        <Testimonials
          key={widget._id}
          title={widget.title || 'Loved by fragrance lovers'}
          subtitle={widget.data.subtitle}
          items={widget.data.testimonials ?? []}
        />
      );
    default:
      return (
        <div
          key={widget._id}
          className="section-shell py-8"
        >
          <div className="rounded-[1.5rem] border border-yellow-300 bg-yellow-50 px-5 py-4 text-sm text-yellow-900">
            Unknown widget type: {widget.type}
          </div>
        </div>
      );
  }
}

export async function WidgetEngine({ widgets }: { widgets: WidgetRecord[] }) {
  if (!widgets || widgets.length === 0) {
    return (
      <section className="section-shell py-16 sm:py-24">
        <div className="luxury-panel rounded-[2.4rem] px-8 py-14 text-center sm:px-14">
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">Homepage Builder</p>
          <h1 className="mt-4 text-4xl text-[var(--deep-black)] sm:text-5xl">Design your fragrance storefront</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--foreground-soft)]">
            The homepage is waiting for its first sections. Head to the widget builder to add a hero, best sellers, story block, and more.
          </p>
          <a
            href="/admin/widgets"
            className="gold-button mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Open Widget Builder
          </a>
        </div>
      </section>
    );
  }

  await connectToDatabase();
  const renderedWidgets = await Promise.all(
    widgets.filter((widget) => widget.isActive).map((widget, index) => renderWidget(widget, index))
  );

  return <div className="w-full pb-12 sm:pb-20">{renderedWidgets}</div>;
}
