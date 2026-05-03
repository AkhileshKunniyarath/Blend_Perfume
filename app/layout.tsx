import type { Metadata } from "next";
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { Poppins } from 'next/font/google';
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Blend Perfume",
  description: "Premium fragrances crafted with clean luxury, lasting depth, and modern perfume storytelling.",
  applicationName: "Blend Perfume",
  openGraph: {
    type: "website",
    siteName: "Blend Perfume",
    title: "Blend Perfume",
    description: "Premium fragrances crafted with clean luxury, lasting depth, and modern perfume storytelling.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blend Perfume",
    description: "Premium fragrances crafted with clean luxury, lasting depth, and modern perfume storytelling.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full scroll-smooth antialiased ${poppins.variable}`} data-scroll-behavior="smooth">
      {process.env.NEXT_PUBLIC_GTM_ID && <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />}
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
