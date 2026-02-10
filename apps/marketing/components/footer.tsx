import { WaitlistButton } from "./waitlist-form";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <p className="font-heading text-lg font-bold">Micro Machine</p>
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
