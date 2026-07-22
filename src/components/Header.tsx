import React from "react";
import { Sparkles, Code2, Github, Cpu, Layers, Zap, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

interface HeaderProps {
  activeTab: "image" | "video";
  setActiveTab: (tab: "image" | "video") => void;
  onOpenStreamlitModal: () => void;
  batchCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenStreamlitModal,
  batchCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Dev Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                ApexScale AI
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold uppercase tracking-wider">
                  4K / 8K
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Developed by</span>
              <span className="font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-2">
                Furqan
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Ultra UX/UI Engine</span>
            </p>
          </div>
        </div>

        {/* Media Selector Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
          <button
            id="tab-image-upscaler"
            onClick={() => setActiveTab("image")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "image"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Picture Upscaler
            {batchCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-extrabold text-[10px] rounded-full">
                {batchCount}
              </span>
            )}
          </button>

          <button
            id="tab-video-upscaler"
            onClick={() => setActiveTab("video")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "video"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            Video HD / 4K Engine
          </button>
        </div>

        {/* Action Buttons & Streamlit/GitHub Modal trigger */}
        <div className="flex items-center gap-2">
          <button
            id="btn-open-streamlit-github"
            onClick={onOpenStreamlitModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-all hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Streamlit & GitHub Code</span>
            <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] bg-cyan-950 text-cyan-300 rounded border border-cyan-700/50">
              For Furqan
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gemini AI Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
};
