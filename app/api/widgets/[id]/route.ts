import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Widget from '@/models/Widget';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const widget = await Widget.findById(id);
    if (!widget) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(widget);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch widget' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const updated = await Widget.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    revalidatePath('/');

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update widget' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await Widget.findByIdAndDelete(id);

    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete widget' }, { status: 500 });
  }
}

