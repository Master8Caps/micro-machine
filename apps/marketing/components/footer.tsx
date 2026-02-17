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
            <path d="M9,7 H23 M9,7 V14 M9,10.5 H20 M9,14 H23" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M9,21 V14 L16,18 L23,14 V21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M23,22 Q16,20 9,22.5 Q16,25 23,25 Q16,27 9,25" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
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
