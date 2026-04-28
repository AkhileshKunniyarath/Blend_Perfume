import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).populate('categoryId').sort({ name: 1 }).lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

type StockUpdate = {
  productId: string;
  variantSize?: string;
  stock: number;
};

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const updates: StockUpdate[] = body.updates;

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload: expected { updates: [...] }' }, { status: 400 });
    }

    const results = [];

    for (const update of updates) {
      if (update.variantSize) {
        // Update a specific variant's stock
        const result = await Product.updateOne(
          { _id: update.productId, 'variants.size': update.variantSize },
          { $set: { 'variants.$.stock': update.stock } }
        );
        results.push(result);
      } else {
        // Update product-level stock (products without variants)
        const result = await Product.updateOne(
          { _id: update.productId },
          { $set: { stock: update.stock } }
        );
        results.push(result);
      }
    }

    // After individual variant updates, sync product-level stock to sum of variant stocks
    const productIds = [...new Set(updates.filter((u) => u.variantSize).map((u) => u.productId))];
    for (const productId of productIds) {
      const product = await Product.findById(productId);
      if (product && product.variants && product.variants.length > 0) {
        const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        await Product.updateOne({ _id: productId }, { $set: { stock: totalStock } });
      }
    }

    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
