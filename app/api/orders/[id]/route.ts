import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

async function restoreStock(orderProducts: { productId: string; quantity: number; size?: string }[]) {
  for (const item of orderProducts) {
    if (item.size) {
      await Product.updateOne(
        { _id: item.productId, 'variants.size': item.size },
        {
          $inc: {
            'variants.$.stock': item.quantity,
            stock: item.quantity,
          },
        }
      );
    } else {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      );
    }
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const body = await req.json();

    const existingOrder = await Order.findById(resolvedParams.id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If order is being cancelled and payment was completed, restore stock
    const isBeingCancelled = body.orderStatus === 'CANCELLED' && existingOrder.orderStatus !== 'CANCELLED';
    const wasPaid = existingOrder.paymentStatus === 'COMPLETED';

    const updatedOrder = await Order.findByIdAndUpdate(
      resolvedParams.id,
      { $set: body },
      { new: true }
    );

    if (isBeingCancelled && wasPaid) {
      await restoreStock(
        existingOrder.products.map((p) => ({
          productId: p.productId.toString(),
          quantity: p.quantity,
          size: p.size,
        }))
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
