import { WaitlistButton } from "./waitlist-form";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
                <defs>
                  <linearGradient id="footer-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60a5fa"/>
                    <stop offset="100%" stopColor="#22d3ee"/>
                  </linearGradient>
                </defs>
                <path d="M3 26V6l6.5 14L16 6l6.5 14L29 6v20" fill="none" stroke="url(#footer-g)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="font-heading text-lg font-bold">Micro Machine</p>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Stop guessing. Start growing.
            </p>
          </div>
          <WaitlistButton
            source="footer"
            label="Join Waitlist"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          />
        </div>
        <div className="mt-8 border-t border-zinc-800/50 pt-8 text-center text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} Micro Machine. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
