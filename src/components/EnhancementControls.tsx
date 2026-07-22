import React from "react";
import {
  Sliders,
  Sparkles,
  Zap,
  Shield,
  Eye,
  Activity,
  Layers,
  Flame,
  RefreshCw,
  Sun,
  Maximize,
} from "lucide-react";
import { FilterSettings, UpscaleFactor } from "../types";

interface EnhancementControlsProps {
  filters: FilterSettings;
  setFilters: React.Dispatch<React.SetStateAction<FilterSettings>>;
  onProcess: () => void;
  isProcessing: boolean;
  selectedMediaName?: string;
}

export const EnhancementControls: React.FC<EnhancementControlsProps> = ({
  filters,
  setFilters,
  onProcess,
  isProcessing,
  selectedMediaName,
}) => {
  const handleFactorChange = (factor: UpscaleFactor) => {
    setFilters((prev) => ({ ...prev, upscaleFactor: factor }));
  };

  const handleSliderChange = (key: keyof FilterSettings, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-5 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/50">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Super-Resolution & Enhancement
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure target resolution and pixel quality algorithms
            </p>
          </div>
        </div>
      </div>

      {/* Preset Resolution Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Target Resolution Preset</span>
          <span className="text-[10px] text-cyan-400 font-mono uppercase">Ultra HD Output</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["2x", "4x", "8x", "Custom"] as UpscaleFactor[]).map((factor) => {
            const isSelected = filters.upscaleFactor === factor;
            let label = "1080p Full HD";
            if (factor === "4x") label = "4K Ultra HD";
            if (factor === "8x") label = "8K Extreme HD";
            if (factor === "Custom") label = `${filters.customScaleMultiplier}x Custom`;

            return (
              <button
                key={factor}
                id={`preset-${factor}`}
                onClick={() => handleFactorChange(factor)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-cyan-500 shadow-lg shadow-cyan-500/10 text-white"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold font-mono text-cyan-400">{factor}</span>
                  {isSelected && <Zap className="w-3 h-3 text-cyan-400" />}
                </div>
                <span className="text-[10px] font-medium mt-1 text-slate-300">{label}</span>
              </button>
            );
          })}
        </div>

        {filters.upscaleFactor === "Custom" && (
          <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-300 font-medium">Custom Scale Multiplier:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={2}
                max={12}
                step={1}
                value={filters.customScaleMultiplier}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    customScaleMultiplier: parseInt(e.target.value, 10),
                  }))
                }
                className="w-28 accent-cyan-400"
              />
              <span className="text-xs font-mono font-bold text-cyan-300 w-8 text-right">
                {filters.customScaleMultiplier}x
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sliders Grid */}
      <div className="space-y-4">
        {/* Edge Sharpness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Unsharp Mask Edge Sharpness
            </span>
            <span className="font-mono text-cyan-300 font-semibold">{filters.sharpness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.sharpness}
            onChange={(e) => handleSliderChange("sharpness", Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Denoise & Artifact Removal */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Bilateral Denoise & Artifact Reduction
            </span>
            <span className="font-mono text-blue-300 font-semibold">{filters.denoise}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.denoise}
            onChange={(e) => handleSliderChange("denoise", Number(e.target.value))}
            className="w-full accent-blue-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Contrast & Luminance */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Contrast Adaptive Sharpening (CAS)
            </span>
            <span className="font-mono text-indigo-300 font-semibold">{filters.contrastEnhance}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.contrastEnhance}
            onChange={(e) => handleSliderChange("contrastEnhance", Number(e.target.value))}
            className="w-full accent-indigo-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* HDR Boost */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              HDR Highlight & Shadow Recovery
            </span>
            <span className="font-mono text-amber-300 font-semibold">{filters.hdrBoost}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.hdrBoost}
            onChange={(e) => handleSliderChange("hdrBoost", Number(e.target.value))}
            className="w-full accent-amber-400 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Face Restoration Toggle & Slider */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              AI Face & Skin Texture Refinement
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.faceRestoration}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, faceRestoration: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {filters.faceRestoration && (
            <div className="space-y-1 pl-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Refinement Strength</span>
                <span className="font-mono text-emerald-400">{filters.faceDetailStrength}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={filters.faceDetailStrength}
                onChange={(e) => handleSliderChange("faceDetailStrength", Number(e.target.value))}
                className="w-full accent-emerald-400 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        id="btn-process-upscale"
        onClick={onProcess}
        disabled={isProcessing}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>AI Super-Resolution Processing...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>Apply {filters.upscaleFactor} Ultra HD Upscale</span>
          </>
        )}
      </button>
    </div>
  );
};
