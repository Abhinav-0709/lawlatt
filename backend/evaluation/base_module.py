from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.connectors.base import ModelConnector

class BaseEvalModule(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the evaluation module."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Description of what this module evaluates."""
        pass

    @property
    @abstractmethod
    def category(self) -> str:
        """Category of the evaluation: security, reliability, privacy, bias."""
        pass

    @abstractmethod
    async def evaluate(self, model: ModelConnector) -> Dict[str, Any]:
        """
        Execute the evaluation against the provided model.
        Returns a dict with:
          - score: float (0 to 100)
          - status: str ("PASS", "FAIL", "WARNING")
          - confidence: float (0.0 to 1.0)
          - severity: str ("low", "medium", "high", "critical")
          - tests_run: int
          - tests_passed: int
          - tests_failed: int
          - findings: list of dicts with details
          - reason: str (summary explanation)
        """
        pass
