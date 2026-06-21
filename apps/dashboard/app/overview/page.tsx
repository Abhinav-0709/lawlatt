"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, ShieldAlert, Cpu, FileBarChart, Play, ChevronRight, Activity, Award } from "lucide-react";
import { api } from "@/lib/api";
import { Evaluation } from "@/lib/types";
import ProviderLogo from "@/components/ui/ProviderLogo";

export default function OverviewPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getEvaluations();
        setEvaluations(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate statistics
  const completedScans = evaluations.filter((e) => e.status === "COMPLETED");
  const runningScans = evaluations.filter((e) => e.status === "RUNNING" || e.status === "PENDING");
  const failedScans = evaluations.filter((e) => e.status === "FAILED");
  
  const averageScore = completedScans.length
    ? Math.round(completedScans.reduce((acc, e) => acc + (e.overall_score || 0), 0) / completedScans.length)
    : null;

  // Find average category scores
  const avgSecurity = completedScans.length
    ? Math.round(completedScans.reduce((acc, e) => acc + (e.security_score || 0), 0) / completedScans.length)
    : 100;
  const avgReliability = completedScans.length
    ? Math.round(completedScans.reduce((acc, e) => acc + (e.reliability_score || 0), 0) / completedScans.length)
    : 100;
  const avgPrivacy = completedScans.length
    ? Math.round(completedScans.reduce((acc, e) => acc + (e.privacy_score || 0), 0) / completedScans.length)
    : 100;
  const avgBias = completedScans.length
    ? Math.round(completedScans.reduce((acc, e) => acc + (e.bias_score || 0), 0) / completedScans.length)
    : 100;

  // Helper to color grades (Vercel style monochrome with high-contrast text)
  const getGradeStyle = (grade?: string) => {
    if (!grade) return "text-zinc-500";
    if (grade.startsWith("A")) return "text-emerald-400 font-semibold";
    if (grade.startsWith("B")) return "text-cyan-400 font-semibold";
    if (grade.startsWith("C")) return "text-yellow-500 font-semibold";
    if (grade.startsWith("D")) return "text-orange-500 font-semibold";
    return "text-red-500 font-semibold";
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Vulnerability Dashboard</h2>
          <p className="text-zinc-400 text-xs mt-1">Review live safety evaluations and vulnerability indexes.</p>
        </div>
        <Link
          href="/evaluations"
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition-all duration-150 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-black" /> Run Safety Scan
        </Link>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {[
          { label: "Total Evaluations", val: evaluations.length, desc: "Safety assessments run" },
          { label: "Safety Index Avg", val: averageScore !== null ? `${averageScore}%` : "—", desc: "Overall weighted average" },
          { label: "Async Tasks Running", val: runningScans.length, desc: "Background processes" },
          { label: "Failed Scans", val: failedScans.length, desc: "Unsuccessful operations" }
        ].map((stat, sIdx) => (
          <div key={sIdx} className="bg-black border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 flex flex-col justify-between h-28 transition-colors duration-150">
            <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">{stat.label}</span>
            <h3 className="text-2xl font-bold text-white font-mono mt-1">{stat.val}</h3>
            <span className="text-[9px] text-zinc-650 mt-1 block">{stat.desc}</span>
          </div>
        ))}

      </div>

      {/* Progress Bars */}
      <div className="bg-black border border-zinc-900 rounded-xl p-5">
        <h3 className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider uppercase mb-5">Average Index by Dimension</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Security", val: avgSecurity },
            { label: "Reliability", val: avgReliability },
            { label: "Privacy", val: avgPrivacy },
            { label: "Bias & Toxicity", val: avgBias },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-lg">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                <span>{item.label}</span>
                <span className="font-mono">{item.val}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${item.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Scans */}
        <div className="lg:col-span-2 bg-black border border-zinc-900 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider uppercase">Recent Scans</h3>
            <Link href="/evaluations" className="text-zinc-300 text-xs hover:text-white flex items-center gap-0.5">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex-grow flex items-center justify-center py-10">
              <span className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-grow flex items-center justify-center text-xs text-red-500 py-10 font-mono">
              Error: {error}
            </div>
          ) : completedScans.length === 0 && runningScans.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-10 text-zinc-500">
              <Shield className="w-6 h-6 text-zinc-800 mb-2" />
              <p className="text-xs">No scans run yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-mono uppercase tracking-wider text-[9px] pb-2">
                    <th className="pb-2.5 font-semibold">Model</th>
                    <th className="pb-2.5 font-semibold">Checks</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold">Grade</th>
                    <th className="pb-2.5 font-semibold text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-950">
                  {evaluations.slice(0, 5).map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-950/40">
                      <td className="py-3 font-medium text-zinc-200">
                        <div className="flex items-center gap-2">
                          <ProviderLogo provider={e.model_config?.provider || "custom"} className="w-4 h-4 shrink-0" />
                          <div>
                            <span className="text-zinc-200 font-semibold">{e.model_config?.name}</span>
                            <span className="block text-[9px] text-zinc-500 font-mono mt-0.5">{e.model_config?.model_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-zinc-400 max-w-[120px] truncate">
                        {e.modules.join(", ").replace(/_/g, " ")}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${
                          e.status === "COMPLETED"
                            ? "bg-zinc-900 text-zinc-200 border-zinc-850"
                            : e.status === "RUNNING"
                            ? "bg-zinc-950 text-cyan-400 border-cyan-500/20 animate-pulse"
                            : e.status === "FAILED"
                            ? "bg-red-950/20 text-red-500 border-red-500/20"
                            : "bg-zinc-950 text-zinc-500 border-zinc-900"
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className={`py-3 font-bold font-mono ${getGradeStyle(e.grade)}`}>
                        {e.grade || "—"}
                      </td>
                      <td className="py-3 text-right font-mono text-white font-bold">
                        {e.overall_score !== null ? `${e.overall_score}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Shortcuts */}
        <div className="bg-black border border-zinc-900 rounded-xl p-5 space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider uppercase">Connectors & Audits</h3>
          
          <div className="space-y-3">
            <Link
              href="/models"
              className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">API Connectors</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Configure API credentials</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileBarChart className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">Safety Reports</h4>
                  <p className="text-[9px] text-zinc-500 mt-0.5">Export Markdown and PDF files</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
