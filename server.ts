import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client server-side
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "ApexScale AI", developer: "Furqan" });
});

// API: Image Quality & Resolution Inspection using Gemini AI
app.post("/api/analyze-quality", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 payload" });
    }

    const ai = getAiClient();
    if (!ai) {
      // Fallback response if Gemini key is not populated yet
      return res.json({
        analysis: {
          estimatedQuality: "Low/Medium Resolution Detected",
          blurScore: "Moderate",
          noiseLevel: "Noticeable ISO Grain",
          facialDetailScore: 65,
          recommendedUpscale: "4K (4x)",
          suggestedFilters: {
            denoise: 35,
            sharpness: 60,
            faceRestoration: true,
            hdrBoost: 25,
            contrastEnhance: 40,
          },
          summary: "Recommended 4x resolution upscaling with face refinement and bilateral noise reduction.",
        },
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this image for resolution quality, blur/noise levels, compression artifacts, facial detail clarity, and optimal AI super-resolution parameters. Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedQuality: { type: Type.STRING },
            blurScore: { type: Type.STRING },
            noiseLevel: { type: Type.STRING },
            facialDetailScore: { type: Type.NUMBER },
            recommendedUpscale: { type: Type.STRING },
            suggestedFilters: {
              type: Type.OBJECT,
              properties: {
                denoise: { type: Type.NUMBER },
                sharpness: { type: Type.NUMBER },
                faceRestoration: { type: Type.BOOLEAN },
                hdrBoost: { type: Type.NUMBER },
                contrastEnhance: { type: Type.NUMBER },
              },
              required: ["denoise", "sharpness", "faceRestoration", "hdrBoost", "contrastEnhance"],
            },
            summary: { type: Type.STRING },
          },
          required: [
            "estimatedQuality",
            "blurScore",
            "noiseLevel",
            "facialDetailScore",
            "recommendedUpscale",
            "suggestedFilters",
            "summary",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ analysis: parsed });
  } catch (error: any) {
    console.error("Quality analysis error:", error);
    res.status(500).json({
      error: error?.message || "Failed to analyze media quality",
      analysis: {
        estimatedQuality: "Standard Low Resolution",
        blurScore: "Moderate",
        noiseLevel: "Standard",
        facialDetailScore: 60,
        recommendedUpscale: "4K (4x)",
        suggestedFilters: {
          denoise: 30,
          sharpness: 50,
          faceRestoration: true,
          hdrBoost: 20,
          contrastEnhance: 30,
        },
        summary: "Default 4K Ultra HD AI upscale preset configured.",
      },
    });
  }
});

// API: AI Upscale Enhancement Assistance
app.post("/api/upscale-ai", async (req, res) => {
  try {
    const { targetResolution, filters, promptNotes } = req.body;
    const ai = getAiClient();

    let aiAdvice = "AI enhancement parameters optimized for maximum structural clarity and zero artifact distortion.";
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Provide expert super-resolution advice for scaling a low-res source to ${targetResolution} with parameters: ${JSON.stringify(filters)}. ${promptNotes || ""}`,
      });
      if (response.text) {
        aiAdvice = response.text;
      }
    }

    res.json({
      success: true,
      targetResolution,
      aiAdvice,
      processedTimestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "AI Upscale failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ApexScale AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
