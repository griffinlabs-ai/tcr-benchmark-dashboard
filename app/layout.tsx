import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

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
        <nav className="nav">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden>
              ◆
            </span>
            <span>FRONTIER BENCHMARK</span>
          </a>
          <div className="nav-links">
            <a href="/">Runs</a>
            <a href="/compare">Compare</a>
            <a href="/params">Param effect</a>
          </div>
          <a className="btn btn-pill" href="https://griffinlabs.ai" target="_blank" rel="noreferrer">
            Griffin Labs
          </a>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
