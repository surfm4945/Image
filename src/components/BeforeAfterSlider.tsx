import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Eye,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  Layers,
} from "lucide-react";
import { MediaItem } from "../types";

interface BeforeAfterSliderProps {
  media: MediaItem;
  onDownload: (media: MediaItem) => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  media,
  onDownload,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<"slider" | "sideBySide">("slider");
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    updateSliderPos(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const offset = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offset / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderPos(e);
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging) updateSliderPos(e);
    };

    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("mousemove", handleGlobalMove);
    return () => {
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("mousemove", handleGlobalMove);
    };
  }, [isDragging]);

  const hasUpscaled = !!media.upscaledUrl;

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 lg:p-6 shadow-2xl flex flex-col gap-4">
      {/* Top Header Bar inside compare panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400 font-mono text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Original: {media.originalWidth}×{media.originalHeight}px
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500" />

          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Upscaled {media.filters.upscaleFactor}: {media.upscaledWidth}×{media.upscaledHeight}px
          </div>
        </div>

        {/* Display controls */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
            <button
              id="btn-zoom-out"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              id="btn-zoom-in"
              onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-reset"
              onClick={() => setZoomLevel(1.0)}
              className="px-2 py-1 text-[10px] text-slate-400 hover:text-cyan-400 font-mono"
            >
              Reset
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
            <button
              id="btn-view-slider"
              onClick={() => setViewMode("slider")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                viewMode === "slider"
                  ? "bg-slate-800 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Split View
            </button>
            <button
              id="btn-view-sidebyside"
              onClick={() => setViewMode("sideBySide")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                viewMode === "sideBySide"
                  ? "bg-slate-800 text-cyan-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Side by Side
            </button>
          </div>

          {/* Download high res button */}
          {hasUpscaled && (
            <button
              id="btn-download-highres"
              onClick={() => onDownload(media)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download High Res</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Compare Canvas Area */}
      {viewMode === "slider" ? (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 select-none cursor-col-resize group"
        >
          {/* Inner zoom container */}
          <div
            className="absolute inset-0 w-full h-full transition-transform duration-100 flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Background: Upscaled Ultra HD Image */}
            <img
              src={media.upscaledUrl || media.originalUrl}
              alt="Upscaled High Res"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Foreground: Original Low Res Image (clipped) */}
            <div
              className="absolute inset-0 h-full overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={media.originalUrl}
                alt="Original Low Res"
                className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none filter blur-[0.4px]"
                style={{
                  width: containerRef.current
                    ? `${containerRef.current.clientWidth}px`
                    : "100%",
                }}
              />
            </div>
          </div>

          {/* Overlay Labels */}
          <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-md bg-slate-950/80 border border-slate-700/80 text-slate-300 text-xs font-mono font-semibold backdrop-blur-md shadow-md">
            LOW RES ORIGINAL
          </div>
          <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-md bg-cyan-950/90 border border-cyan-700/80 text-cyan-300 text-xs font-mono font-semibold backdrop-blur-md shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ULTRA HD AI UPSCALED
          </div>

          {/* Slider Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 z-30 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.8)] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/40">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[420px] sm:h-[500px]">
          {/* Low Res Panel */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-2">
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-mono">
              Before (Original): {media.originalWidth}×{media.originalHeight}px
            </div>
            <img
              src={media.originalUrl}
              alt="Original Low Res"
              className="max-h-full max-w-full object-contain"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* High Res Panel */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-cyan-900/50 flex flex-col items-center justify-center p-2">
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-cyan-950/90 border border-cyan-700 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              After (AI 4K/8K): {media.upscaledWidth}×{media.upscaledHeight}px
            </div>
            <img
              src={media.upscaledUrl || media.originalUrl}
              alt="Upscaled High Res"
              className="max-h-full max-w-full object-contain"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>
        </div>
      )}

      {/* AI Analysis Summary Bar */}
      {media.qualityMetrics && (
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">Gemini Quality Analysis: </span>
              <span className="text-slate-300">{media.qualityMetrics.summary}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Noise: {media.qualityMetrics.noiseLevel}</span>
            <span>•</span>
            <span>Face Clarity: {media.qualityMetrics.facialDetailScore}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
