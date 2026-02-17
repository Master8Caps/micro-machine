"use client";

import { useEffect, useState } from "react";
import { WaitlistButton } from "./waitlist-form";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" className="shrink-0">
            <defs>
              <linearGradient id="nav-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <path d="M2 7h7M2 16h5M2 25h7M2 7v18" fill="none" stroke="url(#nav-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 25V7l5.5 11L23 7v18" fill="none" stroke="url(#nav-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M30 10.5c0-2.2-1.2-3.5-3-3.5s-3 1.3-3 3.5c0 2.2 1.2 3 3 4s3 2 3 4.2c0 2.2-1.2 3.3-3 3.3s-3-1.1-3-3.3" fill="none" stroke="url(#nav-g)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-heading text-sm font-semibold tracking-tight">
            Easy Micro SaaS
          </span>
        </div>

        <WaitlistButton
          source="navbar"
          label="Get Early Access"
          className="rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
        />
      </div>
    </nav>
  );
}
