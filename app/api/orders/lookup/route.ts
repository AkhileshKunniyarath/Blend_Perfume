import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { getGuestTrackingPath, normalizeEmail, normalizePhone } from '@/lib/order-utils';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    const phone = request.nextUrl.searchParams.get('phone');

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Both email and phone are required to fetch guest orders.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    const orders = await Order.find({
      normalizedEmail,
      normalizedPhone,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      orders: orders.map((order) => ({
        _id: order._id.toString(),
        customerType: order.customerType,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        address: order.address,
        products: order.products,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl || getGuestTrackingPath(order.guestTrackingToken),
      })),
    });
  } catch (error) {
    console.error('Error fetching guest order history:', error);
    return NextResponse.json({ error: 'Failed to fetch guest order history' }, { status: 500 });
  }
}
