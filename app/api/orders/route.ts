import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { getRazorpayInstance } from '@/lib/razorpay';
import {
  createGuestTrackingToken,
  normalizeEmail,
  normalizePhone,
} from '@/lib/order-utils';

type CreateOrderRequest = {
  userId?: string;
  products?: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    image?: string;
  }>;
  address?: {
    fullName?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  totalAmount?: number;
};

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as CreateOrderRequest;
    const { products, address, totalAmount, userId } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!address?.email || !address.phone) {
      return NextResponse.json(
        { error: 'Email address and mobile number are required to place an order.' },
        { status: 400 }
      );
    }

    if (
      !address.fullName ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode ||
      !address.country
    ) {
      return NextResponse.json({ error: 'Shipping address is incomplete.' }, { status: 400 });
    }

    if (typeof totalAmount !== 'number' || Number.isNaN(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order total.' }, { status: 400 });
    }

    const hasInvalidProduct = products.some(
      (product) =>
        !product.productId ||
        !product.name ||
        typeof product.price !== 'number' ||
        typeof product.quantity !== 'number' ||
        product.quantity <= 0
    );

    if (hasInvalidProduct) {
      return NextResponse.json({ error: 'One or more cart items are invalid.' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(address.email);
    const normalizedPhone = normalizePhone(address.phone);

    if (!normalizedPhone) {
      return NextResponse.json({ error: 'A valid mobile number is required.' }, { status: 400 });
    }

    // 1. Create Order in MongoDB
    const newOrder = new Order({
      userId,
      customerType: userId ? 'REGISTERED' : 'GUEST',
      normalizedEmail,
      normalizedPhone,
      guestTrackingToken: createGuestTrackingToken(),
      products,
      address,
      totalAmount,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING',
    });
    await newOrder.save();

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
