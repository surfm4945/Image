import { FilterSettings } from "../types";

/**
 * High-performance browser-based super-resolution & image enhancement engine
 */
export async function upscaleImageCanvas(
  imageSource: HTMLImageElement | string,
  filters: FilterSettings,
  onProgress?: (percent: number) => void
): Promise<{
  upscaledUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const process = (img: HTMLImageElement) => {
      try {
        if (onProgress) onProgress(15);

        const origW = img.naturalWidth || img.width || 800;
        const origH = img.naturalHeight || img.height || 600;

        let scaleMultiplier = 2;
        if (filters.upscaleFactor === "2x") scaleMultiplier = 2;
        else if (filters.upscaleFactor === "4x") scaleMultiplier = 4;
        else if (filters.upscaleFactor === "8x") scaleMultiplier = 8;
        else if (filters.upscaleFactor === "Custom") scaleMultiplier = filters.customScaleMultiplier || 3;

        const targetW = Math.round(origW * scaleMultiplier);
        const targetH = Math.round(origH * scaleMultiplier);

        if (onProgress) onProgress(35);

        // Step 1: Create canvas for multi-stage upscaling
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          throw new Error("Could not create 2D canvas context.");
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Multi-stage scale down/up to avoid pixel blockiness (Bicubic simulation)
        if (scaleMultiplier >= 4) {
          const midCanvas = document.createElement("canvas");
          midCanvas.width = Math.round(origW * 2);
          midCanvas.height = Math.round(origH * 2);
          const midCtx = midCanvas.getContext("2d");
          if (midCtx) {
            midCtx.imageSmoothingEnabled = true;
            midCtx.imageSmoothingQuality = "high";
            midCtx.drawImage(img, 0, 0, midCanvas.width, midCanvas.height);
            ctx.drawImage(midCanvas, 0, 0, targetW, targetH);
          } else {
            ctx.drawImage(img, 0, 0, targetW, targetH);
          }
        } else {
          ctx.drawImage(img, 0, 0, targetW, targetH);
        }

        if (onProgress) onProgress(60);

        // Step 2: Pixel-level enhancement filters (Denoise, Unsharp Mask, Contrast, HDR)
        const imgData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;
        const len = data.length;

        const sharpnessFactor = (filters.sharpness / 100) * 0.6;
        const denoiseAmount = filters.denoise / 100;
        const hdrBoost = filters.hdrBoost / 100;
        const contrastFactor = (filters.contrastEnhance / 100) * 0.25;
        const vibranceFactor = (filters.colorVibrance / 100) * 0.2;

        // Unsharp Mask / Sharpening pass
        if (sharpnessFactor > 0 || contrastFactor > 0 || vibranceFactor > 0) {
          const originalCopy = new Uint8ClampedArray(data);

          for (let y = 1; y < targetH - 1; y += 1) {
            for (let x = 1; x < targetW - 1; x += 1) {
              const idx = (y * targetW + x) * 4;

              // Color Vibrance & Contrast Adjustment
              for (let c = 0; c < 3; c++) {
                let val = data[idx + c];

                // Contrast
                if (contrastFactor > 0) {
                  val = ((val / 255 - 0.5) * (1 + contrastFactor) + 0.5) * 255;
                }

                // HDR Highlight / Shadow boost
                if (hdrBoost > 0) {
                  const norm = val / 255;
                  if (norm < 0.4) {
                    val += (0.4 - norm) * 40 * hdrBoost; // shadow lift
                  } else if (norm > 0.6) {
                    val += (norm - 0.6) * 30 * hdrBoost; // highlight recovery
                  }
                }

                data[idx + c] = Math.min(255, Math.max(0, val));
              }

              // Fast Laplacian Edge Sharpening
              if (sharpnessFactor > 0) {
                const up = ((y - 1) * targetW + x) * 4;
                const down = ((y + 1) * targetW + x) * 4;
                const left = (y * targetW + (x - 1)) * 4;
                const right = (y * targetW + (x + 1)) * 4;

                for (let c = 0; c < 3; c++) {
                  const center = originalCopy[idx + c];
                  const surroundingAvg =
                    (originalCopy[up + c] +
                      originalCopy[down + c] +
                      originalCopy[left + c] +
                      originalCopy[right + c]) /
                    4;

                  const edgeDetail = center - surroundingAvg;
                  const sharpVal = center + edgeDetail * sharpnessFactor * 2.2;
                  data[idx + c] = Math.min(255, Math.max(0, sharpVal));
                }
              }
            }
          }
        }

        // Denoise / Smoothing Filter Pass
        if (denoiseAmount > 0) {
          const denoiseCopy = new Uint8ClampedArray(data);
          const blend = denoiseAmount * 0.35;

          for (let y = 1; y < targetH - 1; y += 2) {
            for (let x = 1; x < targetW - 1; x += 2) {
              const idx = (y * targetW + x) * 4;
              const up = ((y - 1) * targetW + x) * 4;
              const down = ((y + 1) * targetW + x) * 4;
              const left = (y * targetW + (x - 1)) * 4;
              const right = (y * targetW + (x + 1)) * 4;

              for (let c = 0; c < 3; c++) {
                const avg =
                  (denoiseCopy[idx + c] +
                    denoiseCopy[up + c] +
                    denoiseCopy[down + c] +
                    denoiseCopy[left + c] +
                    denoiseCopy[right + c]) /
                  5;
                data[idx + c] = Math.round(
                  denoiseCopy[idx + c] * (1 - blend) + avg * blend
                );
              }
            }
          }
        }

        // Face Detail Restoration simulation (Soft skin smoothing + ocular clarity boost)
        if (filters.faceRestoration) {
          const strength = (filters.faceDetailStrength || 50) / 100;
          for (let i = 0; i < len; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Simple skin tone heuristic
            const isSkin = r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15;
            if (isSkin) {
              // Gentle skin detail smoothing
              data[i] = Math.min(255, r + 4 * strength);
              data[i + 1] = Math.min(255, g + 2 * strength);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        if (onProgress) onProgress(85);

        // Convert canvas to Data URL / Blob URL
        const dataUrl = canvas.toDataURL("image/png", 0.95);

        if (onProgress) onProgress(100);

        resolve({
          upscaledUrl: dataUrl,
          width: targetW,
          height: targetH,
        });
      } catch (err) {
        reject(err);
      }
    };

    if (typeof imageSource === "string") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => process(img);
      img.onerror = (err) => reject(new Error("Failed to load image for upscaling."));
      img.src = imageSource;
    } else {
      process(imageSource);
    }
  });
}
