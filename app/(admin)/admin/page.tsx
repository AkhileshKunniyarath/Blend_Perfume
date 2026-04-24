import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Order from '@/models/Order';
import { ShoppingBag, Package, Tag, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

type DashboardOrder = {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  address?: {
    fullName?: string;
  };
};

async function getDashboardStats() {
  await connectToDatabase();
  const [totalProducts, totalCategories, totalOrders, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Order.find({}).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const revenue = await Order.aggregate([
    { $match: { paymentStatus: 'COMPLETED' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);

  return {
    totalProducts,
    totalCategories,
    totalOrders,
    totalRevenue: revenue[0]?.total || 0,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)) as DashboardOrder[],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Categories', value: stats.totalCategories, icon: Tag, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  ];

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className={`inline-flex p-3 rounded-lg ${color} mb-4`}>
              <Icon size={22} />
            </div>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders yet.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Order</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">#{order._id.substring(order._id.length - 6)}</td>
                  <td className="px-6 py-4 text-sm">{order.address?.fullName || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium">₹{order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
