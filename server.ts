import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API health check
  app.get("/api/health", (_req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: "ok",
      mode: "Blueprint Maritime Hub",
      onlineAiAvailable: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Maritime AI Assistant endpoint (Online Mode for port/satellite bursts)
  app.post("/api/maritime-ai", async (req, res) => {
    try {
      const { prompt, equipmentContext, queryType } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(503).json({
          error: "Online AI Key not configured. The app remains 100% operational in Offline Maritime Mode using local knowledge bases.",
          isOfflineFallback: true,
        });
      }

      const systemInstruction = `You are "Blueprint Maritime Technical Advisor", a senior Chief Engineer and Master Mariner consulting assistant for seafarers at sea.
Your job is to provide direct, safety-critical, highly actionable, concise technical procedures, troubleshooting steps, and statutory compliance checks according to IMO (SOLAS, MARPOL, STCW, MLC) and standard Class/Maker practices (MAN, Wärtsilä, Yanmar, Alfa Laval, Furuno, etc.).

Always structure your responses clearly:
1. IMMEDIATE ACTION / SAFETY PRECAUTIONS (if alarm or emergency)
2. PROBABLE ROOT CAUSES (ranked by frequency on ships)
3. STEP-BY-STEP TROUBLESHOOTING & CHECKS
4. STATUTORY & CLASS RULES (exact parameters/limits if applicable)
5. PREVENTATIVE ACTION / SPARES TO CHECK

Keep tone objective, rugged, direct, and jargon-precise for shipboard engineers and deck officers.`;

      const userMessage = `Equipment Context: ${JSON.stringify(equipmentContext || {})}
Query Type: ${queryType || "Troubleshooting"}
Request: ${prompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      res.json({
        success: true,
        reply: response.text,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error in maritime-ai endpoint:", error);
      res.status(500).json({
        error: error.message || "Failed to generate AI response",
        isOfflineFallback: true,
      });
    }
  });

  // Vite middleware in development
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
    console.log(`Blueprint Maritime Vault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
