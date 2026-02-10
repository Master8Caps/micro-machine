"use client";

import { useEffect, useState } from "react";

interface WaitlistButtonProps {
  source?: string;
  label?: string;
  className?: string;
}

export function WaitlistButton({
  source = "marketing-site",
  label = "Join the Waitlist",
  className,
}: WaitlistButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "rounded-lg bg-white px-8 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        }
      >
        {label}
      </button>
      {open && <WaitlistModal source={source} onClose={() => setOpen(false)} />}
    </>
  );
}

function WaitlistModal({
  source,
  onClose,
}: {
  source: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 transition-colors hover:text-zinc-300"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="py-4 text-center">
            <p className="font-heading text-lg font-semibold">You&apos;re on the list</p>
            <p className="mt-2 text-sm text-zinc-400">
              We&apos;ll reach out when early access opens up.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-lg bg-zinc-800 px-6 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-heading text-lg font-semibold">Join the Waitlist</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Early access opening soon. Be first in line.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {status === "loading" ? "Joining..." : "Join the Waitlist"}
              </button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
