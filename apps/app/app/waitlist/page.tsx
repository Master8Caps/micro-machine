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
          <path d="M6,10 H11 M6,10 V22 M6,16 H10 M6,22 H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M13,22 V10 L16.5,15 L20,10 V22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M26,11 C26,9 22,9 22,13 C22,17 26,15 26,19 C26,23 22,23 22,21" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
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
