import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiKey } from "@/lib/env";
import type { AIProvider, ChatMsg } from "./provider";

// Free tier, vision-capable. Override with GEMINI_MODEL if needed.
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export function createGeminiProvider(): AIProvider {
  const key = geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY is not set — see README.md.");
  const genAI = new GoogleGenerativeAI(key);

  return {
    name: "gemini",

    async complete({ system, messages, json }) {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: system,
        generationConfig: json ? { responseMimeType: "application/json" } : undefined,
      });
      const contents = messages.map((m: ChatMsg) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const res = await model.generateContent({ contents });
      return res.response.text();
    },

    async vision({ system, prompt, imageBase64, mimeType, json }) {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: system,
        generationConfig: json ? { responseMimeType: "application/json" } : undefined,
      });
      const res = await model.generateContent([
        { inlineData: { mimeType, data: imageBase64 } },
        { text: prompt },
      ]);
      return res.response.text();
    },
  };
}
