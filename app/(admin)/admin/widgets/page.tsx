'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  WIDGET_LIBRARY,
  getDefaultWidgetData,
  type WidgetData,
  type WidgetType,
} from '@/lib/widgets';
import { cn } from '@/lib/utils';

type ProductOption = {
  _id: string;
  name: string;
};

type CategoryOption = {
  _id: string;
  name: string;
};

type WidgetDraft = {
  _id?: string;
  type: WidgetType;
  title?: string;
  data: WidgetData;
  isActive: boolean;
};

function createDraft(type: WidgetType = 'HERO_BANNER'): WidgetDraft {
  return {
    type,
    title: '',
    data: getDefaultWidgetData(type),
    isActive: true,
    _id: undefined,
  };
}

function normalizeWidget(widget: {
  _id?: string;
  type: WidgetType;
  title?: string;
  data?: WidgetData;
  isActive?: boolean;
}): WidgetDraft {
  return {
    _id: widget._id,
    type: widget.type,
    title: widget.title || '',
    data: { ...getDefaultWidgetData(widget.type), ...(widget.data || {}) },
    isActive: widget.isActive ?? true,
  };
}

function widgetLabel(type: WidgetType) {
  return WIDGET_LIBRARY.find((item) => item.type === type)?.label || type;
}

export default function WidgetsAdmin() {
  const [widgets, setWidgets] = useState<WidgetDraft[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WidgetDraft>(createDraft());

  const selectedLibraryEntry = useMemo(
    () => WIDGET_LIBRARY.find((item) => item.type === draft.type),
    [draft.type]
  );

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap(selectedId?: string) {
    try {
      setLoading(true);
      const [widgetsRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/widgets'),
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      const [widgetsData, productsData, categoriesData] = await Promise.all([
        widgetsRes.json(),
        productsRes.json(),
        categoriesRes.json(),
      ]);

      const normalizedWidgets: WidgetDraft[] = Array.isArray(widgetsData)
        ? widgetsData.map((widget) => normalizeWidget(widget as {
            _id?: string;
            type: WidgetType;
            title?: string;
            data?: WidgetData;
            isActive?: boolean;
          }))
        : [];

      setWidgets(normalizedWidgets);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      const preferredWidget =
        normalizedWidgets.find((item) => item._id === selectedId) || normalizedWidgets[0];

      if (preferredWidget) {
        setDraft(preferredWidget);
      } else {
        setDraft(createDraft());
      }
    } catch (error) {
      console.error('Error bootstrapping widget builder:', error);
    } finally {
      setLoading(false);
    }
  }

  function selectWidget(widget: WidgetDraft) {
    setDraft(widget);
  }

  function startNewWidget(type: WidgetType = 'HERO_BANNER') {
    setDraft(createDraft(type));
  }

  function updateDraft<K extends keyof WidgetDraft>(key: K, value: WidgetDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateData(patch: Partial<WidgetData>) {
    setDraft((current) => ({
      ...current,
      data: {
        ...current.data,
        ...patch,
      },
    }));
  }

  function updateType(nextType: WidgetType) {
    setDraft((current) => ({
      ...current,
      type: nextType,
      data: getDefaultWidgetData(nextType),
    }));
  }

  function toggleSelection(field: 'productIds' | 'categoryIds', value: string) {
    const currentValues = draft.data[field] || [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    updateData({ [field]: nextValues } as Partial<WidgetData>);
  }

  function updatePoint(index: number, value: string) {
    const points = [...(draft.data.points || [])];
    points[index] = value;
    updateData({ points });
  }

  function addPoint() {
    updateData({ points: [...(draft.data.points || []), ''] });
  }

  function removePoint(index: number) {
    updateData({ points: (draft.data.points || []).filter((_, itemIndex) => itemIndex !== index) });
  }

  function updateTestimonial(index: number, key: 'quote' | 'author' | 'role', value: string) {
    const testimonials = [...(draft.data.testimonials || [])];
    testimonials[index] = {
      ...(testimonials[index] || { quote: '', author: '', role: '' }),
      [key]: value,
    };
    updateData({ testimonials });
  }

  function addTestimonial() {
    updateData({
      testimonials: [...(draft.data.testimonials || []), { quote: '', author: '', role: '' }],
    });
  }

  function removeTestimonial(index: number) {
    updateData({
      testimonials: (draft.data.testimonials || []).filter((_, itemIndex) => itemIndex !== index),
    });
  }

  async function uploadImage(file: File, field: 'imageUrl' | 'mobileImageUrl') {
    try {
      setUploadingField(field);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to upload image');
      }

      updateData({ [field]: payload.url } as Partial<WidgetData>);
    } catch (error) {
      console.error('Error uploading image:', error);
      window.alert('Image upload failed. Please check your storage configuration.');
    } finally {
      setUploadingField(null);
    }
  }

  async function saveDraft() {
    try {
      setSaving(true);
      const payload = {
        type: draft.type,
        title: draft.title,
        data: draft.data,
        isActive: draft.isActive,
      };

      const res = await fetch(draft._id ? `/api/widgets/${draft._id}` : '/api/widgets', {
        method: draft._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const saved = await res.json();
      if (!res.ok) {
        throw new Error(saved.error || 'Failed to save section');
      }

      await bootstrap(saved._id);
    } catch (error) {
      console.error('Error saving widget:', error);
      window.alert('Could not save this section.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteDraft() {
    if (!draft._id) {
      setDraft(createDraft(draft.type));
      return;
    }

    const confirmed = window.confirm('Delete this section from the homepage?');
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/widgets/${draft._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete section');
      }

      await bootstrap();
    } catch (error) {
      console.error('Error deleting widget:', error);
      window.alert('Could not delete this section.');
    }
  }

  async function persistOrder(nextWidgets: WidgetDraft[]) {
    setWidgets(nextWidgets);

    try {
      await fetch('/api/widgets/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderedIds: nextWidgets.map((widget) => widget._id).filter(Boolean),
        }),
      });
    } catch (error) {
      console.error('Error reordering widgets:', error);
      await bootstrap(draft._id);
    }
  }

  async function dropOnWidget(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      return;
    }

    const currentWidgets = [...widgets];
    const fromIndex = currentWidgets.findIndex((item) => item._id === draggingId);
    const toIndex = currentWidgets.findIndex((item) => item._id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const [movedWidget] = currentWidgets.splice(fromIndex, 1);
    currentWidgets.splice(toIndex, 0, movedWidget);
    setDraggingId(null);
    await persistOrder(currentWidgets);
  }

  const productSelectorsVisible =
    draft.type === 'HORIZONTAL_PRODUCT' || draft.type === 'VERTICAL_PRODUCT_GRID';
  const isBanner =
    draft.type === 'HERO_BANNER' || draft.type === 'FULL_BANNER' || draft.type === 'HALF_BANNER';

  return (
    <div className="space-y-8">
      <div className="luxury-panel rounded-[2rem] px-6 py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-strong)]">Widget Builder</p>
            <h1 className="mt-3 text-4xl text-[var(--deep-black)]">Blend Homepage Composer</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--foreground-soft)]">
              Build the fragrance storefront section by section with banners, category collections, best sellers, story blocks, and testimonials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => startNewWidget()}
            className="gold-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
        <div className="space-y-6">
          <div className="luxury-panel rounded-[2rem] p-6">
            <div className="flex items-center gap-2 text-[var(--deep-black)]">
              <Sparkles className="h-4 w-4 text-[var(--accent-strong)]" />
              <h2 className="text-xl">Section Library</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {WIDGET_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => startNewWidget(item.type)}
                  className="rounded-[1.5rem] border border-white/60 bg-white/62 px-4 py-4 text-left hover:border-[var(--accent)]"
                >
                  <p className="text-sm font-semibold text-[var(--deep-black)]">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">{item.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="luxury-panel rounded-[2rem] p-6">
            <div className="flex items-center gap-2 text-[var(--deep-black)]">
              <GripVertical className="h-4 w-4 text-[var(--accent-strong)]" />
              <h2 className="text-xl">Page Structure</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--foreground-soft)]">
              Drag cards to reorder the homepage flow.
            </p>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/60 px-4 py-5 text-sm text-[var(--foreground-soft)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading sections...
                </div>
              ) : widgets.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-white/45 px-4 py-10 text-center text-sm text-[var(--foreground-soft)]">
                  No sections yet. Add your hero to start building the page.
                </div>
              ) : (
                widgets.map((widget) => (
                  <button
                    key={widget._id ?? widget.type}
                    type="button"
                    draggable
                    onDragStart={() => setDraggingId(widget._id ?? null)}
                    onDragEnd={() => setDraggingId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (widget._id) {
                        void dropOnWidget(widget._id);
                      }
                    }}
                    onClick={() => selectWidget(widget)}
                    className={cn(
                      'flex w-full items-start gap-4 rounded-[1.6rem] border px-4 py-4 text-left',
                      draft._id === widget._id
                        ? 'border-[var(--deep-black)] bg-[var(--deep-black)] text-white'
                        : 'border-white/60 bg-white/62 text-[var(--deep-black)] hover:border-[var(--accent)]'
                    )}
                  >
                    <span className={cn('mt-0.5', draft._id === widget._id ? 'text-white/70' : 'text-[var(--foreground-soft)]')}>
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.26em]',
                            draft._id === widget._id ? 'bg-white/12 text-white/80' : 'bg-[var(--background-strong)] text-[var(--foreground-soft)]'
                          )}
                        >
                          {widgetLabel(widget.type)}
                        </span>
                        {!widget.isActive && (
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.26em]',
                              draft._id === widget._id ? 'bg-white/12 text-white/80' : 'bg-red-50 text-red-700'
                            )}
                          >
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-base font-semibold">
                        {widget.title || widgetLabel(widget.type)}
                      </p>
                      <p className={cn('mt-1 text-sm', draft._id === widget._id ? 'text-white/72' : 'text-[var(--foreground-soft)]')}>
                        {widget.data.subtitle || widget.data.eyebrow || 'No supporting copy yet.'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="luxury-panel rounded-[2rem] p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[var(--deep-black)]">
                <Settings2 className="h-4 w-4 text-[var(--accent-strong)]" />
                <h2 className="text-xl">Config Panel</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                {selectedLibraryEntry?.description}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={deleteDraft}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => void saveDraft()}
                disabled={saving}
                className="gold-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Section Type</span>
              <select
                value={draft.type}
                onChange={(event) => updateType(event.target.value as WidgetType)}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                {WIDGET_LIBRARY.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Section Title</span>
              <input
                value={draft.title}
                onChange={(event) => updateDraft('title', event.target.value)}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                placeholder="e.g. Best Sellers"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Eyebrow</span>
              <input
                value={draft.data.eyebrow || ''}
                onChange={(event) => updateData({ eyebrow: event.target.value })}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                placeholder="Blend Perfume"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Active</span>
              <button
                type="button"
                onClick={() => updateDraft('isActive', !draft.isActive)}
                className={cn(
                  'flex min-h-12 w-full items-center rounded-[1rem] border px-4 text-left',
                  draft.isActive
                    ? 'border-[var(--accent)] bg-[rgba(201,169,110,0.12)] text-[var(--deep-black)]'
                    : 'border-[var(--border)] bg-white/78 text-[var(--foreground-soft)]'
                )}
              >
                {draft.isActive ? 'Visible on homepage' : 'Hidden section'}
              </button>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Supporting Copy</span>
              <textarea
                rows={4}
                value={draft.data.subtitle || ''}
                onChange={(event) => updateData({ subtitle: event.target.value })}
                className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                placeholder="Perfume storytelling, campaign copy, or section context..."
              />
            </label>
          </div>

          {isBanner && (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Image URL</span>
                <input
                  value={draft.data.imageUrl || ''}
                  onChange={(event) => updateData({ imageUrl: event.target.value })}
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  placeholder="https://..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Upload Image</span>
                <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[1rem] border border-dashed border-[var(--border)] bg-white/60 px-4 text-sm text-[var(--foreground)] hover:border-[var(--accent)]">
                  {uploadingField === 'imageUrl' ? (
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
                        void uploadImage(file, 'imageUrl');
                      }
                    }}
                  />
                </label>
              </label>

              {(draft.type === 'HERO_BANNER' || draft.type === 'FULL_BANNER') && (
                <>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">CTA Label</span>
                    <input
                      value={draft.data.buttonText || ''}
                      onChange={(event) => updateData({ buttonText: event.target.value })}
                      className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">CTA Link</span>
                    <input
                      value={draft.data.link || ''}
                      onChange={(event) => updateData({ link: event.target.value })}
                      className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                      placeholder="/collections"
                    />
                  </label>
                </>
              )}

              {(draft.type === 'HERO_BANNER' || draft.type === 'FULL_BANNER') && (
                <>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Content Alignment</span>
                    <select
                      value={draft.data.alignment || 'left'}
                      onChange={(event) =>
                        updateData({
                          alignment: event.target.value as 'left' | 'center' | 'right',
                        })
                      }
                      className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Overlay Opacity</span>
                    <input
                      type="range"
                      min={18}
                      max={72}
                      value={draft.data.overlayOpacity || 36}
                      onChange={(event) => updateData({ overlayOpacity: Number(event.target.value) })}
                      className="mt-4 w-full accent-[var(--accent-strong)]"
                    />
                  </label>
                </>
              )}

              {draft.type === 'HALF_BANNER' && (
                <>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">CTA Label</span>
                    <input
                      value={draft.data.buttonText || ''}
                      onChange={(event) => updateData({ buttonText: event.target.value })}
                      className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">CTA Link</span>
                    <input
                      value={draft.data.link || ''}
                      onChange={(event) => updateData({ link: event.target.value })}
                      className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Layout Direction</span>
                    <button
                      type="button"
                      onClick={() => updateData({ reverse: !draft.data.reverse })}
                      className={cn(
                        'flex min-h-12 w-full items-center rounded-[1rem] border px-4 text-left',
                        draft.data.reverse
                          ? 'border-[var(--accent)] bg-[rgba(201,169,110,0.12)] text-[var(--deep-black)]'
                          : 'border-[var(--border)] bg-white/78 text-[var(--foreground-soft)]'
                      )}
                    >
                      {draft.data.reverse ? 'Image on right, text on left' : 'Image on left, text on right'}
                    </button>
                  </label>
                </>
              )}
            </div>
          )}

          {productSelectorsVisible && (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Category Filter</span>
                <select
                  value={draft.data.categoryId || ''}
                  onChange={(event) => updateData({ categoryId: event.target.value || undefined })}
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Latest Products</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Product Limit</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={draft.data.limit || 6}
                  onChange={(event) => updateData({ limit: Number(event.target.value) })}
                  className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>

              <div className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Featured Products</span>
                <div className="grid max-h-72 gap-2 overflow-y-auto rounded-[1rem] border border-[var(--border)] bg-white/70 p-3 sm:grid-cols-2">
                  {products.map((product) => {
                    const active = draft.data.productIds?.includes(product._id);
                    return (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => toggleSelection('productIds', product._id)}
                        className={cn(
                          'rounded-[1rem] border px-4 py-3 text-left text-sm',
                          active
                            ? 'border-[var(--deep-black)] bg-[var(--deep-black)] text-white'
                            : 'border-[var(--border)] bg-white text-[var(--foreground)]'
                        )}
                      >
                        {product.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--foreground-soft)]">
                  Select products manually, or leave this empty to use the category filter / latest products.
                </p>
              </div>
            </div>
          )}

          {draft.type === 'CATEGORY_GRID' && (
            <div className="mt-7 space-y-2">
              <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Category Selection</span>
              <div className="grid gap-2 rounded-[1rem] border border-[var(--border)] bg-white/70 p-3 sm:grid-cols-2">
                {categories.map((category) => {
                  const active = draft.data.categoryIds?.includes(category._id);
                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => toggleSelection('categoryIds', category._id)}
                      className={cn(
                        'rounded-[1rem] border px-4 py-3 text-left text-sm',
                        active
                          ? 'border-[var(--deep-black)] bg-[var(--deep-black)] text-white'
                          : 'border-[var(--border)] bg-white text-[var(--foreground)]'
                      )}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {draft.type === 'STORY_SECTION' && (
            <div className="mt-7 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Story Image</span>
                  <input
                    value={draft.data.imageUrl || ''}
                    onChange={(event) => updateData({ imageUrl: event.target.value })}
                    className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                    placeholder="https://..."
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Upload Story Image</span>
                  <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[1rem] border border-dashed border-[var(--border)] bg-white/60 px-4 text-sm text-[var(--foreground)] hover:border-[var(--accent)]">
                    {uploadingField === 'imageUrl' ? (
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
                          void uploadImage(file, 'imageUrl');
                        }
                      }}
                    />
                  </label>
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">CTA Label</span>
                  <input
                    value={draft.data.buttonText || ''}
                    onChange={(event) => updateData({ buttonText: event.target.value })}
                    className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">CTA Link</span>
                  <input
                    value={draft.data.link || ''}
                    onChange={(event) => updateData({ link: event.target.value })}
                    className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Story Points</span>
                  <button
                    type="button"
                    onClick={addPoint}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--foreground)] hover:border-[var(--accent)]"
                  >
                    Add Point
                  </button>
                </div>
                {(draft.data.points || []).map((point, index) => (
                  <div key={`${point}-${index}`} className="flex gap-3">
                    <input
                      value={point}
                      onChange={(event) => updatePoint(index, event.target.value)}
                      className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                      placeholder="Premium oils selected for smooth projection..."
                    />
                    <button
                      type="button"
                      onClick={() => removePoint(index)}
                      className="rounded-[1rem] border border-[var(--border)] px-3 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {draft.type === 'TESTIMONIALS' && (
            <div className="mt-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.26em] text-[var(--foreground-soft)]">Testimonials</span>
                <button
                  type="button"
                  onClick={addTestimonial}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--foreground)] hover:border-[var(--accent)]"
                >
                  Add Quote
                </button>
              </div>
              {(draft.data.testimonials || []).map((item, index) => (
                <div key={`${item.author}-${index}`} className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">Quote</span>
                      <textarea
                        rows={3}
                        value={item.quote}
                        onChange={(event) => updateTestimonial(index, 'quote', event.target.value)}
                        className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">Author</span>
                      <input
                        value={item.author}
                        onChange={(event) => updateTestimonial(index, 'author', event.target.value)}
                        className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">Role</span>
                      <input
                        value={item.role || ''}
                        onChange={(event) => updateTestimonial(index, 'role', event.target.value)}
                        className="w-full rounded-[1rem] border border-[var(--border)] bg-white/78 px-4 py-3 outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTestimonial(index)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--foreground)] hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Quote
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
