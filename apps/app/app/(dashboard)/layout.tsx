import Link from "next/link";
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
  const { role } = await getUserWithRole();

  return (
    <UserProvider email={user.email ?? ""} role={role}>
      <div className="flex min-h-screen">
        <aside className="flex w-64 flex-col border-r border-zinc-800 p-6">
          <Link href="/" className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
              <defs>
                <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa"/>
                  <stop offset="100%" stopColor="#22d3ee"/>
                </linearGradient>
              </defs>
              <path d="M3 26V6l6.5 14L16 6l6.5 14L29 6v20" fill="none" stroke="url(#logo-g)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-heading text-lg font-bold">Micro Machine</span>
          </Link>
          <SidebarNav />
          <div className="mt-auto border-t border-zinc-800 pt-4">
            <p className="truncate text-sm text-zinc-400">{user.email}</p>
            <SignOutButton />
          </div>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </UserProvider>
  );
}
