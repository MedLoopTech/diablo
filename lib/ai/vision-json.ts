/** Tolerantly parse a JSON object from an LLM response (strips code fences). */
export function parseJsonLoose<T = Record<string, unknown>>(raw: string): T | null {
  if (!raw) return null;
  let s = raw.trim();
  // Strip ```json ... ``` or ``` ... ``` fences some models still add.
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // Fall back to the first {...} span if there is surrounding prose.
  if (!s.startsWith("{")) {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start >= 0 && end > start) s = s.slice(start, end + 1);
  }
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

/** Read an uploaded image File into the base64 + mime shape vision calls need. */
export async function fileToBase64(
  file: File
): Promise<{ base64: string; mimeType: string; ext: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "image/jpeg";
  const ext = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
      ? "webp"
      : "jpg";
  return { base64: buf.toString("base64"), mimeType, ext };
}
