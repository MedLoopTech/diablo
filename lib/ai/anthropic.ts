import Anthropic from "@anthropic-ai/sdk";
import { anthropicKey } from "@/lib/env";
import type { AIProvider } from "./provider";

// Per SPEC/CLAUDE.md the production model is claude-sonnet-4-6. Bump to
// claude-sonnet-5 (latest) if desired — kept in one place for that reason.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export function createAnthropicProvider(): AIProvider {
  const key = anthropicKey();
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set — see README.md.");
  const client = new Anthropic({ apiKey: key });

  return {
    name: "anthropic",

    async *stream({ system, messages, maxTokens = 1024, temperature = 0.3 }) {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      });
      for await (const event of res) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield event.delta.text;
        }
      }
    },

    async complete({ system, messages, json, maxTokens = 1024, temperature = 0.3 }) {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system: json
          ? `${system}\n\nRespond with ONLY valid minified JSON. No prose, no code fences.`
          : system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      const block = res.content.find((b) => b.type === "text");
      return block && block.type === "text" ? block.text : "";
    },

    async vision({ system, prompt, imageBase64, mimeType, json }) {
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system:
          (system ?? "") + (json ? "\n\nRespond with ONLY valid minified JSON." : ""),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType as
                    | "image/jpeg"
                    | "image/png"
                    | "image/gif"
                    | "image/webp",
                  data: imageBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      });
      const block = res.content.find((b) => b.type === "text");
      return block && block.type === "text" ? block.text : "";
    },
  };
}
