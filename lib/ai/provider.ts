import { aiProvider } from "@/lib/env";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export type CompleteInput = {
  system: string;
  messages: ChatMsg[];
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
};

export type VisionInput = {
  system?: string;
  prompt: string;
  imageBase64: string;
  mimeType: string;
  json?: boolean;
};

/** Minimal surface the app needs from an LLM, independent of vendor. */
export interface AIProvider {
  name: string;
  complete(input: CompleteInput): Promise<string>;
  vision(input: VisionInput): Promise<string>;
}

/**
 * Resolve the active provider. Production default is Anthropic (the decided
 * stack); AI_PROVIDER=gemini swaps in the free tier for dev testing. Concrete
 * providers are lazy-imported so their SDKs never load during the (mocked)
 * test suite and the unused one is never bundled at runtime.
 */
export async function getProvider(): Promise<AIProvider> {
  if (aiProvider() === "gemini") {
    const { createGeminiProvider } = await import("./gemini");
    return createGeminiProvider();
  }
  if (aiProvider() === "ollama") {
    const { createOllamaProvider } = await import("./ollama");
    return createOllamaProvider();
  }
  const { createAnthropicProvider } = await import("./anthropic");
  return createAnthropicProvider();
}
