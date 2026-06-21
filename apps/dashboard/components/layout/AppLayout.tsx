"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <div className="min-h-screen bg-black text-zinc-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 pl-64 min-h-screen flex flex-col bg-black">
        <div className="p-8 max-w-6xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
