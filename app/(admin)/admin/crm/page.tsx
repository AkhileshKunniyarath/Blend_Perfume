import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { Mail, Phone, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomerData {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
}

async function getCustomers(): Promise<CustomerData[]> {
  await connectToDatabase();

  const customers = await Order.aggregate([
    {
      $group: {
        _id: '$address.email',
        fullName: { $first: '$address.fullName' },
        email: { $first: '$address.email' },
        phone: { $first: '$address.phone' },
        city: { $first: '$address.city' },
        state: { $first: '$address.state' },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);

  return customers;
}

export default async function CRMPage() {
  const customers = await getCustomers();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CRM — Customers</h1>
        <p className="text-sm text-gray-500">{customers.length} total customers</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No customers yet. Orders will appear here once placed.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Location</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Orders</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {customer.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <p className="font-medium text-sm">{customer.fullName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1 text-gray-600">
                      <span className="flex items-center gap-1"><Mail size={12} /> {customer.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600"><MapPin size={12} /> {customer.city}, {customer.state}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{customer.totalOrders}</td>
                  <td className="px-6 py-4 font-semibold text-green-700">₹{customer.totalSpent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
