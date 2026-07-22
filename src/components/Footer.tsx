import React from "react";
import { Zap, Github, Cpu, ShieldCheck, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-slate-950 border-t border-slate-800/80 py-8 px-4 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              ApexScale AI
              <span className="text-[10px] text-cyan-400 font-mono">v2.5 Ultra</span>
            </div>
            <p className="text-[11px] text-slate-500">
              AI-Powered Low-Res to 4K/8K Media Upscaler & Batch Processor
            </p>
          </div>
        </div>

        {/* Center Developer Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          <span>Developed by</span>
          <span className="text-cyan-300 font-bold underline underline-offset-2 decoration-cyan-500/50">
            Furqan
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 text-[11px]">Streamlit & GitHub Ready</span>
        </div>

        {/* Right Badges */}
        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Client & Gemini AI Engine
          </span>
          <span>•</span>
          <span>Ultra HD 4K/8K</span>
        </div>
      </div>
    </footer>
  );
};
