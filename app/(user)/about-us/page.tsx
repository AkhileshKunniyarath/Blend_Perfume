import type { Metadata } from 'next';
import EditorialPage from '@/components/content/EditorialPage';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Blend Perfume, our fragrance philosophy, and the craft behind the brand.',
};

export default function AboutUsPage() {
  return (
    <EditorialPage
      eyebrow="Our Story"
      title="About Blend Perfume"
      intro="Blend Perfume was shaped around a simple idea: fragrance should feel personal, elevated, and memorable without becoming inaccessible. We focus on clean presentation, expressive scent storytelling, and a polished customer journey from discovery to delivery."
      sections={[
        {
          title: 'What we believe',
          paragraphs: [
            'We believe perfume is more than a product. It is mood, identity, memory, and ritual. Every collection is presented to help customers discover a scent profile that feels aligned with how they want to show up each day.',
            'Our direction combines premium visual language, approachable shopping, and fragrance-led storytelling so the experience feels refined without being intimidating.',
          ],
        },
        {
          title: 'How we curate',
          paragraphs: [
            'We design the catalog to be easy to explore through categories, best sellers, and signature picks. That makes it simpler for first-time customers to find a starting point and for returning customers to deepen their personal fragrance wardrobe.',
            'Across storefront, service, and fulfillment, our goal is consistency: thoughtful details, clear communication, and a brand experience that feels polished at every touchpoint.',
          ],
        },
        {
          title: 'Who we serve',
          paragraphs: [
            'Blend Perfume is built for customers who want a premium fragrance experience with clarity, confidence, and convenience. Whether you are shopping for yourself or selecting a gift, we aim to make the journey feel smooth and well considered.',
          ],
        },
      ]}
      noteTitle="Connect with the house"
      noteBody={
        <>
          <p>Questions, collaborations, or customer care requests can be shared with our team anytime.</p>
          <p className="mt-4">
            Email: <a href="mailto:hello@blendperfume.com" className="text-[var(--deep-black)] hover:text-[var(--accent-strong)]">hello@blendperfume.com</a>
          </p>
        </>
      }
    />
  );
}
