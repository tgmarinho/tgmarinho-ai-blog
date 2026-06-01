export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADING_RE = /<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractToc(html: string): TocItem[] {
  if (!html) return [];
  const items: TocItem[] = [];
  for (const match of html.matchAll(HEADING_RE)) {
    const level = Number(match[1]) as 2 | 3;
    const id = match[2];
    const text = stripHtml(match[3]);
    if (!text) continue;
    items.push({ id, text, level });
  }
  return items;
}
