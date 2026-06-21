"use client";

import { useEffect, useState } from "react";
import { Cpu, Plus, Trash2, ShieldCheck, ShieldAlert, Sparkles, Server } from "lucide-react";
import { api } from "@/lib/api";
import { ModelConfig } from "@/lib/types";
import ProviderLogo from "@/components/ui/ProviderLogo";

const modelPresets: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  gemini: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-thinking", "gemini-1.5-flash", "gemini-1.5-pro"],
  anthropic: ["claude-3-5-sonnet-20240620", "claude-3-haiku-20240307", "claude-3-opus-20240229"],
  groq: ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
  ollama: ["llama3", "mistral", "gemma", "phi3"]
};

export default function ModelsPage() {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("openai");
  const [modelId, setModelId] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: "success" | "failed" | null; message: string }>({
    status: null,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      const data = await api.getModels();
      setConfigs(data);
    } catch (err) {
      console.error("Failed to load model configurations", err);
    } finally {
      setLoading(false);
    }
  }

  // Pre-fill Model ID when Provider changes
  useEffect(() => {
    if (provider === "openai") {
      setModelId("gpt-4o");
    } else if (provider === "gemini") {
      setModelId("gemini-2.5-flash");
    } else if (provider === "anthropic") {
      setModelId("claude-3-5-sonnet-20240620");
    } else if (provider === "groq") {
      setModelId("llama-3.1-8b-instant");
    } else if (provider === "ollama") {
      setModelId("llama3");
      setBaseUrl("http://localhost:11434");
    } else {
      setModelId("");
      setBaseUrl("");
    }
  }, [provider]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult({ status: null, message: "" });
    try {
      const res = await api.testConnection({
        provider,
        model_id: modelId,
        api_key: apiKey || undefined,
        base_url: baseUrl || undefined,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ status: "failed", message: err.message || "Failed to reach model server." });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !provider || !modelId) return;

    setSubmitting(true);
    try {
      await api.createModel({
        name,
        provider,
        model_id: modelId,
        api_key: apiKey || undefined,
        base_url: baseUrl || undefined,
      });
      // Reset form
      setName("");
      setApiKey("");
      setBaseUrl("");
      setTestResult({ status: null, message: "" });
      setShowForm(false);
      // Reload configs
      loadConfigs();
    } catch (err) {
      console.error("Failed to save model configuration", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this model configuration?")) return;
    try {
      await api.deleteModel(id);
      loadConfigs();
    } catch (err) {
      console.error("Failed to delete configuration", err);
    }
  };

  // Helper to resolve card left-border brand highlights
  const getBrandBorderClass = (provider: string) => {
    const norm = provider.toLowerCase();
    if (norm === "openai") return "border-l-2 border-l-[#10a37f]";
    if (norm === "gemini") return "border-l-2 border-l-[#4285F4]";
    if (norm === "anthropic") return "border-l-2 border-l-[#cc785c]";
    if (norm === "groq") return "border-l-2 border-l-[#f97316]";
    if (norm === "ollama") return "border-l-2 border-l-zinc-200";
    return "border-l-2 border-l-zinc-700";
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">API Connectors</h2>
          <p className="text-zinc-400 text-xs mt-1">Manage connected endpoints, security keys, and credentials.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition-all duration-150 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Connect Model
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Config Form Column */}
        {showForm && (
          <div className="lg:col-span-1 bg-black border border-zinc-900 rounded-xl p-5 h-fit animate-slide-in">
            <h3 className="text-xs font-bold text-zinc-500 font-mono tracking-wider uppercase mb-5">New Connection</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-1">Configuration Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Groq Llama3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                >
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="groq">Groq (Ultra-Fast)</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="custom">Custom / LiteLLM Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-1">Model ID</label>
                {provider !== "custom" ? (
                  <div className="space-y-2">
                    <select
                      value={modelPresets[provider]?.includes(modelId) ? modelId : "custom"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "custom") {
                          setModelId(val);
                        } else {
                          setModelId("");
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                    >
                      {modelPresets[provider]?.map((preset) => (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      ))}
                      <option value="custom">Custom ID / Other...</option>
                    </select>

                    {(!modelPresets[provider]?.includes(modelId) || modelId === "") && (
                      <input
                        type="text"
                        required
                        placeholder="Enter custom model ID"
                        value={modelId}
                        onChange={(e) => setModelId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. openrouter/meta-llama/llama-3-70b-instruct"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                )}
              </div>

              {provider !== "ollama" && (
                <div>
                  <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-1">API Key (Optional / Env)</label>
                  <input
                    type="password"
                    placeholder="Defaults to server .env variable"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              )}

              {(provider === "ollama" || provider === "custom") && (
                <div>
                  <label className="block text-[9px] text-zinc-500 font-mono uppercase mb-1">Base URL (API Endpoint)</label>
                  <input
                    type="text"
                    placeholder={provider === "ollama" ? "http://localhost:11434" : "https://api.domain.com/v1"}
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="flex-1 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  {testing ? "Testing..." : "Test"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-3 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Connection Status Banner */}
              {testResult.status && (
                <div className={`mt-3 p-3 rounded-lg border text-xs flex gap-2 items-start ${
                  testResult.status === "success"
                    ? "bg-zinc-950 text-emerald-400 border-emerald-500/10"
                    : "bg-zinc-950 text-red-400 border-red-500/10"
                }`}>
                  {testResult.status === "success" ? (
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

            </form>
          </div>
        )}

        {/* Configurations List Column */}
        <div className={showForm ? "lg:col-span-2 space-y-4" : "lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6"}>
          
          {loading ? (
            <div className="col-span-full py-16 flex items-center justify-center">
              <span className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : configs.length === 0 ? (
            <div className="col-span-full py-16 border border-zinc-900 border-dashed rounded-xl flex flex-col items-center justify-center text-center text-zinc-500">
              <Cpu className="w-6 h-6 mb-2" />
              <p className="text-xs">No model connections registered. Connect one above!</p>
            </div>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className={`bg-black border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 flex flex-col justify-between h-40 transition-colors duration-150 ${getBrandBorderClass(
                  config.provider
                )}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-xs leading-snug">{config.name}</h4>
                      
                      {/* Logo and Provider Tag */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <ProviderLogo provider={config.provider} className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-mono font-medium uppercase text-zinc-400">
                          {config.provider}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="mt-3.5 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Server className="w-3.5 h-3.5 text-zinc-700" />
                    <span className="font-mono text-[9px] truncate max-w-[170px]">{config.model_id}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 pt-2.5 mt-3 flex justify-between items-center text-[9px] text-zinc-500">
                  <span className="font-mono text-zinc-600">ID: {config.id.substring(0, 8)}</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" /> ACTIVE
                  </span>
                </div>
              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}
