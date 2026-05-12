"use client";

import { useMemo, ReactNode, Fragment } from "react";

interface CVViewerProps {
  content: string;
}

export function CVViewer({ content }: CVViewerProps) {
  const parsedContent = useMemo(() => {
    if (!content) return null;
    return parseMarkdown(content);
  }, [content]);

  if (!parsedContent) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          loading cv…
        </p>
      </div>
    );
  }

  return (
    <div
      className="cv-content relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur-md md:p-12"
      style={{ scrollMarginTop: "5rem" }}
    >
      {/* Hairline highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent"
      />
      {parsedContent}
    </div>
  );
}

function parseMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let inBlockquote = false;
  let blockquoteContent: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let listType: "ul" | "ol" = "ul";
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];

  function flushLists() {
    if (inList && listItems.length > 0) {
      const ListTag = listType === "ul" ? "ul" : "ol";
      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={
            listType === "ul"
              ? "my-3 ml-2 space-y-1.5 list-none"
              : "my-3 ml-6 list-decimal space-y-1.5 marker:text-cyan-300/60 marker:font-mono marker:text-[11px]"
          }
        >
          {listItems.map((item, idx) => (
            <li
              key={idx}
              className={
                listType === "ul"
                  ? "relative pl-5 text-[14.5px] leading-[1.65] text-foreground/85 before:absolute before:left-0 before:top-[0.7em] before:h-1 before:w-1 before:rounded-full before:bg-cyan-300/70 before:shadow-[0_0_5px_rgba(34,211,238,0.6)]"
                  : "text-[14.5px] leading-[1.65] text-foreground/85"
              }
            >
              {formatInlineMarkdown(item)}
            </li>
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  }

  function flushBlockquote() {
    if (inBlockquote && blockquoteContent.length > 0) {
      // Contact info at the top of the CV — render as a discreet info row
      elements.push(
        <div
          key={`contact-info-${elements.length}`}
          className="mt-2 mb-6 grid grid-cols-1 gap-1 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:grid-cols-2"
        >
          {blockquoteContent.map((item, idx) => (
            <p
              key={idx}
              className="font-mono text-[11.5px] uppercase tracking-[0.14em] leading-[1.6] text-muted-foreground"
            >
              {formatInlineMarkdown(item)}
            </p>
          ))}
        </div>
      );
      blockquoteContent = [];
      inBlockquote = false;
    }
  }

  function flushCodeBlock() {
    if (inCodeBlock && codeContent.length > 0) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="my-5 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/40 p-4"
        >
          <code className="block font-mono text-[12.5px] text-foreground/90 whitespace-pre">
            {codeContent.join("\n")}
          </code>
        </pre>
      );
      codeContent = [];
      inCodeBlock = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushLists();
        flushBlockquote();
        inCodeBlock = true;
        codeContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    if (!trimmed) {
      flushLists();
      flushBlockquote();
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushLists();
      const blockquoteText = trimmed.substring(1).trim();
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      if (nextLine.startsWith(">")) {
        inBlockquote = true;
        blockquoteContent.push(blockquoteText);
      } else {
        elements.push(
          <p
            key={`contact-${i}`}
            className="my-1 font-mono text-[11.5px] uppercase tracking-[0.14em] leading-[1.6] text-muted-foreground"
          >
            {formatInlineMarkdown(blockquoteText)}
          </p>
        );
      }
      continue;
    }

    if (trimmed === "---" || trimmed.match(/^[-*_]{3,}$/)) {
      flushLists();
      flushBlockquote();
      elements.push(
        <hr
          key={`hr-${i}`}
          className="my-8 h-px border-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushLists();
      flushBlockquote();
      elements.push(
        <h2
          key={`h1-${i}`}
          className="mb-2 font-display text-[36px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground md:text-[44px]"
        >
          {formatInlineMarkdown(trimmed.substring(2))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushLists();
      flushBlockquote();
      const id = slug(trimmed.substring(3));
      const sectionNumber =
        elements.filter((el) => {
          if (typeof el === "object" && el !== null && "type" in el) {
            return (el as { type?: string }).type === "h2";
          }
          return false;
        }).length + 1;
      elements.push(
        <h2
          id={id}
          key={`h2-${i}`}
          className="mt-12 mb-4 flex items-baseline gap-3 font-display text-[22px] font-semibold tracking-[-0.02em] text-foreground md:text-[26px]"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/85">
            {String(sectionNumber).padStart(2, "0")} ━
          </span>
          <span>{formatInlineMarkdown(trimmed.substring(3))}</span>
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushLists();
      flushBlockquote();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mt-7 mb-2 font-display text-[17px] font-semibold tracking-tight text-foreground md:text-[18px]"
        >
          {formatInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.match(/^[-*]\s/)) {
      flushBlockquote();
      inList = true;
      listType = "ul";
      listItems.push(trimmed.substring(2).trim());
      continue;
    }
    if (trimmed.match(/^\d+\.\s/)) {
      flushBlockquote();
      inList = true;
      listType = "ol";
      listItems.push(trimmed.replace(/^\d+\.\s/, "").trim());
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushLists();
      flushBlockquote();
      const cells = trimmed
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);

      if (cells.length > 0) {
        if (trimmed.match(/^\|[\s-:|]+\|$/)) {
          continue;
        }
        if (!inTable) {
          inTable = true;
          tableHeaders = cells;
          tableRows = [];
        } else {
          tableRows.push(cells);
        }
        continue;
      }
    }

    if (trimmed && !inList && !inBlockquote && !inTable) {
      flushLists();
      flushBlockquote();
      elements.push(
        <p
          key={`p-${i}`}
          className="my-3 text-[14.5px] leading-[1.7] text-foreground/85"
        >
          {formatInlineMarkdown(trimmed)}
        </p>
      );
    }
  }

  flushLists();
  flushBlockquote();
  flushCodeBlock();

  if (inTable && tableRows.length > 0) {
    elements.push(
      <div
        key="table-wrapper"
        className="my-6 overflow-x-auto rounded-xl border border-white/[0.06]"
      >
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {tableHeaders.map((header, idx) => (
                <th
                  key={idx}
                  className="border-b border-white/[0.08] bg-white/[0.025] px-4 py-3 text-left font-mono text-[10.5px] uppercase tracking-[0.18em] text-cyan-300/85"
                >
                  {formatInlineMarkdown(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-white/[0.04] last:border-0"
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-4 py-2.5 text-foreground/85"
                  >
                    {formatInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <>{elements}</>;
}

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatInlineMarkdown(text: string): ReactNode {
  let processed = text;
  const replacements: Array<{ placeholder: string; element: ReactNode }> = [];
  let placeholderIndex = 0;

  processed = processed.replace(/`([^`]+)`/g, (_, content) => {
    const placeholder = `__CODE_${placeholderIndex}__`;
    replacements.push({
      placeholder,
      element: (
        <code
          key={`code-${placeholderIndex}`}
          className="rounded border border-cyan-300/15 bg-cyan-300/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200"
        >
          {content}
        </code>
      ),
    });
    placeholderIndex++;
    return placeholder;
  });

  processed = processed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, content, url) => {
      const placeholder = `__LINK_${placeholderIndex}__`;
      replacements.push({
        placeholder,
        element: (
          <a
            key={`link-${placeholderIndex}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline decoration-cyan-300/30 underline-offset-[3px] transition-colors hover:decoration-cyan-300"
          >
            {content}
          </a>
        ),
      });
      placeholderIndex++;
      return placeholder;
    }
  );

  processed = processed.replace(/\*\*([^*]+?)\*\*/g, (_, content) => {
    const placeholder = `__BOLD_${placeholderIndex}__`;
    replacements.push({
      placeholder,
      element: (
        <strong
          key={`bold-${placeholderIndex}`}
          className="font-semibold text-foreground"
        >
          {content}
        </strong>
      ),
    });
    placeholderIndex++;
    return placeholder;
  });

  processed = processed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, (_, content) => {
    const placeholder = `__ITALIC_${placeholderIndex}__`;
    replacements.push({
      placeholder,
      element: (
        <em key={`italic-${placeholderIndex}`} className="italic text-foreground/95">
          {content}
        </em>
      ),
    });
    placeholderIndex++;
    return placeholder;
  });

  const segments = processed.split(/(__\w+_\d+__)/);

  return (
    <>
      {segments.map((segment, index) => {
        const replacement = replacements.find(
          (r) => r.placeholder === segment
        );
        if (replacement) {
          return <Fragment key={index}>{replacement.element}</Fragment>;
        }
        return segment ? <Fragment key={index}>{segment}</Fragment> : null;
      })}
    </>
  );
}
