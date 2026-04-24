import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Dashboard</Link>
          <Link href="/admin/products" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Products</Link>
          <Link href="/admin/categories" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Categories</Link>
          <Link href="/admin/orders" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Orders</Link>
          <Link href="/admin/widgets" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Widgets</Link>
          <Link href="/admin/crm" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">CRM</Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-end">
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Logout</button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
