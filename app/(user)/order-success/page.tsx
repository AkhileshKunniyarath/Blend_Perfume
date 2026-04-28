import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

type OrderSuccessPageProps = {
  searchParams: Promise<{
    order?: string;
    track?: string;
  }>;
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const { order, track } = await searchParams;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. We&apos;ve received your order and are currently processing it.
        </p>
        {order ? (
          <p className="mb-6 text-sm text-gray-500">Reference order: #{order.slice(-8).toUpperCase()}</p>
        ) : null}
        {track ? (
          <Link
            href={track}
            className="mb-3 block w-full border border-black text-black py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Track Your Order
          </Link>
        ) : null}
        <Link 
          href="/" 
          className="block w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
