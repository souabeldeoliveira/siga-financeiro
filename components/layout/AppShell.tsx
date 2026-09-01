"use client";

import { usePathname } from "next/navigation";

import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

type AppShellProps = { children: React.ReactNode };

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f9eee5,_var(--background)_48%)] px-4 py-6 sm:px-6">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f9eee5,_var(--background)_48%)] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <MobileNav />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
