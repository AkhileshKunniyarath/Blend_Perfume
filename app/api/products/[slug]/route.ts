import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';

/** Purge cached pages that display product data */
function revalidateProductPages(slug: string) {
  revalidatePath('/');                          // homepage widgets
  revalidatePath('/products');                  // product listing
  revalidatePath(`/product/${slug}`);           // product detail
  revalidatePath('/category/[slug]', 'page');   // all category pages
  revalidatePath('/sitemap.xml');               // sitemap
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const product = await Product.findOne({ slug }).populate('categoryId');
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    const body = await req.json();
    const updated = await Product.findOneAndUpdate({ slug }, { $set: body }, { returnDocument: 'after' });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Invalidate old slug pages + new slug if it changed
    revalidateProductPages(slug);
    if (updated.slug !== slug) {
      revalidateProductPages(updated.slug);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const { slug } = await params;
    await Product.findOneAndDelete({ slug });

    revalidateProductPages(slug);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
