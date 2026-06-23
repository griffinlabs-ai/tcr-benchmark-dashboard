import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Frontier Benchmark',
  description: 'Frontier exploration benchmark runs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <span className="brand">Frontier Benchmark</span>
          <a href="/">Runs</a>
          <a href="/compare">Compare</a>
          <a href="/params">Param effect</a>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
