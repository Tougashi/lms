import katex from "katex";

export function renderLatex(html: string): string {
  if (!html) return html;

  // Display mode: $$...$$
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) =>
    katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }),
  );

  // Inline mode: $...$ (not preceded by another $)
  html = html.replace(/\$(?!\$)([^\$\n]+?)\$/g, (_, tex) =>
    katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }),
  );

  return html;
}
