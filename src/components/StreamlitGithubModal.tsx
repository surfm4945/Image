import React, { useState } from "react";
import {
  X,
  Code2,
  Copy,
  Check,
  Github,
  Terminal,
  FileCode,
  Sparkles,
  BookOpen,
  ArrowRight,
  Key,
} from "lucide-react";
import {
  generateStreamlitAppPy,
  generateStreamlitRequirementsTxt,
  generateStreamlitSecretsToml,
  generateGitHubGuideCommands,
} from "../lib/streamlitGenerator";

interface StreamlitGithubModalProps {
  isOpen: boolean;
  onClose: () => void;
  developerName?: string;
}

export const StreamlitGithubModal: React.FC<StreamlitGithubModalProps> = ({
  isOpen,
  onClose,
  developerName = "Furqan",
}) => {
  const [activeTab, setActiveTab] = useState<"appPy" | "requirements" | "secrets" | "github">("appPy");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  if (!isOpen) return null;

  const appPyCode = generateStreamlitAppPy(developerName);
  const requirementsTxt = generateStreamlitRequirementsTxt();
  const secretsToml = generateStreamlitSecretsToml();
  const gitHubGuide = generateGitHubGuideCommands(developerName);

  const handleCopy = (code: string, tabName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Streamlit Python & GitHub Developer Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 font-mono">
                  For {developerName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Beginner-friendly Python Streamlit code & GitHub deployment instructions
              </p>
            </div>
          </div>

          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
          <button
            id="btn-tab-apppy"
            onClick={() => setActiveTab("appPy")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl border-t border-x transition-all ${
              activeTab === "appPy"
                ? "bg-slate-900 text-cyan-400 border-slate-700 font-bold"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>app.py (Streamlit)</span>
          </button>

          <button
            id="btn-tab-requirements"
            onClick={() => setActiveTab("requirements")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl border-t border-x transition-all ${
              activeTab === "requirements"
                ? "bg-slate-900 text-cyan-400 border-slate-700 font-bold"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>requirements.txt</span>
          </button>

          <button
            id="btn-tab-secrets"
            onClick={() => setActiveTab("secrets")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl border-t border-x transition-all ${
              activeTab === "secrets"
                ? "bg-slate-900 text-cyan-400 border-slate-700 font-bold"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>secrets.toml (API Key)</span>
          </button>

          <button
            id="btn-tab-github"
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl border-t border-x transition-all ${
              activeTab === "github"
                ? "bg-slate-900 text-cyan-400 border-slate-700 font-bold"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Github className="w-4 h-4 text-purple-400" />
            <span>GitHub & Streamlit Cloud Guide</span>
          </button>
        </div>

        {/* Code View Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950/80">
          {activeTab === "appPy" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">
                  Full Python Streamlit App (`app.py`) • Developed by {developerName}
                </span>
                <button
                  id="btn-copy-apppy"
                  onClick={() => handleCopy(appPyCode, "appPy")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedTab === "appPy" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono overflow-x-auto max-h-[380px]">
                {appPyCode}
              </pre>
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">
                  Python Dependencies (`requirements.txt`)
                </span>
                <button
                  id="btn-copy-reqs"
                  onClick={() => handleCopy(requirementsTxt, "requirements")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedTab === "requirements" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy requirements.txt</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono overflow-x-auto max-h-[380px]">
                {requirementsTxt}
              </pre>
            </div>
          )}

          {activeTab === "secrets" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">
                  Streamlit Secrets Config (`.streamlit/secrets.toml`)
                </span>
                <button
                  id="btn-copy-secrets"
                  onClick={() => handleCopy(secretsToml, "secrets")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedTab === "secrets" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy secrets.toml</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-200">
                💡 <strong>Beginner Tip:</strong> When deploying on Streamlit Cloud (share.streamlit.io), go to <strong>App Settings → Secrets</strong> and paste <code className="bg-amber-900/50 px-1 py-0.5 rounded">GEMINI_API_KEY = "your_key"</code> so your API key stays secure and hidden!
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-200 font-mono overflow-x-auto max-h-[340px]">
                {secretsToml}
              </pre>
            </div>
          )}

          {activeTab === "github" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">
                  Git Terminal & Deployment Commands for {developerName}
                </span>
                <button
                  id="btn-copy-github"
                  onClick={() => handleCopy(gitHubGuide, "github")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedTab === "github" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Step-by-Step Guide</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-purple-200 font-mono overflow-x-auto max-h-[380px]">
                {gitHubGuide}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Tip: Save <code className="text-cyan-400">app.py</code> and <code className="text-cyan-400">requirements.txt</code> in the same folder before running <code className="text-cyan-400">streamlit run app.py</code></span>
          <button
            id="btn-close-modal-bottom"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
