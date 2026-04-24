'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';

type AdminCategory = {
  _id: string;
  name: string;
};

type ProductVariant = {
  size: string;
  price: number;
};

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  stock: string;
  images: string[];
  variants: ProductVariant[];
};

type AdminProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images?: string[];
  categoryId?: {
    _id: string;
    name: string;
  } | null;
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    categoryId: '',
    stock: '0',
    images: [] as string[],
    variants: [] as ProductVariant[],
  });

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = (await res.json()) as AdminProduct[];
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = (await res.json()) as AdminCategory[];
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProducts();
      void fetchCategories();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ ...formData, images: [...formData.images, data.url] });
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        stock: Number(formData.stock),
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: '', slug: '', description: '', price: '', salePrice: '',
          categoryId: '', stock: '0', images: [], variants: []
        });
        void fetchProducts();
      } else {
        const error = (await res.json()) as { error?: string };
        alert(error.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> Add Product</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-6">Add New Product</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text" required className="w-full border rounded-md p-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" required readOnly className="w-full border rounded-md p-2 bg-gray-50" value={formData.slug} />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} className="w-full border rounded-md p-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required className="w-full border rounded-md p-2"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" required min="0" className="w-full border rounded-md p-2"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price (₹)</label>
                <input type="number" required min="0" step="0.01" className="w-full border rounded-md p-2"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (₹) - Optional</label>
                <input type="number" min="0" step="0.01" className="w-full border rounded-md p-2"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="flex gap-4 flex-wrap mb-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="w-24 h-24 border rounded-md relative overflow-hidden group">
                      <img src={img} className="w-full h-full object-cover" alt="Product" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-400 hover:text-black hover:border-black cursor-pointer transition-colors">
                    {uploading ? <span className="text-xs">Uploading...</span> : <><ImageIcon size={24} /><span className="text-xs mt-1">Upload</span></>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button type="submit" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No products found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{product.categoryId?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium">₹{product.price}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-500 hover:text-blue-700 p-1"><Edit size={16} /></button>
                    <button className="text-red-500 hover:text-red-700 p-1 ml-2"><Trash2 size={16} /></button>
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
