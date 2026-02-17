import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserWithRole, requireAuth } from "@/server/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserProvider } from "@/components/user-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const { role, status } = await getUserWithRole();

  if (status === "waitlist") {
    redirect("/waitlist");
  }

  return (
    <UserProvider email={user.email ?? ""} role={role}>
      <div className="flex min-h-screen">
        <aside className="flex w-60 flex-col border-r border-white/[0.06] px-4 py-5">
          <Link href="/" className="flex items-center gap-2.5 px-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" className="shrink-0">
              <defs>
                <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#818cf8"/>
                  <stop offset="100%" stopColor="#a78bfa"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#logo-g)"/>
              <path d="M6,10 H11 M6,10 V22 M6,16 H10 M6,22 H11" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M13,22 V10 L16.5,15 L20,10 V22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M26,11 C26,9 22,9 22,13 C22,17 26,15 26,19 C26,23 22,23 22,21" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="font-heading text-sm font-semibold tracking-tight">Easy Micro SaaS</span>
          </Link>
          <SidebarNav />
          <div className="mt-auto border-t border-white/[0.06] px-3 pt-4">
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
            <SignOutButton />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </UserProvider>
  );
}
