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
            <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#nav-g)"/>
            <path d="M6,10 H11 M6,10 V22 M6,16 H10 M6,22 H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            <path d="M13,22 V10 L16.5,15 L20,10 V22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M26,11 C26,9 22,9 22,13 C22,17 26,15 26,19 C26,23 22,23 22,21" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
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
