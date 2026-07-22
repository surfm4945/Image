import React, { useRef } from "react";
import {
  Upload,
  Layers,
  FileImage,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Sparkles,
  Zap,
  RefreshCw,
  Archive,
  Image as ImageIcon,
} from "lucide-react";
import { MediaItem } from "../types";
import JSZip from "jszip";

interface BatchQueueProps {
  queue: MediaItem[];
  selectedId: string | null;
  onSelectMedia: (id: string) => void;
  onFileUpload: (files: FileList | File[]) => void;
  onLoadSamplePhotos: () => void;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
  onProcessAllBatch: () => void;
  isBatchProcessing: boolean;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  queue,
  selectedId,
  onSelectMedia,
  onFileUpload,
  onLoadSamplePhotos,
  onRemoveItem,
  onClearQueue,
  onProcessAllBatch,
  isBatchProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Download all completed upscaled items as a single ZIP archive!
  const handleDownloadZip = async () => {
    const completedItems = queue.filter((item) => item.status === "completed" && item.upscaledUrl);
    if (completedItems.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("ApexScale_4K_Batch_Upscaled");

    for (const item of completedItems) {
      if (!item.upscaledUrl) continue;
      const base64Data = item.upscaledUrl.replace(/^data:image\/\w+;base64,/, "");
      const fileName = `upscaled_${item.upscaledWidth}x${item.upscaledHeight}_${item.name.replace(/\.[^/.]+$/, "")}.png`;
      folder?.file(fileName, base64Data, { base64: true });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ApexScale_Batch_4K_8K_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const completedCount = queue.filter((q) => q.status === "completed").length;

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-5 shadow-2xl flex flex-col gap-5">
      {/* Queue Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/50">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Batch Processing Queue
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {queue.length} items
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Upload single or multiple low-res images for parallel AI upscaling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <>
              {completedCount > 0 && (
                <button
                  id="btn-download-zip"
                  onClick={handleDownloadZip}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 font-semibold text-xs transition-all cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Download ZIP ({completedCount})</span>
                </button>
              )}

              <button
                id="btn-process-all-batch"
                onClick={onProcessAllBatch}
                disabled={isBatchProcessing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isBatchProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>Upscale All Batch</span>
              </button>

              <button
                id="btn-clear-queue"
                onClick={onClearQueue}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/80 rounded-xl p-6 bg-slate-950/40 hover:bg-slate-950/80 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) onFileUpload(e.target.files);
          }}
        />

        <div className="w-11 h-11 rounded-full bg-slate-900 border border-slate-700 group-hover:border-cyan-500 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-all group-hover:scale-110">
          <Upload className="w-5 h-5" />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-200">
            Drag & Drop low-res photos here or{" "}
            <span className="text-cyan-400 underline underline-offset-2">Browse Files</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Supports PNG, JPG, JPEG, WebP (Batch processing up to 4K / 8K output)
          </p>
        </div>

        {queue.length === 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Need sample files?</span>
            <button
              id="btn-load-samples"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSamplePhotos();
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] rounded-md border border-slate-700 transition-all cursor-pointer"
            >
              Load Demo Low-Res Photos
            </button>
          </div>
        )}
      </div>

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {queue.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item.id)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-cyan-500/80 shadow-md"
                    : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60"
                }`}
              >
                {/* Thumbnail & File Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 relative">
                    <img
                      src={item.upscaledUrl || item.originalUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.status === "completed" && (
                      <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[260px]">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Orig: {item.originalWidth}x{item.originalHeight}px</span>
                      <span>→</span>
                      <span className="text-cyan-400 font-semibold">
                        {item.filters.upscaleFactor}: {item.upscaledWidth}x{item.upscaledHeight}px
                      </span>
                    </p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.status === "processing" && (
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full transition-all duration-300"
                          style={{ width: `${item.processingProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {item.processingProgress}%
                      </span>
                    </div>
                  )}

                  {item.status === "completed" && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full">
                      Ready
                    </span>
                  )}

                  {item.status === "idle" && (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full">
                      Queued
                    </span>
                  )}

                  <button
                    id={`btn-remove-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
