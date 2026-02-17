export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" className="shrink-0">
            <defs>
              <linearGradient id="footer-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#footer-g)"/>
            <path d="M6,10 H11 M6,10 V22 M6,16 H10 M6,22 H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <path d="M13,22 V10 L16.5,15 L20,10 V22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M26,11 C26,9 22,9 22,13 C22,17 26,15 26,19 C26,23 22,23 22,21" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          </svg>
          <span className="text-sm font-medium text-zinc-500">
            Easy Micro SaaS
          </span>
        </div>
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Easy Micro SaaS
        </p>
      </div>
    </footer>
  );
}
