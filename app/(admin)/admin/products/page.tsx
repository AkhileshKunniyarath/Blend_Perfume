'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { getProductPrimaryImage, getValidProductImages } from '@/lib/storefront';

const PRODUCTS_PER_PAGE = 15;

type AdminCategory = {
  _id: string;
  name: string;
};

type ProductVariant = {
  size: string;
  price: number;
  cutPrice?: number;
  stock: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
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
  features: string[];
};

type AdminProduct = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  images?: string[];
  categoryId?: {
    _id: string;
    name: string;
  } | null;
  variants?: ProductVariant[];
  features?: string[];
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset to first page whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const initialFormState: ProductFormState = {
    name: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    categoryId: '',
    stock: '0',
    images: [],
    variants: [],
    features: [],
  };

  const [formData, setFormData] = useState<ProductFormState>(initialFormState);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.categoryId?.name ?? '').toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE),
    [filteredProducts, currentPage]
  );

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

  const handleEdit = (product: AdminProduct) => {
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      price: String(product.price || ''),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      categoryId: product.categoryId?._id || '',
      stock: String(product.stock || 0),
      images: product.images || [],
      variants: product.variants || [],
      features: product.features || [],
    });
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        void fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-compute product stock from variant stocks when variants exist
      const computedStock = formData.variants.length > 0
        ? formData.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : Number(formData.stock);

      const payload = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        stock: computedStock,
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/products/${formData.slug}` : '/api/products';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormState);
        void fetchProducts();
      } else {
        const error = (await res.json()) as { error?: string };
        alert(error.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Variants helpers
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', price: 0, cutPrice: undefined, stock: 0, image: '', rating: 0, reviewCount: 0 }]
    });
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  // Features helpers
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const availableImages = getValidProductImages(formData.images);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button 
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              setFormData(initialFormState);
            } else {
              setShowForm(true);
            }
          }}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> Add Product</>}
        </button>
      </div>

      {/* Search bar */}
      {!showForm && (
        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, slug or category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-md py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {showForm && (        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Base/Fallback Price (₹)</label>
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
                <p className="text-xs text-gray-500">
                  Upload product images first, then assign one to each size variant below.
                </p>
              </div>

              {/* Variants Section */}
              <div className="md:col-span-2 border rounded-md p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Variants (Sizes & Prices)</label>
                  <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Plus size={14} /> Add Variant
                  </button>
                </div>
                {formData.variants.length === 0 ? (
                  <p className="text-sm text-gray-500 italic mb-2">No variants added. Will use base price.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.variants.map((variant, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-3 border rounded-md bg-white">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              placeholder="Size (e.g. 50ML)" 
                              className="w-full border rounded-md p-2 text-sm"
                              value={variant.size}
                              onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="number" 
                              placeholder="Sale Price (₹)" 
                              className="w-full border rounded-md p-2 text-sm"
                              value={variant.price || ''}
                              onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                              required
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="number" 
                              placeholder="Cut/MRP Price (₹)" 
                              className="w-full border rounded-md p-2 text-sm"
                              value={variant.cutPrice === undefined ? '' : variant.cutPrice}
                              onChange={(e) => updateVariant(idx, 'cutPrice', e.target.value ? Number(e.target.value) : undefined as unknown as number)}
                              min="0"
                            />
                          </div>
                          <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input 
                              type="number" 
                              placeholder="Stock Qty" 
                              className="w-full border rounded-md p-2 text-sm"
                              value={variant.stock || ''}
                              onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                              required
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="number" 
                              placeholder="Rating (0-5)" 
                              className="w-full border rounded-md p-2 text-sm"
                              value={variant.rating === undefined ? '' : variant.rating}
                              onChange={(e) => updateVariant(idx, 'rating', Number(e.target.value))}
                              min="0"
                              max="5"
                              step="0.1"
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="number" 
                              placeholder="Review Count" 
                              className="w-full border rounded-md p-2 text-sm"
                              value={variant.reviewCount === undefined ? '' : variant.reviewCount}
                              onChange={(e) => updateVariant(idx, 'reviewCount', Number(e.target.value))}
                              min="0"
                            />
                          </div>
                          <div className="flex-1">
                            <select
                              className="w-full border rounded-md p-2 text-sm"
                              value={variant.image || ''}
                              onChange={(e) => updateVariant(idx, 'image', e.target.value)}
                              disabled={availableImages.length === 0}
                            >
                              <option value="">Use main product image</option>
                              {availableImages.map((image, imageIndex) => (
                                <option key={image} value={image}>
                                  {`Image ${imageIndex + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {variant.image && (
                          <div className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 p-2">
                            <img
                              src={variant.image}
                              alt={`${variant.size || 'Variant'} preview`}
                              className="h-14 w-14 rounded-md object-cover"
                            />
                            <p className="text-xs text-gray-500">
                              This image will be shown when {variant.size || 'this variant'} is selected.
                            </p>
                          </div>
                        )}
                        {availableImages.length === 0 && (
                          <p className="text-xs text-gray-500">
                            Upload at least one product image above to map an image to this variant.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features Section */}
              <div className="md:col-span-2 border rounded-md p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Features (Bullet points)</label>
                  <button type="button" onClick={addFeature} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Plus size={14} /> Add Feature
                  </button>
                </div>
                {formData.features.length === 0 ? (
                  <p className="text-sm text-gray-500 italic mb-2">No features added. Will use default placeholders.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="e.g. Long lasting fragrance" 
                          className="w-full border rounded-md p-2 text-sm"
                          value={feature}
                          onChange={(e) => updateFeature(idx, e.target.value)}
                          required
                        />
                        <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData(initialFormState);
                }} 
                className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
                {editingId ? 'Update Product' : 'Save Product'}
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
        ) : filteredProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No products match &ldquo;{searchQuery}&rdquo;.{' '}
            <button onClick={() => setSearchQuery('')} className="text-black underline">Clear search</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Variants</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img src={getProductPrimaryImage(product.images)} className="w-full h-full object-cover" alt={product.name} />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.categoryId?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {product.variants && product.variants.length > 0 ? (
                        <div className="text-xs text-gray-600">
                          {product.variants.map((v, i) => (
                            <div key={i}>
                              {v.size} - ₹{v.price}
                              {v.cutPrice ? <span className="ml-1 text-gray-400 line-through">₹{v.cutPrice}</span> : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="font-medium">₹{product.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.variants && product.variants.length > 0 ? (
                        <div className="text-xs text-gray-600 space-y-1">
                          {product.variants.map((v, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span>{v.size}:</span>
                              <span className={`px-1.5 py-0.5 rounded-full ${v.stock > 10 ? 'bg-green-100 text-green-700' : v.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                {v.stock}
                              </span>
                            </div>
                          ))}
                          <div className="pt-1 border-t border-gray-100 font-medium">Total: {product.stock}</div>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                          {product.stock} in stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(product.slug)} className="text-red-500 hover:text-red-700 p-1 ml-2"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-md text-sm font-medium ${
                          page === currentPage
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
