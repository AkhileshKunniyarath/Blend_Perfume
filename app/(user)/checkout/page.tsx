'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { getProductPrimaryImage } from '@/lib/storefront';
import Script from 'next/script';

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Create order on our backend
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            image: item.image
          })),
          address: formData,
          totalAmount: getTotalPrice(),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // 2. Initialize Razorpay
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // This needs to be in .env.local
        amount: data.amount,
        currency: data.currency,
        name: 'Headless Commerce',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async function (response: RazorpayResponse) {
          // 3. Verify payment on backend
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            const searchParams = new URLSearchParams();

            if (verifyData.orderId) {
              searchParams.set('order', verifyData.orderId);
            }

            if (verifyData.trackingUrl) {
              searchParams.set('track', verifyData.trackingUrl);
            }

            router.push(`/order-success?${searchParams.toString()}`);
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input required type="text" name="street" value={formData.street} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full border rounded-md p-2 bg-gray-50" readOnly />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors mt-8 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₹${getTotalPrice()}`}
            </button>
          </form>
        </div>
        
        <div>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const itemImage = getProductPrimaryImage(item.image ? [item.image] : []);

                return (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-md">
                        <img src={itemImage} alt={item.name} className="w-full h-full object-cover rounded-md" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>₹{getTotalPrice()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
