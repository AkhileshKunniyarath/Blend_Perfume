import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendOrderConfirmationEmail } from '@/lib/order-email';
import { createGuestTrackingToken, getGuestTrackingUrl } from '@/lib/order-utils';

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

    if (!order.guestTrackingToken) {
      order.guestTrackingToken = createGuestTrackingToken();
    }

    const paymentAlreadyCompleted = order.paymentStatus === 'COMPLETED';

    if (!paymentAlreadyCompleted) {
      order.paymentStatus = 'COMPLETED';
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;

      if (order.orderStatus === 'PENDING') {
        order.orderStatus = 'PROCESSING';
      }

      await order.save();

      // Deduct stock only on the first successful verification.
      await deductStock(
        order.products.map((p) => ({
          productId: p.productId.toString(),
          quantity: p.quantity,
          size: p.size,
        }))
      );
    }

    const trackingUrl = order.trackingUrl || getGuestTrackingUrl(order.guestTrackingToken);

    if (!order.confirmationEmailSentAt) {
      try {
        const emailResult = await sendOrderConfirmationEmail({
          _id: order._id,
          address: order.address,
          products: order.products,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          guestTrackingToken: order.guestTrackingToken,
          shippingCarrier: order.shippingCarrier,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          createdAt: order.createdAt,
        });

        if (emailResult.sent) {
          order.confirmationEmailSentAt = new Date();
          await order.save();
          console.log(`✅ Order confirmation email sent for order ${order._id}`);
        } else if (emailResult.skipped) {
          console.warn(`⚠️ Email skipped for order ${order._id} — RESEND_API_KEY or ORDER_EMAIL_FROM not set in .env.local`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send order confirmation email for order ${order._id}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id,
      trackingUrl,
    });
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
