'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Package, AlertTriangle, XCircle, CheckCircle, Search, Save, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 15;

type InventoryVariant = {
  size: string;
  price: number;
  stock: number;
};

type InventoryProduct = {
  _id: string;
  name: string;
  slug: string;
  stock: number;
  images?: string[];
  categoryId?: {
    _id: string;
    name: string;
  } | null;
  variants?: InventoryVariant[];
};

type InventoryRow = {
  productId: string;
  productName: string;
  productSlug: string;
  variantSize?: string;
  price: number;
  stock: number;
  image?: string;
  categoryName: string;
};

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

function flattenInventory(products: InventoryProduct[]): InventoryRow[] {
  const rows: InventoryRow[] = [];

  for (const product of products) {
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        rows.push({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          variantSize: variant.size,
          price: variant.price,
          stock: variant.stock ?? 0,
          image: product.images?.[0],
          categoryName: product.categoryId?.name || '-',
        });
      }
    } else {
      rows.push({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        price: 0,
        stock: product.stock ?? 0,
        image: product.images?.[0],
        categoryName: product.categoryId?.name || '-',
      });
    }
  }

  return rows;
}

export default function InventoryAdmin() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(5000);
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchInventory() {
    try {
      const res = await fetch('/api/inventory');
      const data = (await res.json()) as InventoryProduct[];
      setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchInventory();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const rows = useMemo(() => flattenInventory(products), [products]);

  const categories = useMemo(() => {
    const names = new Set(rows.map((r) => r.categoryName).filter((n) => n !== '-'));
    return Array.from(names).sort();
  }, [rows]);

  const sizes = useMemo(() => {
    const sizeSet = new Set(rows.map((r) => r.variantSize).filter((s): s is string => Boolean(s)));
    return Array.from(sizeSet).sort();
  }, [rows]);

  const maxPriceInData = 5000;

  // Initialize priceMax when data loads
  useEffect(() => {
    setPriceMax(maxPriceInData);
  }, [maxPriceInData]);

  const filteredRows = useMemo(() => {
    const result = rows.filter((row) => {
      const matchesSearch =
        search.trim().length === 0 ||
        row.productName.toLowerCase().includes(search.toLowerCase()) ||
        (row.variantSize?.toLowerCase().includes(search.toLowerCase()) ?? false);

      const matchesCategory = categoryFilter === 'all' || row.categoryName === categoryFilter;

      const matchesSize = sizeFilter === 'all' || row.variantSize === sizeFilter;

      const matchesPrice = row.price >= priceMin && row.price <= priceMax;

      const effectiveStock = editedStocks[`${row.productId}-${row.variantSize || ''}`] ?? row.stock;
      
      let matchesFilter = true;
      switch (filter) {
        case 'in-stock':
          matchesFilter = effectiveStock > 5;
          break;
        case 'low-stock':
          matchesFilter = effectiveStock > 0 && effectiveStock <= 5;
          break;
        case 'out-of-stock':
          matchesFilter = effectiveStock <= 0;
          break;
      }

      return matchesSearch && matchesCategory && matchesSize && matchesPrice && matchesFilter;
    });
    // Reset to page 1 whenever filters change
    setCurrentPage(1);
    return result;
  }, [rows, search, filter, categoryFilter, priceMin, priceMax, sizeFilter, editedStocks]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const paginatedRows = useMemo(
    () => filteredRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredRows, currentPage]
  );

  // Stats
  const stats = useMemo(() => {
    const totalSKUs = rows.length;
    const inStock = rows.filter((r) => r.stock > 5).length;
    const lowStock = rows.filter((r) => r.stock > 0 && r.stock <= 5).length;
    const outOfStock = rows.filter((r) => r.stock <= 0).length;
    return { totalSKUs, inStock, lowStock, outOfStock };
  }, [rows]);

  const rowKey = (row: InventoryRow) => `${row.productId}-${row.variantSize || ''}`;

  const handleStockChange = (row: InventoryRow, newStock: number) => {
    setEditedStocks((prev) => ({
      ...prev,
      [rowKey(row)]: newStock,
    }));
  };

  const hasChanges = Object.keys(editedStocks).length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);

    const updates = Object.entries(editedStocks).map(([key, stock]) => {
      const [productId, ...sizeParts] = key.split('-');
      const variantSize = sizeParts.join('-') || undefined;
      return { productId, variantSize, stock };
    });

    try {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (res.ok) {
        setEditedStocks({});
        void fetchInventory();
      } else {
        alert('Failed to save inventory changes');
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (stock: number) => {
    if (stock <= 0) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700"><XCircle size={12} /> Out of stock</span>;
    }
    if (stock <= 5) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700"><AlertTriangle size={12} /> Low stock</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"><CheckCircle size={12} /> In stock</span>;
  };

  const statCards = [
    { label: 'Total SKUs', value: stats.totalSKUs, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'In Stock', value: stats.inStock, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'bg-red-50 text-red-600' },
  ];

  const filterOptions: { id: StockFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'in-stock', label: 'In Stock' },
    { id: 'low-stock', label: 'Low Stock' },
    { id: 'out-of-stock', label: 'Out of Stock' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : `Save Changes (${Object.keys(editedStocks).length})`}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold mb-1">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col gap-3">
          {/* Row 1: Dropdowns + Search */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StockFilter)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[130px]"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[140px]"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {sizes.length > 0 && (
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white min-w-[120px]"
              >
                <option value="all">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            )}

            <div className="relative flex-1 min-w-[180px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-4 text-sm"
              />
            </div>

            {(filter !== 'all' || categoryFilter !== 'all' || priceMin > 0 || priceMax < maxPriceInData || sizeFilter !== 'all' || search.trim().length > 0) && (
              <button
                onClick={() => {
                  setFilter('all');
                  setCategoryFilter('all');
                  setPriceMin(0);
                  setPriceMax(maxPriceInData);
                  setSizeFilter('all');
                  setSearch('');
                }}
                className="px-3 py-2 text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 rounded-md hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                ✕ Clear all
              </button>
            )}
          </div>

          {/* Row 2: Price Range Slider */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</span>
              <span className="text-xs font-medium text-gray-700">₹{priceMin.toLocaleString()} — ₹{priceMax.toLocaleString()}</span>
            </div>
            <div className="relative h-6 flex items-center">
              {/* Track background */}
              <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />
              {/* Active range highlight */}
              <div
                className="absolute h-1.5 rounded-full bg-black"
                style={{
                  left: `${(priceMin / maxPriceInData) * 100}%`,
                  right: `${100 - (priceMax / maxPriceInData) * 100}%`,
                }}
              />
              {/* Min thumb */}
              <input
                type="range"
                min={0}
                max={maxPriceInData}
                step={50}
                value={priceMin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriceMin(Math.min(val, priceMax - 50));
                }}
                className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: priceMin > maxPriceInData * 0.5 ? 5 : 3 }}
              />
              {/* Max thumb */}
              <input
                type="range"
                min={0}
                max={maxPriceInData}
                step={50}
                value={priceMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPriceMax(Math.max(val, priceMin + 50));
                }}
                className="absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                style={{ zIndex: 4 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">₹0</span>
              <span className="text-[10px] text-gray-400">₹{maxPriceInData.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading inventory...</div>
        ) : paginatedRows.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {rows.length === 0 ? 'No products found.' : 'No products match the current filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Variant</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedRows.map((row) => {
                  const key = rowKey(row);
                  const currentStock = editedStocks[key] ?? row.stock;
                  const isEdited = key in editedStocks;

                  return (
                    <tr key={key} className={`hover:bg-gray-50 ${isEdited ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.image && (
                            <div className="w-9 h-9 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                              <img src={row.image} className="w-full h-full object-cover" alt={row.productName} />
                            </div>
                          )}
                          <span className="font-medium text-sm">{row.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {row.variantSize ? (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{row.variantSize}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.categoryName}</td>
                      <td className="px-6 py-4 text-sm font-medium">₹{row.price}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) => handleStockChange(row, Number(e.target.value))}
                          className={`w-20 border rounded-md p-1.5 text-sm text-center ${isEdited ? 'border-blue-400 ring-1 ring-blue-200' : ''}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(currentStock)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredRows.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length} items
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

      {hasChanges && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{Object.keys(editedStocks).length}</span> stock change{Object.keys(editedStocks).length !== 1 ? 's' : ''} pending
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEditedStocks({})}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-black text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
