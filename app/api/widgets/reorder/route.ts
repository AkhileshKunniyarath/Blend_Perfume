import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Widget from '@/models/Widget';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { orderedIds } = await req.json(); // Array of widget IDs in new order

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Update each widget's position based on its index in the array
    const updates = orderedIds.map((id, index) => {
      return Widget.findByIdAndUpdate(id, { position: index });
    });

    await Promise.all(updates);

    revalidatePath('/');

    return NextResponse.json({ success: true, message: 'Widgets reordered successfully' });
  } catch (error) {
    console.error('Error reordering widgets:', error);
    return NextResponse.json({ error: 'Failed to reorder widgets' }, { status: 500 });
  }
}

