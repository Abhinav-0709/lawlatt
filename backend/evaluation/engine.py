from typing import List, Dict, Any
from backend.connectors.base import ModelConnector
from backend.evaluation.base_module import BaseEvalModule
from backend.evaluation.modules.prompt_injection import PromptInjectionModule
from backend.evaluation.modules.jailbreak import JailbreakModule
from backend.evaluation.modules.hallucination import HallucinationModule
from backend.evaluation.modules.prompt_leakage import PromptLeakageModule
from backend.evaluation.modules.toxicity import ToxicityModule
from backend.evaluation.scoring.risk_engine import calculate_scores

class EvaluationEngine:
    def __init__(self):
        # Register all available modules
        self.modules: Dict[str, BaseEvalModule] = {
            "prompt_injection": PromptInjectionModule(),
            "jailbreak": JailbreakModule(),
            "hallucination": HallucinationModule(),
            "prompt_leakage": PromptLeakageModule(),
            "toxicity": ToxicityModule()
        }

    def get_available_modules(self) -> List[Dict[str, str]]:
        return [
            {
                "name": name,
                "description": module.description,
                "category": module.category
            }
            for name, module in self.modules.items()
        ]

    async def run_evaluation(
        self, 
        model: ModelConnector, 
        module_names: List[str],
        progress_callback = None
    ) -> Dict[str, Any]:
        """
        Runs the specified evaluation modules against the model.
        Supports a progress callback for streaming updates during execution.
        """
        results = []
        
        # Filter modules to run
        to_run = [name for name in module_names if name in self.modules]
        if not to_run:
            # Default to all if none specified
            to_run = list(self.modules.keys())
            
        total_modules = len(to_run)
        
        for idx, name in enumerate(to_run):
            module = self.modules[name]
            
            if progress_callback:
                await progress_callback(name, "running", idx / total_modules)
                
            try:
                # Run the evaluation module
                result = await module.evaluate(model)
                # Keep record of category and name
                result["module"] = name
                result["category"] = module.category
                results.append(result)
                
                if progress_callback:
                    await progress_callback(name, "completed", (idx + 1) / total_modules)
            except Exception as e:
                failed_result = {
                    "module": name,
                    "category": module.category,
                    "score": 0.0,
                    "status": "FAIL",
                    "confidence": 0.0,
                    "severity": "high",
                    "tests_run": 0,
                    "tests_passed": 0,
                    "tests_failed": 0,
                    "findings": [],
                    "reason": f"Evaluation error: {str(e)}"
                }
                results.append(failed_result)
                
                if progress_callback:
                    await progress_callback(name, "failed", (idx + 1) / total_modules)

        # Calculate final safety posture
        summary_scores = calculate_scores(results)
        
        return {
            "summary": summary_scores,
            "results": results
        }
