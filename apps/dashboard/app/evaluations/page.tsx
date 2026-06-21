"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Play, Cpu, AlertTriangle, ShieldCheck, RefreshCw, ChevronRight, Check } from "lucide-react";
import { api } from "@/lib/api";
import { ModelConfig, Evaluation, ModuleMeta } from "@/lib/types";
import ProviderLogo from "@/components/ui/ProviderLogo";
import Link from "next/link";

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [triggering, setTriggering] = useState(false);

  // Form states
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [customConfig, setCustomConfig] = useState("");

  useEffect(() => {
    loadData();
    // Load metadata for form
    async function loadMetadata() {
      try {
        const modelsList = await api.getModels();
        setModels(modelsList);
        if (modelsList.length > 0) {
          setSelectedModelId(modelsList[0].id);
        }
        
        const modulesList = await api.getAvailableModules();
        setModules(modulesList);
        setSelectedModules(modulesList.map((m) => m.name)); // Default to all selected
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    }
    loadMetadata();
  }, []);

  // Poll evaluations if any are in PENDING or RUNNING status
  useEffect(() => {
    const hasActiveJobs = evaluations.some((e) => e.status === "PENDING" || e.status === "RUNNING");
    if (!hasActiveJobs) return;

    const interval = setInterval(async () => {
      try {
        const data = await api.getEvaluations();
        setEvaluations(data);
      } catch (err) {
        console.error("Failed to refresh evaluations", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [evaluations]);

  async function loadData() {
    try {
      const data = await api.getEvaluations();
      setEvaluations(data);
    } catch (err) {
      console.error("Failed to load evaluations", err);
    } finally {
      setLoading(false);
    }
  }

  const toggleModule = (moduleName: string) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter((name) => name !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
    }
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelId || selectedModules.length === 0) return;

    setTriggering(true);
    try {
      let configObj = {};
      if (customConfig.trim()) {
        try {
          configObj = JSON.parse(customConfig);
        } catch {
          alert("Invalid configuration JSON.");
          setTriggering(false);
          return;
        }
      }

      await api.triggerEvaluation({
        model_config_id: selectedModelId,
        modules: selectedModules,
        config: configObj,
      });

      setShowWizard(false);
      loadData();
    } catch (err) {
      console.error("Failed to start scan", err);
    } finally {
      setTriggering(false);
    }
  };

  // Helper to color status (Vercel style)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-zinc-900 text-zinc-300 border-zinc-800";
      case "RUNNING":
        return "bg-black text-cyan-400 border-cyan-500/20 animate-pulse";
      case "PENDING":
        return "bg-black text-zinc-500 border-zinc-900";
      case "FAILED":
        return "bg-zinc-950 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-950 text-zinc-500 border-zinc-900";
    }
  };

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
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Security Auditing</h2>
          <p className="text-zinc-400 text-xs mt-1">Configure evaluation tasks and view execution history.</p>
        </div>
        <button
          onClick={() => setShowWizard(!showWizard)}
          disabled={models.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-3.5 h-3.5 fill-black" /> Run Safety Check
        </button>
      </div>

      {/* Models Connected Warning */}
      {models.length === 0 && !loading && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex gap-3 text-xs text-zinc-400 items-start">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-500" />
          <div>
            <h4 className="font-semibold text-white">No Model Connected</h4>
            <p className="mt-1 text-zinc-400">You must configure at least one model connection before you can trigger a security scan.</p>
            <Link href="/models" className="mt-2 text-white hover:underline font-semibold block">
              Go to Connectors &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Wizard Form */}
        {showWizard && (
          <div className="lg:col-span-1 bg-black border border-zinc-900 rounded-xl p-5 h-fit animate-slide-in">
            <h3 className="text-xs font-bold text-zinc-500 font-mono tracking-wider uppercase mb-5">Configure Scan</h3>
            <form onSubmit={handleStartScan} className="space-y-4">
              
              <div>
                <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-1">Target Model</label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-2">Evaluation Modules</label>
                <div className="space-y-2">
                  {modules.map((m) => {
                    const isChecked = selectedModules.includes(m.name);
                    return (
                      <button
                        type="button"
                        key={m.name}
                        onClick={() => toggleModule(m.name)}
                        className={`w-full flex items-center justify-between p-3 border rounded-xl transition-all duration-150 text-left ${
                          isChecked
                            ? "bg-zinc-950 border-zinc-800 text-white"
                            : "bg-zinc-950/20 border-zinc-900 hover:bg-zinc-950 text-zinc-500"
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold font-mono tracking-wide uppercase">{m.name.replace("_", " ")}</h4>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{m.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? "bg-white border-white text-black" : "border-zinc-800"
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-1">Custom Settings (JSON)</label>
                <textarea
                  placeholder='e.g. { "temperature": 0.0 }'
                  value={customConfig}
                  onChange={(e) => setCustomConfig(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors h-16 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={triggering || selectedModules.length === 0}
                className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition-colors duration-150 disabled:opacity-50"
              >
                {triggering ? "Starting..." : "Start Scan Job"}
              </button>

            </form>
          </div>
        )}

        {/* History List */}
        <div className={showWizard ? "lg:col-span-2 space-y-4" : "lg:col-span-3 space-y-4"}>
          
          <div className="bg-black border border-zinc-900 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider uppercase">Scan Tasks</h3>
              <button
                onClick={loadData}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-950 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <span className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : evaluations.length === 0 ? (
              <div className="py-12 border border-zinc-900 border-dashed rounded-xl flex flex-col items-center justify-center text-center text-zinc-500">
                <ShieldCheck className="w-6 h-6 mb-2" />
                <p className="text-xs">No scan history found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {evaluations.map((e) => (
                  <div
                    key={e.id}
                    className="bg-zinc-950/20 border border-zinc-900 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <ProviderLogo provider={e.model_config?.provider || "custom"} className="w-4 h-4" />
                        <h4 className="font-bold text-zinc-200 text-xs">
                          {e.model_config?.name || "Unknown"}
                        </h4>
                        <span className="text-[9px] text-zinc-500 font-mono">({e.model_config?.model_id})</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-1 font-mono">ID: {e.id.substring(0, 8)}...</p>
                      
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {e.modules.map((m) => (
                          <span key={m} className="px-2 py-0.5 bg-zinc-950 border border-zinc-900 rounded text-[9px] font-mono text-zinc-400">
                            {m.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-zinc-900/60 pt-3 md:pt-0">
                      
                      {e.status === "COMPLETED" && (
                        <div className="text-left md:text-right">
                          <span className="text-[8px] text-zinc-650 block font-mono uppercase tracking-wider">Overall score</span>
                          <span className={`text-xs font-semibold font-mono ${getGradeStyle(e.grade)}`}>
                            {e.grade} ({e.overall_score}%)
                          </span>
                        </div>
                      )}

                      {e.status === "FAILED" && (
                        <div className="text-left md:text-right max-w-[180px]">
                          <span className="text-[8px] text-red-500 block font-mono uppercase tracking-wider">Failure description</span>
                          <span className="text-[9px] text-zinc-500 font-mono block truncate">
                            {e.error_message || "Execution failed."}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-medium border ${getStatusBadge(e.status)}`}>
                          {e.status}
                        </span>
                        
                        {e.status === "COMPLETED" && (
                          <Link
                            href={`/reports`}
                            className="p-1 rounded border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
