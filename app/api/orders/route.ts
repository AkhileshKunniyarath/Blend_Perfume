import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { getRazorpayInstance } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { products, address, totalAmount } = body;

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Create Order in MongoDB
    const newOrder = await Order.create({
      products,
      address,
      totalAmount,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
    });

    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(totalAmount * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: newOrder._id.toString(),
    };

    const razorpayInstance = getRazorpayInstance();
    const razorpayOrder = await razorpayInstance.orders.create(options);

    // 3. Update Order with Razorpay Order ID
    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    return NextResponse.json({
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: options.amount,
      currency: options.currency,
    });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
