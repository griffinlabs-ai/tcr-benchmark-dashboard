import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

import SiteNav from '@/components/SiteNav';

import './globals.css';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Frontier Benchmark',
  description: 'Frontier exploration benchmark runs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={grotesk.variable}>
      <body>
        <SiteNav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
