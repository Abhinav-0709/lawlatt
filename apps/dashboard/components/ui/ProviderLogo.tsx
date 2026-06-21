import React from "react";

interface ProviderLogoProps {
  provider: string;
  className?: string;
}

export default function ProviderLogo({ provider, className = "w-5 h-5" }: ProviderLogoProps) {
  const normalized = provider.toLowerCase();

  switch (normalized) {
    case "openai":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`${className} text-[#10a37f]`}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* OpenAI Swirl Outline Representation */}
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
        </svg>
      );
    case "gemini":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${className} text-[#4285F4]`}
        >
          {/* Gemini Sparkle Logo */}
          <path d="M12 2a.5.5 0 0 1 .5.5v3.626a5.374 5.374 0 0 0 4.374 4.374h3.626a.5.5 0 0 1 0 1h-3.626a5.374 5.374 0 0 0-4.374 4.374v3.626a.5.5 0 0 1-1 0v-3.626a5.374 5.374 0 0 0-4.374-4.374H2.5a.5.5 0 0 1 0-1h3.626A5.374 5.374 0 0 0 10.5 6.126V2.5a.5.5 0 0 1 .5-.5z" />
          <path d="M19 14a.5.5 0 0 1 .5.5v1.626a2.374 2.374 0 0 0 1.874 1.874h1.626a.5.5 0 0 1 0 1h-1.626a2.374 2.374 0 0 0-1.874 1.874v1.626a.5.5 0 0 1-1 0v-1.626a2.374 2.374 0 0 0-1.874-1.874h-1.626a.5.5 0 0 1 0-1h1.626a2.374 2.374 0 0 0 1.874-1.874v-1.626a.5.5 0 0 1 .5-.5z" />
        </svg>
      );
    case "anthropic":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${className} text-[#cc785c]`}
        >
          {/* Anthropic Stylized A Logo */}
          <path d="M12 2L3 22h4.2l1.8-4.5h6l1.8 4.5H21L12 2zm2.2 13.5H9.8L12 9.2l2.2 5.8z" />
        </svg>
      );
    case "groq":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`${className} text-[#f97316]`}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized Speed/Lightning G representation */}
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case "ollama":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${className} text-slate-100`}
        >
          {/* Ollama Stylized Octopus / Llama Silhouette */}
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
        </svg>
      );
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`${className} text-slate-400`}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Custom Network Node Logo */}
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="4" r="2" />
          <circle cx="20" cy="12" r="2" />
          <circle cx="12" cy="20" r="2" />
          <circle cx="4" cy="12" r="2" />
          <path d="M12 6v3M12 15v3M14 12h4M6 12h3" />
        </svg>
      );
  }
}
