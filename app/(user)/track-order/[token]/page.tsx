import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { formatOrderCurrency, formatOrderDate } from '@/lib/order-utils';

type TrackOrderPageProps = {
  params: Promise<{ token: string }>;
};

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { token } = await params;

  await connectToDatabase();

  const order = await Order.findOne({ guestTrackingToken: token }).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Blend Order Tracking</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">Order #{order._id.toString().slice(-8).toUpperCase()}</h1>
        <p className="mt-3 text-gray-600">
          Placed on {formatOrderDate(order.createdAt)} by {order.address.fullName}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Payment</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{order.paymentStatus}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Order Status</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{order.orderStatus}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Total</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{formatOrderCurrency(order.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Tracking Details</p>
          {order.trackingNumber ? (
            <p className="mt-2 text-sm text-amber-950">
              {order.shippingCarrier ? `${order.shippingCarrier} - ` : ''}
              {order.trackingNumber}
            </p>
          ) : (
            <p className="mt-2 text-sm text-amber-950">
              Your latest delivery progress will appear here as soon as a shipment tracking number is assigned.
            </p>
          )}
          {order.trackingUrl ? (
            <Link
              href={order.trackingUrl}
              className="mt-4 inline-flex rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Open Courier Tracking
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Items</h2>
          <div className="mt-6 space-y-4">
            {order.products.map((item, index) => (
              <div key={`${item.productId.toString()}-${item.size || 'default'}-${index}`} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Qty: {item.quantity}
                    {item.size ? ` | Size: ${item.size}` : ''}
                  </p>
                </div>
                <p className="font-medium text-gray-900">{formatOrderCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Shipping</h2>
          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-900">{order.address.fullName}</p>
            <p>{order.address.email}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.street}</p>
            <p>
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
            <p>{order.address.country}</p>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm text-gray-700">
              If you create an account later using this same email address and mobile number, these guest orders can be matched back to your profile history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
