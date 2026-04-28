import type { Metadata } from 'next';
import EditorialPage from '@/components/content/EditorialPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Blend Perfume privacy policy covering how customer information is handled and protected.',
};

export default function PrivacyPolicyPage() {
  return (
    <EditorialPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This Privacy Policy explains how Blend Perfume collects, uses, and protects information shared through this website. By using the site, you agree to the practices described here."
      updatedAt="April 27, 2026"
      sections={[
        {
          title: 'Information we collect',
          paragraphs: [
            'We may collect information you provide directly, such as your name, phone number, email address, shipping details, and order information when you place an order or contact us.',
            'We may also collect limited technical information needed to operate the website, improve performance, and support analytics or order verification flows.',
          ],
        },
        {
          title: 'How we use information',
          paragraphs: [
            'Customer information is used to process orders, confirm payments, coordinate delivery, respond to support requests, and improve the overall shopping experience.',
            'We may also use your information for essential operational communication such as order updates, service messages, or issue resolution.',
          ],
        },
        {
          title: 'Data sharing and protection',
          paragraphs: [
            'We do not sell personal information. Data may be shared only with service providers and operational partners when required to complete payment, shipping, communication, or website functions.',
            'We take reasonable measures to protect customer information, but no digital system can guarantee absolute security. Customers should also use secure passwords and trusted networks when interacting with the site.',
          ],
        },
        {
          title: 'Your choices',
          paragraphs: [
            'You may contact us to request updates or corrections to the personal information you have shared with us. Requests related to privacy or data handling will be reviewed and addressed as reasonably possible.',
          ],
        },
      ]}
      noteTitle="Privacy contact"
      noteBody={
        <>
          <p>For privacy-related questions or requests, reach out to the Blend Perfume support team.</p>
          <p className="mt-4">
            Email: <a href="mailto:hello@blendperfume.com" className="text-[var(--deep-black)] hover:text-[var(--accent-strong)]">hello@blendperfume.com</a>
          </p>
        </>
      }
    />
  );
}
