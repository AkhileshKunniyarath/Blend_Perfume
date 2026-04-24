import connectToDatabase from '@/lib/db';
import Widget from '@/models/Widget';
import { WidgetEngine } from '@/components/widgets';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blend Perfume',
  description: 'Discover premium fragrances, signature scent stories, and clean luxury perfume rituals.',
};

async function getWidgets() {
  try {
    await connectToDatabase();
    const widgets = await Widget.find({ isActive: true }).sort({ position: 1 }).lean();
    return JSON.parse(JSON.stringify(widgets));
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return [];
  }
}

export default async function HomePage() {
  const widgets = await getWidgets();

  if (widgets.length === 0) {
    return (
      <WidgetEngine widgets={[]} />
    );
  }

  return <WidgetEngine widgets={widgets} />;
}
