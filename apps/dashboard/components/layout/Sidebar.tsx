"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Cpu, ShieldAlert, FileBarChart } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/overview", label: "Dashboard", icon: LayoutDashboard },
    { href: "/models", label: "Connect Models", icon: Cpu },
    { href: "/evaluations", label: "Security Scans", icon: ShieldAlert },
    { href: "/reports", label: "Safety Reports", icon: FileBarChart },
  ];

  return (
    <aside className="w-64 bg-black border-r border-zinc-900 text-zinc-200 flex flex-col h-screen fixed left-0 top-0 z-20 font-sans">
      {/* Brand Header: Vercel-like minimal style */}
      <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
        <div className="bg-white text-black p-1.5 rounded-lg">
          <Shield className="w-5 h-5 fill-black" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white uppercase">
            SentinelAI
          </h1>
          <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Safety Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-xs ${
                isActive
                  ? "bg-zinc-900 text-white font-medium border border-zinc-800"
                  : "text-zinc-400 hover:bg-zinc-950 hover:text-zinc-200 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Status Panel */}
      <div className="p-6 border-t border-zinc-900">
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 tracking-wider">SYSTEM ACTIVE</span>
          </div>
          <p className="text-[8px] text-zinc-650 font-mono">v1.0.0 (LOCAL-ONLY)</p>
        </div>
      </div>
    </aside>
  );
}
