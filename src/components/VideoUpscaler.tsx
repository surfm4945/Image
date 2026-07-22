import React, { useState } from "react";
import {
  Video as VideoIcon,
  Play,
  Pause,
  Sparkles,
  Zap,
  CheckCircle2,
  Sliders,
  Maximize2,
  RefreshCw,
  Film,
  Download,
  Shield,
  Layers,
} from "lucide-react";
import { VideoUpscaleStats } from "../types";

export const VideoUpscaler: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [targetPreset, setTargetPreset] = useState<"4K" | "1080p" | "8K">("4K");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(100);

  const [stats, setStats] = useState<VideoUpscaleStats>({
    originalResolution: "854x480 (480p SD)",
    targetResolution: "3840x2160 (4K Ultra HD)",
    originalBitrate: "1.2 Mbps",
    targetBitrate: "18.5 Mbps",
    fps: 60,
    totalFrames: 1440,
    processedFrames: 1440,
    estimatedTimeSec: 0,
  });

  const handleRunVideoUpscale = () => {
    setIsProcessing(true);
    setProgress(0);

    let curr = 0;
    const interval = setInterval(() => {
      curr += 5;
      setProgress(curr);
      setStats((prev) => ({
        ...prev,
        processedFrames: Math.round((curr / 100) * prev.totalFrames),
      }));

      if (curr >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 150);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/50">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Video Super-Resolution Engine
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                Frame-by-Frame 4K/8K
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Low-resolution MP4/WebM video frame interpolation and noise reduction
            </p>
          </div>
        </div>

        {/* Target Video Resolution Selector */}
        <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-1">
          {(["1080p", "4K", "8K"] as const).map((preset) => (
            <button
              key={preset}
              id={`video-preset-${preset}`}
              onClick={() => {
                setTargetPreset(preset);
                setStats((prev) => ({
                  ...prev,
                  targetResolution:
                    preset === "1080p"
                      ? "1920x1080 (1080p FHD)"
                      : preset === "4K"
                      ? "3840x2160 (4K Ultra HD)"
                      : "7680x4320 (8K Extreme)",
                  targetBitrate:
                    preset === "1080p" ? "8.5 Mbps" : preset === "4K" ? "18.5 Mbps" : "45 Mbps",
                }));
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                targetPreset === preset
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Video Canvas Previewer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Res Original Video Canvas */}
        <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[280px] p-4 group">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-mono">
            Low Res Original: {stats.originalResolution}
          </div>

          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-slate-400 transition-all">
              <Film className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-400 font-mono">Original Source Frame (Bitrate: {stats.originalBitrate})</p>
          </div>
        </div>

        {/* High Res Upscaled Video Canvas */}
        <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-cyan-900/60 flex flex-col items-center justify-center min-h-[280px] p-4 group">
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-cyan-950/90 border border-cyan-700 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            AI Upscaled: {stats.targetResolution}
          </div>

          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
              <Zap className="w-8 h-8 animate-pulse" />
            </div>
            <p className="text-xs text-cyan-300 font-mono font-semibold">
              Enhanced Bitrate: {stats.targetBitrate} • {stats.fps} FPS
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Stats Row */}
      {isProcessing && (
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-300">
            <span>Processing Video Frame Interpolation...</span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Frame Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Original SD:</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5 block">{stats.originalResolution}</span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/50">
          <span className="text-cyan-400 block text-[11px]">Upscaled Output:</span>
          <span className="font-mono font-bold text-cyan-300 mt-0.5 block">{stats.targetResolution}</span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Total Video Frames:</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5 block">{stats.processedFrames} / {stats.totalFrames}</span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[11px]">Bitrate Boost:</span>
          <span className="font-mono font-bold text-emerald-400 mt-0.5 block">{stats.originalBitrate} → {stats.targetBitrate}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        id="btn-run-video-upscale"
        onClick={handleRunVideoUpscale}
        disabled={isProcessing}
        className="py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Upscaling Video Frames...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>Render Video to {targetPreset} Ultra HD</span>
          </>
        )}
      </button>
    </div>
  );
};
