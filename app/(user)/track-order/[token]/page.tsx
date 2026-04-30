import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { formatOrderCurrency, formatOrderDate } from '@/lib/order-utils';
import { Package, MapPin, CreditCard, Truck } from 'lucide-react';

type TrackOrderPageProps = {
  params: Promise<{ token: string }>;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  REFUNDED: 'bg-gray-50 text-gray-700 border-gray-200',
};

function StatusBadge({ label, status }: { label: string; status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <div className="rounded-[1.4rem] border border-[var(--border)] bg-white/60 p-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--foreground-soft)]">{label}</p>
      <span className={`mt-2 inline-block rounded-full border px-3 py-0.5 text-xs font-medium uppercase tracking-[0.16em] ${cls}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    </div>
  );
}

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const { token } = await params;

  await connectToDatabase();
  const order = await Order.findOne({ guestTrackingToken: token }).lean();

  if (!order) notFound();

  const orderNumber = order._id.toString().slice(-8).toUpperCase();

  return (
    <div className="section-shell py-8 sm:py-12">
      {/* ── Header ── */}
      <div className="luxury-panel mb-6 rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          Blend Order Tracking
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl text-[var(--foreground)]">
          Order #{orderNumber}
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-soft)]">
          Placed on {formatOrderDate(order.createdAt)} by {order.address.fullName}
        </p>

        {/* Status grid — 1 col on mobile, 3 on sm+ */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatusBadge label="Payment" status={order.paymentStatus} />
          <StatusBadge label="Order Status" status={order.orderStatus} />
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-white/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--foreground-soft)]">Total</p>
            <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
              {formatOrderCurrency(order.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tracking details ── */}
      <div className="luxury-panel mb-6 rounded-[2rem] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 text-[var(--accent-strong)]" />
          <h2 className="font-display text-xl text-[var(--foreground)]">Tracking Details</h2>
        </div>

        {order.trackingNumber ? (
          <p className="mt-4 text-sm text-[var(--foreground-soft)]">
            <span className="font-medium text-[var(--foreground)]">{order.trackingNumber}</span>
            {order.shippingCarrier ? ` via ${order.shippingCarrier}` : ''}
          </p>
        ) : (
          <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">
            Your delivery progress will appear here as soon as a shipment tracking number is assigned.
          </p>
        )}

        {order.trackingUrl && (
          <Link
            href={order.trackingUrl}
            className="gold-button mt-5 inline-flex rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Open Courier Tracking
          </Link>
        )}
      </div>

      {/* ── Items + Shipping — stack on mobile, side-by-side on lg ── */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        {/* Items */}
        <div className="luxury-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Package className="h-5 w-5 text-[var(--accent-strong)]" />
            <h2 className="font-display text-xl text-[var(--foreground)]">Items</h2>
          </div>

          <div className="space-y-4">
            {order.products.map((item, index) => (
              <div
                key={`${item.productId.toString()}-${item.size || 'default'}-${index}`}
                className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--foreground)]">{item.name}</p>
                  <p className="mt-1 text-sm text-[var(--foreground-soft)]">
                    Qty: {item.quantity}
                    {item.size ? ` · Size: ${item.size}` : ''}
                  </p>
                </div>
                <p className="flex-shrink-0 font-medium text-[var(--foreground)]">
                  {formatOrderCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-between border-t border-[var(--border)] pt-4 font-semibold text-[var(--foreground)]">
            <span>Total</span>
            <span>{formatOrderCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="luxury-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[var(--accent-strong)]" />
            <h2 className="font-display text-xl text-[var(--foreground)]">Shipping Address</h2>
          </div>

          <div className="space-y-1.5 text-sm text-[var(--foreground-soft)]">
            <p className="font-medium text-[var(--foreground)]">{order.address.fullName}</p>
            <p>{order.address.email}</p>
            <p>{order.address.phone}</p>
            <p className="pt-1">{order.address.street}</p>
            <p>
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
            <p>{order.address.country}</p>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-[var(--border)] bg-white/60 p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent-strong)]" />
              <p className="text-xs leading-6 text-[var(--foreground-soft)]">
                Create an account with this email and mobile number to see all your orders — including this one — in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
