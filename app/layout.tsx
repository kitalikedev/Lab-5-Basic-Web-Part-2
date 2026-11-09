import type { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
  // Open Graph: xem trước khi chia sẻ link lên mạng xã hội
  openGraph: {
    title: 'Acme Dashboard',
    description: 'Manage your invoices and customers',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
