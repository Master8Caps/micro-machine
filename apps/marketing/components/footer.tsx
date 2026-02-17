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
            <path d="M8 6.5h16M8 6.5v5.5M8 9.25h13M8 12h16" stroke="#1e1b4b" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
            <path d="M8 20V14l8 4.5L24 14v6" stroke="#1e1b4b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M23 22Q23 21 16 21Q9 21 9 22.5Q9 24 16 24Q23 24 23 25.5Q23 27 16 27Q9 27 9 26" stroke="#1e1b4b" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
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
