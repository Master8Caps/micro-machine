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
            <path d="M2 7h7M2 16h5M2 25h7M2 7v18" fill="none" stroke="url(#footer-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 25V7l5.5 11L23 7v18" fill="none" stroke="url(#footer-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M30 10.5c0-2.2-1.2-3.5-3-3.5s-3 1.3-3 3.5c0 2.2 1.2 3 3 4s3 2 3 4.2c0 2.2-1.2 3.3-3 3.3s-3-1.1-3-3.3" fill="none" stroke="url(#footer-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
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
