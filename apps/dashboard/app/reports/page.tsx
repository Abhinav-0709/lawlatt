"use client";

import { useEffect, useState } from "react";
import { FileText, Download, ShieldCheck, ShieldAlert, ChevronRight, ChevronDown, FileBarChart, Sparkles, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { ReportSummary, Evaluation, ModuleResult } from "@/lib/types";
import ProviderLogo from "@/components/ui/ProviderLogo";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Detail views state
  const [evaluationDetail, setEvaluationDetail] = useState<Evaluation | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModuleAccordion = (moduleName: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Fetch specific evaluation details when a report is selected
  useEffect(() => {
    if (!selectedReportId) return;
    
    async function loadDetail() {
      setDetailLoading(true);
      try {
        const report = reports.find((r) => r.id === selectedReportId);
        if (report) {
          const detail = await api.getEvaluation(report.evaluation_id);
          setEvaluationDetail(detail);
        }
      } catch (err) {
        console.error("Failed to load evaluation details", err);
      } finally {
        setDetailLoading(false);
      }
    }
    loadDetail();
  }, [selectedReportId, reports]);

  async function loadReports() {
    try {
      const data = await api.getReports();
      setReports(data);
      if (data.length > 0) {
        setSelectedReportId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }

  const getGradeColor = (grade?: string) => {
    if (!grade) return "text-zinc-500";
    if (grade.startsWith("A")) return "text-emerald-400 font-semibold";
    if (grade.startsWith("B")) return "text-cyan-400 font-semibold";
    if (grade.startsWith("C")) return "text-yellow-500 font-semibold";
    if (grade.startsWith("D")) return "text-orange-500 font-semibold";
    return "text-red-500 font-semibold";
  };

  const getSeverityBadge = (sev?: string) => {
    switch (sev) {
      case "critical":
        return "bg-zinc-950 text-red-400 border-red-500/20";
      case "high":
        return "bg-zinc-950 text-orange-400 border-orange-500/20";
      case "medium":
        return "bg-zinc-950 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-zinc-950 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-950 text-zinc-400 border-zinc-900";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in h-[calc(100vh-80px)] flex flex-col font-sans">
      
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 shrink-0">
        <h2 className="text-xl font-bold text-white tracking-tight">Audit Logs & Reports</h2>
        <p className="text-zinc-400 text-xs mt-1">Review safety indexes, benchmark tables, and export audits.</p>
      </div>

      {/* Main Content Area: Split pane */}
      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        
        {/* Left Pane: Reports list */}
        <div className="w-80 flex flex-col bg-black border border-zinc-900 rounded-xl p-4 overflow-y-auto shrink-0 min-h-0">
          <h3 className="text-[9px] font-bold text-zinc-500 font-mono tracking-wider uppercase mb-4 px-2">Reports List</h3>
          
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <span className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-zinc-500 p-4">
              <FileBarChart className="w-6 h-6 mb-2" />
              <p className="text-xs">No reports generated yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {reports.map((report) => {
                const isSelected = selectedReportId === report.id;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all duration-150 ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-800 text-white"
                        : "bg-zinc-950/20 border-zinc-950 hover:bg-zinc-950 hover:border-zinc-900 text-zinc-450"
                    }`}
                  >
                    <div>
                      <span className="text-[8px] font-mono block text-zinc-500 mb-1">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200 truncate max-w-[150px]">
                        Scan {report.evaluation_id.substring(0, 8)}
                      </h4>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-extrabold font-mono block ${getGradeColor(report.grade)}`}>
                        {report.grade}
                      </span>
                      <span className="text-[8px] font-mono text-zinc-500">{report.overall_score}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Report details */}
        <div className="flex-1 bg-black border border-zinc-900 rounded-xl flex flex-col overflow-hidden min-h-0">
          {detailLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <span className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !evaluationDetail ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-zinc-500 p-8">
              <FileText className="w-8 h-8 mb-2" />
              <p className="text-xs">Select a report from the list to view compliance logs.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              
              {/* Report Header */}
              <div className="p-5 border-b border-zinc-900 bg-zinc-950/20 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <ProviderLogo provider={evaluationDetail.model_config?.provider || "custom"} className="w-4 h-4" />
                    <h3 className="font-bold text-white text-sm">
                      {evaluationDetail.model_config?.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[10px] text-zinc-400">
                    <span>Model: <b className="text-zinc-300 font-mono">{evaluationDetail.model_config?.model_id}</b></span>
                    <span>Provider: <b className="text-zinc-300 font-mono uppercase">{evaluationDetail.model_config?.provider}</b></span>
                    <span>Completed: <b className="text-zinc-300">{evaluationDetail.completed_at ? new Date(evaluationDetail.completed_at).toLocaleString() : "—"}</b></span>
                  </div>
                </div>

                {/* Exporters */}
                <div className="flex gap-2">
                  <a
                    href={api.getDownloadUrl(evaluationDetail.id, "pdf")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    <Download className="w-3 h-3" /> PDF
                  </a>
                  <a
                    href={api.getDownloadUrl(evaluationDetail.id, "markdown")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    <Download className="w-3 h-3" /> MD
                  </a>
                  <a
                    href={api.getDownloadUrl(evaluationDetail.id, "json")}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    <Download className="w-3 h-3" /> JSON
                  </a>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="flex-grow overflow-y-auto p-5 space-y-6 min-h-0">
                
                {/* Score Dashboard Card */}
                <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-lg flex flex-col sm:flex-row gap-6 items-center">
                  <div className="text-center shrink-0 border-r border-zinc-900 pr-6 sm:pr-8">
                    <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">Safety Grade</span>
                    <h4 className={`text-4xl font-extrabold font-mono leading-none ${getGradeColor(evaluationDetail.grade)}`}>
                      {evaluationDetail.grade}
                    </h4>
                    <span className="text-[10px] text-zinc-400 block font-mono mt-1.5">{evaluationDetail.overall_score}% INDEX</span>
                  </div>

                  <div className="flex-grow w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Security", val: evaluationDetail.security_score, col: "text-red-400" },
                      { label: "Reliability", val: evaluationDetail.reliability_score, col: "text-purple-400" },
                      { label: "Privacy", val: evaluationDetail.privacy_score, col: "text-cyan-400" },
                      { label: "Bias/Toxicity", val: evaluationDetail.bias_score, col: "text-emerald-400" },
                    ].map((item) => (
                      <div key={item.label} className="bg-black border border-zinc-900 p-3 rounded-lg text-center">
                        <span className="text-[8px] text-zinc-500 block font-mono uppercase">{item.label}</span>
                        <span className={`text-sm font-bold font-mono mt-1 block ${item.col}`}>
                          {item.val !== null && item.val !== undefined ? `${item.val}%` : "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modules checklist */}
                <div className="space-y-3">
                  <h4 className="text-[9px] font-bold text-zinc-500 font-mono tracking-wider uppercase">Vulnerabilities Checklist</h4>
                  
                  <div className="space-y-2.5">
                    {evaluationDetail.module_results.map((res) => {
                      const isPass = res.status === "PASS";
                      const isWarning = res.status === "WARNING";
                      const isExpanded = expandedModules[res.module_name] || false;
                      
                      return (
                        <div key={res.id} className="border border-zinc-900 bg-zinc-950/20 rounded-lg p-4 space-y-3">
                          
                          {/* Module Header (Clickable Toggle) */}
                          <div
                            onClick={() => toggleModuleAccordion(res.module_name)}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:opacity-80 select-none"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isPass ? "bg-emerald-400" : isWarning ? "bg-yellow-400" : "bg-red-400"}`} />
                                <h5 className="text-xs font-bold text-zinc-200 capitalize">{res.module_name.replace("_", " ")}</h5>
                                <span className={`border text-[8px] px-2 py-0.5 rounded-full uppercase font-mono ${getSeverityBadge(res.severity)}`}>
                                  {res.severity || "LOW"}
                                </span>
                              </div>
                              <p className="text-[9px] text-zinc-500 mt-1 font-mono">
                                Probes Checked: {res.tests_run} | Passed: {res.tests_passed} | Failed: {res.tests_failed}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`text-xs font-bold font-mono ${isPass ? "text-emerald-400" : isWarning ? "text-yellow-400" : "text-red-450"}`}>
                                {res.score}% Index
                              </span>
                              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>

                          {/* Collapsible Details */}
                          {isExpanded && (
                            <div className="space-y-3 pt-3 border-t border-zinc-900/60 animate-fade-in">
                              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-2">
                                Detailed Probe Logs ({res.findings?.length || 0}):
                              </div>
                              <div className="space-y-2.5">
                                {res.findings && res.findings.length > 0 ? (
                                  res.findings.map((f, fIdx) => {
                                    const isProbePassed = f.passed;
                                    return (
                                      <div
                                        key={fIdx}
                                        className={`border rounded-lg p-3 text-[11px] space-y-2 transition-colors ${
                                          isProbePassed
                                            ? "bg-zinc-950/40 border-zinc-900/40"
                                            : "bg-black border-red-500/10"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between text-[9px]">
                                          <span className="font-semibold text-zinc-550">
                                            Technique: {f.technique || "Adversarial Attack"}
                                          </span>
                                          <span className={`font-mono font-semibold ${isProbePassed ? "text-emerald-400" : "text-red-500"}`}>
                                            {isProbePassed ? "PASS" : "FAIL"}
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-zinc-450">
                                            <b className="text-[8px] font-mono uppercase text-zinc-500 block mb-0.5">Prompt:</b> 
                                            &quot;{f.input || f.question}&quot;
                                          </p>
                                          <p className="text-zinc-300 font-mono leading-relaxed bg-zinc-950 p-2 rounded border border-zinc-900">
                                            <b className="text-[8px] font-mono uppercase text-zinc-500 block mb-0.5">Response:</b> 
                                            {f.response}
                                          </p>
                                        </div>
                                        {!isProbePassed && f.vulnerability && (
                                          <p className="text-red-400 text-[10px] font-medium">
                                            ⚠️ {f.vulnerability}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-[10px] text-zinc-500 italic">No probe logs recorded for this category.</p>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
