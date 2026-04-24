'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  parentId?: {
    _id: string;
    name: string;
  } | null;
};

type CategoryFormState = {
  name: string;
  slug: string;
  parentId: string;
};

type CategoryPayload = {
  name: string;
  slug: string;
  parentId?: string;
};

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CategoryFormState>({ name: '', slug: '', parentId: '' });

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = (await res.json()) as AdminCategory[];
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCategories();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: CategoryPayload = { ...formData };
      if (!payload.parentId) delete payload.parentId;

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormData({ name: '', slug: '', parentId: '' });
        void fetchCategories();
      } else {
        const error = (await res.json()) as { error?: string };
        alert(error.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Category Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full border rounded-md p-2"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                  });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                required
                className="w-full border rounded-md p-2 bg-gray-50"
                value={formData.slug}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              >
                <option value="">None (Top Level)</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors flex justify-center items-center gap-2"
            >
              <Plus size={18} /> Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Existing Categories</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No categories found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Slug</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Parent</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{category.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{category.slug}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{category.parentId?.name || '-'}</td>
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
    </div>
  );
}
