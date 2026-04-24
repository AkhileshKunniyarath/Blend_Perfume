import { Metadata } from 'next';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import AddToCartButton from '@/components/product/AddToCartButton';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSlider from '@/components/ProductSlider';
import { extractFragranceNotes, getEffectivePrice } from '@/lib/storefront';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connectToDatabase();
  const { slug } = await params;
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description.substring(0, 160),
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description.substring(0, 160),
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const { slug } = await params;
  const product = await Product.findOne({ slug }).populate('categoryId', 'name slug').lean();

  if (!product) {
    notFound();
  }

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const relatedProducts = JSON.parse(
    JSON.stringify(
      await Product.find({
        categoryId: product.categoryId?._id || product.categoryId,
        _id: { $ne: product._id },
      })
        .limit(6)
        .sort({ createdAt: -1 })
        .populate('categoryId', 'name slug')
        .lean()
    )
  );
  const notes = extractFragranceNotes(product.description);
  const hasNotes = Boolean(notes.top || notes.middle || notes.base);
  const effectivePrice = getEffectivePrice(serializedProduct);

  return (
    <div className="pb-24">
      <div className="section-shell py-8 sm:py-12">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <ProductGallery images={serializedProduct.images || []} name={serializedProduct.name} />

          <div className="luxury-panel rounded-[2.4rem] p-6 sm:p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent-strong)]">
              {typeof serializedProduct.categoryId === 'object' && serializedProduct.categoryId?.name
                ? serializedProduct.categoryId.name
                : 'Blend Perfume'}
            </p>
            <h1 className="mt-4 text-4xl text-[var(--deep-black)] sm:text-5xl">
              {serializedProduct.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <p className="text-3xl font-semibold text-[var(--deep-black)]">{formatCurrency(effectivePrice)}</p>
              {serializedProduct.salePrice && serializedProduct.salePrice < serializedProduct.price && (
                <p className="text-lg text-[var(--foreground-soft)] line-through">
                  {formatCurrency(serializedProduct.price)}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">
              <span className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2">
                {serializedProduct.stock > 0 ? 'In stock' : 'Sold out'}
              </span>
              <span className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2">
                Long lasting fragrance
              </span>
              <span className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2">
                Premium oils
              </span>
            </div>

            <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-[var(--foreground-soft)]">
              {serializedProduct.description}
            </p>

            <div className="mt-10">
              <AddToCartButton product={serializedProduct} />
            </div>

            <div className="mt-10 grid gap-4 border-t border-[var(--border)] pt-8 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/60 bg-white/58 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Projection</p>
                <p className="mt-2 text-lg text-[var(--deep-black)]">Smooth, noticeable trail</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/60 bg-white/58 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Wear</p>
                <p className="mt-2 text-lg text-[var(--deep-black)]">Day-to-night luxury</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/60 bg-white/58 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Sizes</p>
                <p className="mt-2 text-lg text-[var(--deep-black)]">
                  {serializedProduct.variants?.length
                    ? serializedProduct.variants.map((variant: { size: string }) => variant.size).join(', ')
                    : 'Standard'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-shell grid gap-5 pb-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="luxury-panel rounded-[2rem] p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.36em] text-[var(--accent-strong)]">
            {hasNotes ? 'Fragrance Notes' : 'Scent Story'}
          </p>
          <h2 className="mt-4 text-3xl text-[var(--deep-black)] sm:text-4xl">
            {hasNotes ? 'Top, middle, and base' : 'A refined perfume narrative'}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/60 bg-white/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
                {hasNotes ? 'Top' : 'Opening'}
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--foreground)]">
                {notes.top || 'A crisp and polished first impression designed to feel clean and elevated.'}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/60 bg-white/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
                {hasNotes ? 'Middle' : 'Heart'}
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--foreground)]">
                {notes.middle || 'A balanced core that carries the fragrance story with softness and presence.'}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/60 bg-white/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
                {hasNotes ? 'Base' : 'Dry down'}
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--foreground)]">
                {notes.base || 'A lasting finish that lingers with warmth, depth, and a premium signature feel.'}
              </p>
            </div>
          </div>
        </div>

        <div className="luxury-panel rounded-[2rem] p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.36em] text-[var(--accent-strong)]">Wear Profile</p>
          <h2 className="mt-4 text-3xl text-[var(--deep-black)] sm:text-4xl">What to expect</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/60 bg-white/60 p-5">
              <p className="text-sm leading-7 text-[var(--foreground)]">
                “A polished fragrance experience that feels more expensive than its price point.”
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">Editorial note</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/60 bg-white/60 p-5">
              <p className="text-sm leading-7 text-[var(--foreground)]">
                “Ideal for gifting, layering, and building a signature scent wardrobe.”
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">Brand promise</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/60 bg-white/60 p-5">
              <p className="text-sm leading-7 text-[var(--foreground)]">
                “Long-lasting wear with a smooth dry down that stays elegant rather than overpowering.”
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">Wear experience</p>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <ProductSlider
          title="Related Products"
          subtitle="Continue the fragrance journey with nearby notes and complementary picks."
          products={relatedProducts}
        />
      )}
    </div>
  );
}
