/**
 * The coach bubble renders replies verbatim, but models reach for asterisks to
 * emphasise transliterated words ("*besan chilla*", "*dahi*", "*chai*") —
 * which arrive as literal punctuation. Since the coach streams, they also
 * appear character-by-character as the reply types out.
 *
 * CHAT_SYSTEM now asks for plain text, but the prompt alone is not reliable
 * (DocPortal's model emitted asterisks even with that rule), so the markers
 * are stripped at render. That also cleans up replies already stored in
 * chat_messages.
 *
 * Deliberately not a markdown renderer: patient replies must stay plain text,
 * so this removes the syntax and keeps the words.
 */
export function toPlainText(body: string): string {
  return (
    body
      // **bold** and *italic* → the words inside. Requires a matching pair, so
      // a lone asterisk (a footnote marker, a multiplication sign) is untouched.
      .replace(/\*\*([^*]+?)\*\*/g, "$1")
      .replace(/\*([^*\n]+?)\*/g, "$1")
      // `code` ticks
      .replace(/`([^`\n]+?)`/g, "$1")
      // Markdown list markers and headings at the start of a line
      .replace(/^[ \t]*[-*+][ \t]+/gm, "• ")
      .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
      .trim()
  );
}
