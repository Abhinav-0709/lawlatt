import { ModelConfig, Evaluation, ReportSummary, ModuleMeta } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // --- Models ---
  getModels: () => request<ModelConfig[]>("/models"),
  createModel: (config: Omit<ModelConfig, "id" | "is_active" | "created_at"> & { api_key?: string }) =>
    request<ModelConfig>("/models", {
      method: "POST",
      body: JSON.stringify(config),
    }),
  deleteModel: (id: string) =>
    request<{ message: string }>(`/models/${id}`, {
      method: "DELETE",
    }),
  testConnection: (req: { provider: string; model_id: string; api_key?: string; base_url?: string }) =>
    request<{ status: "success" | "failed"; message: string }>("/models/test", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // --- Evaluations ---
  getEvaluations: () => request<Evaluation[]>("/evaluations"),
  getEvaluation: (id: string) => request<Evaluation>(`/evaluations/${id}`),
  getAvailableModules: () => request<ModuleMeta[]>("/evaluations/modules"),
  triggerEvaluation: (req: { model_config_id: string; modules: string[]; config?: Record<string, any> }) =>
    request<Evaluation>("/evaluations", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // --- Reports ---
  getReports: () => request<ReportSummary[]>("/reports"),
  getReport: (id: string) => request<ReportSummary>(`/reports/${id}`),
  getDownloadUrl: (reportId: string, format: "pdf" | "markdown" | "json") => {
    return `${API_BASE}/reports/${reportId}/download/${format}`;
  }
};
