import type { AIProvider } from "./provider";

const BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const TEXT_MODEL = process.env.OLLAMA_MODEL || "qwen3:30b-a3b";
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "qwen2.5vl:7b";

type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string | OllamaContentPart[];
};

type OllamaContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

async function ollamaChat(
  model: string,
  messages: OllamaMessage[],
  json: boolean
): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      ...(json ? { format: "json" } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama ${model} error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content ?? "";
}

export function createOllamaProvider(): AIProvider {
  return {
    name: "ollama",

    async *stream({ system, messages, maxTokens }) {
      const ollamaMessages: OllamaMessage[] = [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];
      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: TEXT_MODEL, messages: ollamaMessages, stream: true, num_predict: maxTokens }),
      });
      if (!res.ok || !res.body) throw new Error(`Ollama stream error ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
            if (data.message?.content) yield data.message.content;
            if (data.done) return;
          } catch { /* skip malformed lines */ }
        }
      }
    },

    async complete({ system, messages, json = false }) {
      const ollamaMessages: OllamaMessage[] = [
        {
          role: "system",
          content: json
            ? `${system}\n\nRespond with ONLY valid minified JSON. No prose, no code fences.`
            : system,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];
      return ollamaChat(TEXT_MODEL, ollamaMessages, json);
    },

    async vision({ system, prompt, imageBase64, mimeType, json = false }) {
      // Ollama vision: image passed as data URI in image_url content part
      const dataUri = `data:${mimeType};base64,${imageBase64}`;
      const ollamaMessages: OllamaMessage[] = [
        ...(system
          ? [
              {
                role: "system" as const,
                content: json
                  ? `${system}\n\nRespond with ONLY valid minified JSON.`
                  : system,
              },
            ]
          : []),
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUri } },
            { type: "text", text: prompt },
          ],
        },
      ];
      return ollamaChat(VISION_MODEL, ollamaMessages, json);
    },
  };
}
