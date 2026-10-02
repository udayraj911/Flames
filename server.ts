import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK on the server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// AI cosmic oracle relationship analyzer endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { name1, name2, relationship, compatibilityScore, zodiacs } = req.body;

    if (!name1 || !name2 || !relationship) {
      return res.status(400).json({ error: "Missing required fields: name1, name2, or relationship" });
    }

    if (!ai) {
      return res.json({
        verdict: `🔮 The Cosmic Oracle is currently quiet (missing GEMINI_API_KEY). Nonetheless, the universe confirms a strong bond of ${relationship} between ${name1} and ${name2} with a compatibility score of ${compatibilityScore || 50}%!`,
      });
    }

    const zodiacInfo = zodiacs ? ` (${name1} is ${zodiacs.sign1}, ${name2} is ${zodiacs.sign2})` : "";
    
    const prompt = `You are a mystical, witty, and humorous Cosmic Relationship Oracle. Analyze the relationship between two people:
Person 1: "${name1}"
Person 2: "${name2}"
Zodiac Information: ${zodiacInfo || "None provided"}
FLAMES Game Result: "${relationship}" (This stands for Friendship, Love, Affection, Marriage, Enmity, or Sibling)
Compatibility Score: ${compatibilityScore}%

Provide a witty, humorous, and entertaining 2-paragraph astrological/cosmic-style "divine reading" of their compatibility based on this. Use playful, lighthearted, and descriptive language (e.g., star alignment, cosmic energy, playful warnings, or dynamic descriptions). Do not be overly clinical or dry. Write in a friendly, conversational tone.
Format the output as clean text. Keep it around 150-200 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const verdict = response.text || "The stars are temporarily aligned in silence, but your connection is undeniable!";
    res.json({ verdict });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to connect with the Cosmic Oracle." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
