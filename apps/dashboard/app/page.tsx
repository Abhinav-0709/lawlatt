"use client";

import Link from "next/link";
import { Shield, ShieldAlert, FileText, CheckCircle, Zap, ArrowRight, Eye, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex flex-col justify-between selection:bg-white selection:text-black font-sans">
      
      {/* Subtle Vercel-style background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-zinc-900 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white text-black p-1.5 rounded">
            <Shield className="w-5 h-5 fill-black" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white uppercase">LAWLATT</span>
            <span className="text-[8px] block text-zinc-500 font-mono tracking-widest uppercase">Safety Platform</span>
          </div>
        </div>
        <div>
          <Link
            href="/overview"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 transition-all duration-150"
          >
            Launch Console <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full px-6 py-20 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-850 bg-zinc-950 text-zinc-300 text-[10px] font-mono mb-8">
          <Zap className="w-3 h-3 text-white" /> VERCEL STYLE THEME
        </div>

        {/* Main Heading */}
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Is your AI application <br />
          <span className="text-zinc-500">safe enough to trust?</span>
        </h2>

        {/* Subtitle */}
        <p className="mt-6 text-sm text-zinc-400 max-w-xl leading-relaxed">
          Lawlatt is a clean, automated security scanner for LLMs and AI Agents. Attack, benchmark, and score security postures before deployment.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            href="/overview"
            className="flex items-center gap-1.5 px-6 py-3 rounded-lg text-xs font-semibold bg-white hover:bg-zinc-200 text-black shadow-sm transition-all duration-150"
          >
            Enter Console <ArrowRight className="w-4 h-4 text-black" />
          </Link>
          
          <Link
            href="/models"
            className="flex items-center gap-1.5 px-6 py-3 rounded-lg text-xs font-semibold border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 transition-all duration-150"
          >
            Connect Providers
          </Link>
        </div>

        {/* Target Demos Grid */}
        <div className="mt-24 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 hover:border-zinc-800 transition-colors duration-150">
            <h3 className="font-bold text-white text-sm mb-1.5">Penetration Testing</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Verify if malicious prompts can bypass safety guidelines, trigger jailbreaks, or leak system prompts.
            </p>
          </div>

          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 hover:border-zinc-800 transition-colors duration-150">
            <h3 className="font-bold text-white text-sm mb-1.5">Fact Grounding</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Expose hallucinations and check factual compliance on trick premises and critical knowledge domains.
            </p>
          </div>

          <div className="border border-zinc-900 bg-zinc-950/20 rounded-xl p-5 hover:border-zinc-800 transition-colors duration-150">
            <h3 className="font-bold text-white text-sm mb-1.5">Audit Compliance</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Auto-generate Markdown summaries, detailed JSON logs, and printable PDF safety reports.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-[10px] text-zinc-650 font-mono tracking-wider">
        LAWLATT — AN OPEN-SOURCE AI SAFETY PROJECT
      </footer>

    </div>
  );
}
