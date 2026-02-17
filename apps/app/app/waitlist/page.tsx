import { redirect } from "next/navigation";
import { requireAuth, getUserWithRole } from "@/server/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function WaitlistPage() {
  const user = await requireAuth();
  const { status } = await getUserWithRole();

  if (status !== "waitlist") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 32 32" className="mx-auto">
          <defs>
            <linearGradient id="wl-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#wl-g)"/>
          <path d="M8 6.5h16M8 6.5v5.5M8 9.25h13M8 12h16" stroke="#1e1b4b" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
          <path d="M8 20V14l8 4.5L24 14v6" stroke="#1e1b4b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M23 22Q23 21 16 21Q9 21 9 22.5Q9 24 16 24Q23 24 23 25.5Q23 27 16 27Q9 27 9 26" stroke="#1e1b4b" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
        </svg>

        <h1 className="mt-6 font-heading text-2xl font-bold">
          You&apos;re on the list
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Early access is opening soon. We&apos;ve saved your spot and
          will email you at{" "}
          <span className="font-medium text-zinc-200">{user.email}</span>{" "}
          as soon as your account is ready.
        </p>

        <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            What happens next?
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            We&apos;re onboarding users in small batches to ensure the best
            experience. You&apos;ll receive an email when your account is
            activated.
          </p>
        </div>

        <div className="mt-8">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
