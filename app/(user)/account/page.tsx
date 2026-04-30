import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { logout } from '@/app/actions/auth';
import { User, Mail, Phone, LogOut, Package, MapPin } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { normalizeEmail, normalizePhone, formatOrderCurrency, formatOrderDate, getGuestTrackingPath } from '@/lib/order-utils';

export const metadata: Metadata = {
  title: 'My Account — Blend Perfume',
};

export const dynamic = 'force-dynamic';

type OrderSummary = {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  itemCount: number;
  trackingPath: string;
  city: string;
};

async function getOrders(email: string, phone: string): Promise<OrderSummary[]> {
  try {
    await connectToDatabase();
    const orders = await Order.find({
      normalizedEmail: normalizeEmail(email),
      normalizedPhone: normalizePhone(phone),
      paymentStatus: 'COMPLETED',
    })
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((o) => ({
      _id: o._id.toString(),
      orderNumber: o._id.toString().slice(-8).toUpperCase(),
      totalAmount: o.totalAmount,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.products.reduce((sum, p) => sum + p.quantity, 0),
      trackingPath: o.trackingUrl || getGuestTrackingPath(o.guestTrackingToken),
      city: o.address.city,
    }));
  } catch {
    return [];
  }
}

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

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-block rounded-full border px-3 py-0.5 text-[10px] uppercase tracking-[0.2em] ${cls}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const orders = await getOrders(session.email, session.phone);

  return (
    <div className="section-shell py-16">
      <div className="mx-auto max-w-2xl soft-fade-up">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--foreground-soft)]">
            My Account
          </p>
          <h1 className="mt-3 font-display text-4xl text-[var(--foreground)]">
            Hello, {session.name.split(' ')[0]}
          </h1>
        </div>

        {/* Profile card */}
        <div className="luxury-panel rounded-[2rem] p-8">
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
            Profile
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-[1.2rem] border border-[var(--border)] bg-white/60 px-5 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
                <User className="h-4 w-4 text-[var(--accent-strong)]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Name</p>
                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">{session.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[1.2rem] border border-[var(--border)] bg-white/60 px-5 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
                <Mail className="h-4 w-4 text-[var(--accent-strong)]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Email</p>
                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">{session.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[1.2rem] border border-[var(--border)] bg-white/60 px-5 py-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
                <Phone className="h-4 w-4 text-[var(--accent-strong)]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">Mobile</p>
                <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">+91 {session.phone}</p>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <form action={logout} className="mt-6">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)] hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </form>
        </div>

        {/* Order history */}
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <Package className="h-5 w-5 text-[var(--accent-strong)]" />
            <h2 className="font-display text-2xl text-[var(--foreground)]">Order History</h2>
          </div>

          {orders.length === 0 ? (
            <div className="luxury-panel rounded-[2rem] p-10 text-center">
              <p className="text-sm text-[var(--foreground-soft)]">
                No orders found yet.
              </p>
              <p className="mt-2 text-xs text-[var(--foreground-soft)]/70">
                Orders placed with this email and mobile number will appear here — including any guest orders.
              </p>
              <Link
                href="/products"
                className="gold-button mt-6 inline-flex rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="luxury-panel rounded-[1.8rem] p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--foreground-soft)]">
                        Order
                      </p>
                      <p className="mt-1 font-display text-xl text-[var(--foreground)]">
                        #{order.orderNumber}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={order.paymentStatus} />
                      <StatusBadge status={order.orderStatus} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--foreground-soft)]">
                    <span>{formatOrderDate(order.createdAt)}</span>
                    <span>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {order.city}
                    </span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatOrderCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={order.trackingPath}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--foreground-soft)] hover:bg-[var(--deep-black)] hover:text-white"
                    >
                      Track Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
