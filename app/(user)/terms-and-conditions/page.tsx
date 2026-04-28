import type { Metadata } from 'next';
import EditorialPage from '@/components/content/EditorialPage';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Review the Blend Perfume terms and conditions for use of the website, orders, and customer responsibilities.',
};

export default function TermsAndConditionsPage() {
  return (
    <EditorialPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="These Terms & Conditions govern the use of the Blend Perfume website and any purchases made through it. By accessing the site or placing an order, you agree to these terms."
      updatedAt="April 27, 2026"
      sections={[
        {
          title: 'Website use',
          paragraphs: [
            'You agree to use this website only for lawful purposes and in a way that does not interfere with its performance, integrity, or availability.',
            'Content, branding, visuals, and site materials remain the property of Blend Perfume unless otherwise stated and may not be reproduced without permission.',
          ],
        },
        {
          title: 'Orders and pricing',
          paragraphs: [
            'Product availability, prices, and descriptions may be updated without prior notice. We aim for accuracy, but occasional errors may occur and can be corrected if identified before fulfillment.',
            'Submitting an order does not guarantee acceptance until payment and order review are successfully completed.',
          ],
        },
        {
          title: 'Shipping, returns, and support',
          paragraphs: [
            'Delivery timelines may vary based on location, operational conditions, and courier service performance. Customers are responsible for providing correct shipping details at checkout.',
            'Questions related to returns, damaged shipments, or order issues should be raised promptly through the support contact listed on the website.',
          ],
        },
        {
          title: 'Liability',
          paragraphs: [
            'Blend Perfume is not liable for indirect or incidental damages arising from use of the site, service interruptions, or delays outside reasonable operational control.',
            'Where required by law, these limitations apply only to the extent permitted under applicable regulations.',
          ],
        },
      ]}
      noteTitle="Terms support"
      noteBody={
        <>
          <p>If you need clarification on store policies, orders, or usage terms, our team can help.</p>
          <p className="mt-4">
            Email: <a href="mailto:hello@blendperfume.com" className="text-[var(--deep-black)] hover:text-[var(--accent-strong)]">hello@blendperfume.com</a>
          </p>
        </>
      }
    />
  );
}
