export type UpscaleFactor = "2x" | "4x" | "8x" | "Custom";

export interface ImageQualityMetrics {
  estimatedQuality: string;
  blurScore: string;
  noiseLevel: string;
  facialDetailScore: number;
  recommendedUpscale: string;
  suggestedFilters: {
    denoise: number;
    sharpness: number;
    faceRestoration: boolean;
    hdrBoost: number;
    contrastEnhance: number;
  };
  summary: string;
}

export interface FilterSettings {
  upscaleFactor: UpscaleFactor;
  customScaleMultiplier: number;
  denoise: number; // 0-100
  sharpness: number; // 0-100
  faceRestoration: boolean;
  faceDetailStrength: number; // 0-100
  hdrBoost: number; // 0-100
  contrastEnhance: number; // 0-100
  colorVibrance: number; // 0-100
  aiDetailSynthesis: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video";
  sizeBytes: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  upscaledWidth: number;
  upscaledHeight: number;
  upscaledUrl: string | null;
  upscaledFactorStr: string;
  processingProgress: number; // 0-100
  status: "idle" | "analyzing" | "processing" | "completed" | "error";
  qualityMetrics?: ImageQualityMetrics;
  filters: FilterSettings;
  errorMsg?: string;
}

export interface VideoUpscaleStats {
  originalResolution: string;
  targetResolution: string;
  originalBitrate: string;
  targetBitrate: string;
  fps: number;
  totalFrames: number;
  processedFrames: number;
  estimatedTimeSec: number;
}
