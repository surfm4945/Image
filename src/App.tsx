import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BeforeAfterSlider } from "./components/BeforeAfterSlider";
import { EnhancementControls } from "./components/EnhancementControls";
import { BatchQueue } from "./components/BatchQueue";
import { VideoUpscaler } from "./components/VideoUpscaler";
import { StreamlitGithubModal } from "./components/StreamlitGithubModal";
import { Footer } from "./components/Footer";
import { FilterSettings, MediaItem } from "./types";
import { upscaleImageCanvas } from "./lib/upscaleEngine";
import { Sparkles, Zap, Image as ImageIcon, Layers, RefreshCw } from "lucide-react";

// Helper generator for low-res SVG demo photos
function createDemoLowResDataUrl(title: string, color1: string, color2: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="320" cy="200" r="110" fill="rgba(255,255,255,0.2)" filter="url(#b)"/>
    <rect x="220" y="270" width="200" height="120" rx="20" fill="rgba(255,255,255,0.15)"/>
    <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="bold">${title}</text>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#e2e8f0" font-family="monospace" font-size="16">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [isStreamlitModalOpen, setIsStreamlitModalOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterSettings>({
    upscaleFactor: "4x",
    customScaleMultiplier: 3,
    denoise: 40,
    sharpness: 65,
    faceRestoration: true,
    faceDetailStrength: 60,
    hdrBoost: 30,
    contrastEnhance: 35,
    colorVibrance: 25,
    aiDetailSynthesis: true,
  });

  // Load demo low-res photos on initial mount
  useEffect(() => {
    loadSamplePhotos();
  }, []);

  const loadSamplePhotos = () => {
    const demo1 = createDemoLowResDataUrl("Low-Res Portrait", "#1e1b4b", "#4338ca", "640x480 SD Source");
    const demo2 = createDemoLowResDataUrl("Landscape Scene", "#064e3b", "#047857", "720x480 Low Res");
    const demo3 = createDemoLowResDataUrl("Cyberpunk Artwork", "#831843", "#be185d", "512x512 Pixelated");

    const sampleItems: MediaItem[] = [
      {
        id: "sample-1",
        name: "Portrait_LowRes_SD.png",
        type: "image",
        sizeBytes: 1024 * 320,
        originalWidth: 640,
        originalHeight: 480,
        originalUrl: demo1,
        upscaledWidth: 2560,
        upscaledHeight: 1920,
        upscaledUrl: null,
        upscaledFactorStr: "4x",
        processingProgress: 0,
        status: "idle",
        filters: { ...filters },
      },
      {
        id: "sample-2",
        name: "Landscape_LowRes_SD.png",
        type: "image",
        sizeBytes: 1024 * 450,
        originalWidth: 720,
        originalHeight: 480,
        originalUrl: demo2,
        upscaledWidth: 2880,
        upscaledHeight: 1920,
        upscaledUrl: null,
        upscaledFactorStr: "4x",
        processingProgress: 0,
        status: "idle",
        filters: { ...filters },
      },
      {
        id: "sample-3",
        name: "Cyberpunk_Art_SD.png",
        type: "image",
        sizeBytes: 1024 * 280,
        originalWidth: 512,
        originalHeight: 512,
        originalUrl: demo3,
        upscaledWidth: 2048,
        upscaledHeight: 2048,
        upscaledUrl: null,
        upscaledFactorStr: "4x",
        processingProgress: 0,
        status: "idle",
        filters: { ...filters },
      },
    ];

    setQueue(sampleItems);
    setSelectedId("sample-1");

    // Auto process first item so the user immediately sees upscaled results!
    processItem(sampleItems[0], sampleItems);
  };

  const handleFileUpload = (files: FileList | File[]) => {
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onload = async () => {
          const w = img.naturalWidth || 800;
          const h = img.naturalHeight || 600;

          const newItem: MediaItem = {
            id: `upload-${Date.now()}-${index}`,
            name: file.name,
            type: "image",
            sizeBytes: file.size,
            originalWidth: w,
            originalHeight: h,
            originalUrl: url,
            upscaledWidth: w * 4,
            upscaledHeight: h * 4,
            upscaledUrl: null,
            upscaledFactorStr: "4x",
            processingProgress: 0,
            status: "idle",
            filters: { ...filters },
          };

          setQueue((prev) => [newItem, ...prev]);
          if (!selectedId) setSelectedId(newItem.id);

          // Fetch Gemini quality analysis asynchronously
          try {
            const res = await fetch("/api/analyze-quality", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageBase64: url, mimeType: file.type || "image/jpeg" }),
            });
            const data = await res.json();
            if (data.analysis) {
              setQueue((prev) =>
                prev.map((q) => (q.id === newItem.id ? { ...q, qualityMetrics: data.analysis } : q))
              );
            }
          } catch (err) {
            console.error("Quality analysis error:", err);
          }
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });
  };

  const processItem = async (targetItem: MediaItem, currentQueue = queue) => {
    setIsProcessing(true);

    // Update status to processing
    setQueue((prev) =>
      prev.map((q) =>
        q.id === targetItem.id ? { ...q, status: "processing", processingProgress: 10 } : q
      )
    );

    try {
      const result = await upscaleImageCanvas(
        targetItem.originalUrl,
        filters,
        (progressPercent) => {
          setQueue((prev) =>
            prev.map((q) =>
              q.id === targetItem.id ? { ...q, processingProgress: progressPercent } : q
            )
          );
        }
      );

      setQueue((prev) =>
        prev.map((q) =>
          q.id === targetItem.id
            ? {
                ...q,
                upscaledUrl: result.upscaledUrl,
                upscaledWidth: result.width,
                upscaledHeight: result.height,
                upscaledFactorStr: filters.upscaleFactor,
                status: "completed",
                processingProgress: 100,
              }
            : q
        )
      );
    } catch (err: any) {
      console.error("Failed to upscale item:", err);
      setQueue((prev) =>
        prev.map((q) =>
          q.id === targetItem.id ? { ...q, status: "error", errorMsg: err.message } : q
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessActiveSingle = () => {
    const item = queue.find((q) => q.id === selectedId);
    if (item) processItem(item);
  };

  const handleProcessAllBatch = async () => {
    setIsBatchProcessing(true);
    for (const item of queue) {
      await processItem(item);
    }
    setIsBatchProcessing(false);
  };

  const handleDownloadSingle = (media: MediaItem) => {
    if (!media.upscaledUrl) return;
    const link = document.createElement("a");
    link.href = media.upscaledUrl;
    link.download = `ApexScale_UltraHD_${media.upscaledWidth}x${media.upscaledHeight}_${media.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedMedia = queue.find((q) => q.id === selectedId) || queue[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStreamlitModal={() => setIsStreamlitModalOpen(true)}
        batchCount={queue.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full flex-1 space-y-6">
        {activeTab === "image" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Before/After Compare Slider & Batch Queue */}
            <div className="lg:col-span-8 space-y-6">
              {selectedMedia ? (
                <BeforeAfterSlider media={selectedMedia} onDownload={handleDownloadSingle} />
              ) : (
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                  <p className="text-sm font-semibold text-slate-300">
                    No image selected. Upload or choose a low-res image to upscale to 4K / 8K!
                  </p>
                </div>
              )}

              {/* Batch Processing Queue */}
              <BatchQueue
                queue={queue}
                selectedId={selectedId}
                onSelectMedia={(id) => setSelectedId(id)}
                onFileUpload={handleFileUpload}
                onLoadSamplePhotos={loadSamplePhotos}
                onRemoveItem={(id) => {
                  setQueue((prev) => prev.filter((q) => q.id !== id));
                  if (selectedId === id) {
                    const remaining = queue.filter((q) => q.id !== id);
                    setSelectedId(remaining.length > 0 ? remaining[0].id : null);
                  }
                }}
                onClearQueue={() => {
                  setQueue([]);
                  setSelectedId(null);
                }}
                onProcessAllBatch={handleProcessAllBatch}
                isBatchProcessing={isBatchProcessing}
              />
            </div>

            {/* Right Column: AI Enhancement Controls */}
            <div className="lg:col-span-4 sticky top-20">
              <EnhancementControls
                filters={filters}
                setFilters={setFilters}
                onProcess={handleProcessActiveSingle}
                isProcessing={isProcessing}
                selectedMediaName={selectedMedia?.name}
              />
            </div>
          </div>
        ) : (
          /* Video Upscaler Mode */
          <div className="max-w-5xl mx-auto">
            <VideoUpscaler />
          </div>
        )}
      </main>

      {/* Streamlit & GitHub Modal */}
      <StreamlitGithubModal
        isOpen={isStreamlitModalOpen}
        onClose={() => setIsStreamlitModalOpen(false)}
        developerName="Furqan"
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
