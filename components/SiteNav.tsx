'use client';

import { usePathname } from 'next/navigation';

export default function SiteNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
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
  );
}
