export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  base_url?: string;
  api_key?: string;
  is_active: boolean;
  created_at: string;
}

export interface ModuleResult {
  id: string;
  module_name: string;
  score: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  confidence?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tests_run: number;
  tests_passed: number;
  tests_failed: number;
  findings?: Array<{
    id: string;
    technique?: string;
    input?: string;
    response?: string;
    expected_leak?: string;
    passed: boolean;
    vulnerability?: string;
    category?: string;
    question?: string;
    expected_fact?: string;
  }>;
  created_at: string;
}

export interface Evaluation {
  id: string;
  model_config_id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  error_message?: string;
  modules: string[];
  config?: Record<string, any>;
  overall_score?: number;
  grade?: string;
  security_score?: number;
  reliability_score?: number;
  privacy_score?: number;
  bias_score?: number;
  created_at: string;
  completed_at?: string;
  model_config?: ModelConfig;
  module_results: ModuleResult[];
}

export interface ReportSummary {
  id: string;
  evaluation_id: string;
  overall_score: number;
  grade: string;
  security_score: number;
  reliability_score: number;
  privacy_score: number;
  bias_score: number;
  created_at: string;
}

export interface ModuleMeta {
  name: string;
  description: string;
  category: 'security' | 'reliability' | 'privacy' | 'bias';
}
