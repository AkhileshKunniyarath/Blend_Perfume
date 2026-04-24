'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex flex-col sm:flex-row items-center gap-6 p-4 border rounded-lg shadow-sm bg-white">
              <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />}
              </div>
              
              <div className="flex-grow flex flex-col sm:flex-row justify-between w-full">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                  <p className="font-medium mt-2">₹{item.price}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                      className="p-2 hover:bg-gray-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id, item.size)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-4">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{getTotalPrice()}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout" 
              className="w-full block text-center bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
