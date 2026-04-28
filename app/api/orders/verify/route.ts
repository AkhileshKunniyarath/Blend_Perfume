import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyRazorpaySignature } from '@/lib/razorpay';

async function deductStock(orderProducts: { productId: string; quantity: number; size?: string }[]) {
  for (const item of orderProducts) {
    if (item.size) {
      // Decrement variant stock AND product-level stock atomically
      await Product.updateOne(
        { _id: item.productId, 'variants.size': item.size },
        {
          $inc: {
            'variants.$.stock': -item.quantity,
            stock: -item.quantity,
          },
        }
      );
    } else {
      // No variant — decrement product-level stock only
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = body;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.paymentStatus = 'COMPLETED';
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    await order.save();

    // Deduct stock for each item in the order
    await deductStock(
      order.products.map((p) => ({
        productId: p.productId.toString(),
        quantity: p.quantity,
        size: p.size,
      }))
    );

    return NextResponse.json({ success: true, message: 'Payment verified successfully' });
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
