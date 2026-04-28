'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Edit, ImagePlus, Loader2, Plus, Save, Search, Trash2, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  parentId?: {
    _id: string;
    name: string;
  } | null;
};

type CategoryFormState = {
  originalSlug?: string;
  name: string;
  slug: string;
  parentId: string;
  image: string;
  seoTitle: string;
  seoDescription: string;
};

type CategoryPayload = {
  name: string;
  slug: string;
  parentId?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
};

const EMPTY_FORM: CategoryFormState = {
  originalSlug: undefined,
  name: '',
  slug: '',
  parentId: '',
  image: '',
  seoTitle: '',
  seoDescription: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormState>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState('');

  const isEditing = Boolean(formData.originalSlug);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCategories();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const parentOptions = useMemo(
    () => categories.filter((category) => category._id !== formData.originalSlug && category.slug !== formData.originalSlug),
    [categories, formData.originalSlug]
  );

  const filteredCategories = useMemo(
    () =>
      searchQuery.trim()
        ? categories.filter(
            (category) =>
              category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (category.parentId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
          )
        : categories,
    [categories, searchQuery]
  );

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = (await res.json()) as AdminCategory[];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData(EMPTY_FORM);
  }

  function startEdit(category: AdminCategory) {
    setFormData({
      originalSlug: category.slug,
      name: category.name,
      slug: category.slug,
      parentId: category.parentId?._id || '',
      image: category.image || '',
      seoTitle: category.seoTitle || '',
      seoDescription: category.seoDescription || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadImage(file: File) {
    try {
      setUploading(true);
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to upload image');
      }

      setFormData((current) => ({
        ...current,
        image: payload.url,
      }));
    } catch (error) {
      console.error('Error uploading category image:', error);
      window.alert('Image upload failed. Please verify storage is configured.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);

      const payload: CategoryPayload = {
        name: formData.name.trim(),
        slug: slugify(formData.slug || formData.name),
        parentId: formData.parentId || undefined,
        image: formData.image || undefined,
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
      };

      const endpoint = isEditing ? `/api/categories/${formData.originalSlug}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = (await res.json()) as { error?: string };
        throw new Error(error.error || 'Failed to save category');
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      window.alert(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(`Delete "${category.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingSlug(category.slug);
      const res = await fetch(`/api/categories/${category.slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete category');
      }

      if (formData.originalSlug === category.slug) {
        resetForm();
      }

      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      window.alert('Could not delete this category.');
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="luxury-panel rounded-[2rem] px-6 py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-strong)]">Categories</p>
            <h1 className="mt-3 text-4xl text-[var(--deep-black)]">Category manager</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--foreground-soft)]">
              Create and manage all store categories. Categories organise your products, power the navigation menu, and appear as collection cards on the homepage widget builder.
            </p>
          </div>
          <Link
            href="/admin/widgets"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white/70 px-5 py-3 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--deep-black)]"
          >
            Open Homepage Widgets
          </Link>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="luxury-panel rounded-[2rem] p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-strong)]">
                {isEditing ? 'Edit Collection' : 'Add Collection'}
              </p>
              <h2 className="mt-3 text-2xl text-[var(--deep-black)]">
                {isEditing ? 'Update collection details' : 'Create a new category'}
              </h2>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:border-[var(--accent)]"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Name</span>
                <input
                  type="text"
                  required
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                      slug: slugify(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Slug</span>
                <input
                  type="text"
                  required
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Parent Category</span>
                <select
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  value={formData.parentId}
                  onChange={(event) => setFormData((current) => ({ ...current, parentId: event.target.value }))}
                >
                  <option value="">None (Top Level Collection)</option>
                  {parentOptions.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Collection Image URL</span>
                <input
                  type="text"
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(event) => setFormData((current) => ({ ...current, image: event.target.value }))}
                />
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Upload Collection Image</span>
                <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[1rem] border border-dashed border-[var(--border)] bg-white/60 px-4 text-sm text-[var(--foreground)] hover:border-[var(--accent)]">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      Choose File
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadImage(file);
                      }
                    }}
                  />
                </label>
              </div>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">SEO Title</span>
                <input
                  type="text"
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  value={formData.seoTitle}
                  onChange={(event) => setFormData((current) => ({ ...current, seoTitle: event.target.value }))}
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">SEO Description</span>
                <textarea
                  rows={4}
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  value={formData.seoDescription}
                  onChange={(event) => setFormData((current) => ({ ...current, seoDescription: event.target.value }))}
                />
              </label>
            </div>

            {formData.image && (
              <div className="overflow-hidden rounded-[1.5rem] border border-white/55 bg-white/55 p-3">
                <img
                  src={formData.image}
                  alt={formData.name || 'Collection preview'}
                  className="h-52 w-full rounded-[1.2rem] object-cover"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="gold-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEditing ? 'Save Collection' : 'Add Collection'}
            </button>
          </form>
        </div>

        <div className="luxury-panel rounded-[2rem] p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-strong)]">Existing Categories</p>
              <h2 className="mt-3 text-2xl text-[var(--deep-black)]">Manage store categories</h2>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-white/72 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[var(--foreground-soft)]">
              {categories.length} Total
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/60 px-4 py-5 text-sm text-[var(--foreground-soft)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading collections...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white/45 px-4 py-10 text-center text-sm text-[var(--foreground-soft)]">
                No categories found yet. Create your first collection to populate the homepage cards.
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="rounded-[1.6rem] border border-white/60 bg-white/62 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="h-24 w-full overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top,#d8c3a0,transparent_34%),linear-gradient(180deg,#2a2823,#121212)] sm:w-28">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl text-[var(--deep-black)]">{category.name}</h3>
                        <span className="rounded-full bg-[var(--background-strong)] px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)]">
                          /{category.slug}
                        </span>
                        {category.parentId?.name && (
                          <span className="rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)]">
                            Child of {category.parentId.name}
                          </span>
                        )}
                        {!category.image && (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-red-700">
                            Image Missing
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
                        {category.seoDescription || 'No SEO description added yet. This category can still be used in the homepage collection widget.'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:border-[var(--accent)]"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(category)}
                        disabled={deletingSlug === category.slug}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm',
                          deletingSlug === category.slug
                            ? 'border-red-200 bg-red-50 text-red-500 opacity-70'
                            : 'border-[var(--border)] text-[var(--foreground)] hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                        )}
                      >
                        {deletingSlug === category.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Full-width All Categories table ── */}
      <section className="luxury-panel rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-strong)]">All Categories</p>
            <h2 className="mt-3 text-2xl text-[var(--deep-black)]">Complete category overview</h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-soft)]" />
            <input
              type="text"
              placeholder="Search categories…"
              className="w-full rounded-full border border-[var(--border)] bg-white/78 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--accent)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/60 px-4 py-5 text-sm text-[var(--foreground-soft)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading categories…
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white/45 px-4 py-14 text-center">
              <p className="text-sm text-[var(--foreground-soft)]">No categories in the database yet.</p>
              <p className="mt-2 text-xs text-[var(--foreground-soft)]/70">
                Use the form above to create your first category.
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white/45 px-4 py-10 text-center text-sm text-[var(--foreground-soft)]">
              No categories match &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)] font-medium">Image</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)] font-medium">Name</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)] font-medium">Slug</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)] font-medium">Parent</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)] font-medium">SEO</th>
                  <th className="whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-[0.26em] text-[var(--foreground-soft)] font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-white/50 transition-colors hover:bg-white/40"
                  >
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-[0.6rem] bg-[radial-gradient(circle_at_top,#d8c3a0,transparent_34%),linear-gradient(180deg,#2a2823,#121212)]">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--deep-black)]">
                      {category.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[var(--background-strong)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--foreground-soft)]">
                        /{category.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-soft)]">
                      {category.parentId?.name || (
                        <span className="text-xs text-[var(--foreground-soft)]/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {category.seoTitle || category.seoDescription ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Set
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-700">
                          <XCircle className="h-3 w-3" />
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--deep-black)]"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(category)}
                          disabled={deletingSlug === category.slug}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs',
                            deletingSlug === category.slug
                              ? 'border-red-200 bg-red-50 text-red-500 opacity-70'
                              : 'border-[var(--border)] text-[var(--foreground)] hover:border-red-300 hover:bg-red-50 hover:text-red-700'
                          )}
                        >
                          {deletingSlug === category.slug ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && categories.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-[1rem] border border-white/55 bg-white/50 px-4 py-3">
            <span className="text-xs text-[var(--foreground-soft)]">
              Showing {filteredCategories.length} of {categories.length} categories
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[var(--accent-strong)] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
