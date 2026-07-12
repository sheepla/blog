import type { MarkdownHeading } from "astro";

export type ArticleOutlineNode = {
  depth: number;
  slug: string;
  text: string;
  children: ArticleOutlineNode[];
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export function buildArticleOutline(
  headings: MarkdownHeading[],
  minDepth = 2,
  maxDepth = 6
): ArticleOutlineNode[] {
  const outlineHeadings = headings.filter(
    heading => heading.depth >= minDepth && heading.depth <= maxDepth
  );

  const outlineTree: ArticleOutlineNode[] = [];
  const stack: ArticleOutlineNode[] = [];

  for (const heading of outlineHeadings) {
    const node: ArticleOutlineNode = {
      depth: heading.depth,
      slug: heading.slug,
      text: heading.text,
      children: [],
    };

    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      outlineTree.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return outlineTree;
}

function renderOutlineNodes(nodes: ArticleOutlineNode[]): string {
  return nodes
    .map(node => {
      const children =
        node.children.length > 0
          ? `<ul class="mt-1 space-y-1 border-s border-border/70 ps-3">${renderOutlineNodes(node.children)}</ul>`
          : "";

      return `
        <li data-outline-item data-outline-depth="${node.depth}" class="outline-item">
          <a
            data-outline-link
            href="#${escapeHtml(node.slug)}"
            class="outline-link block rounded-md px-1.5 py-0.5 text-[0.78rem] leading-5 text-muted-foreground transition hover:bg-accent/5 hover:text-accent"
          >
            ${escapeHtml(node.text)}
          </a>
          ${children}
        </li>
      `;
    })
    .join("");
}

export function renderArticleOutline(
  headings: MarkdownHeading[],
  minDepth = 2,
  maxDepth = 6
): string {
  return renderOutlineNodes(buildArticleOutline(headings, minDepth, maxDepth));
}
