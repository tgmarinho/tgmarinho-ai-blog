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
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading CV...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .cv-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.7;
          max-width: 100%;
        }
        .cv-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          margin-top: 0;
          color: #000;
          line-height: 1.2;
        }
        .cv-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #000;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
          line-height: 1.3;
        }
        .cv-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #000;
          line-height: 1.3;
        }
        .cv-content p {
          margin: 0.75rem 0;
          color: #374151;
          line-height: 1.7;
        }
        .cv-content ul, .cv-content ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        .cv-content li {
          margin: 0.5rem 0;
          color: #374151;
          line-height: 1.6;
        }
        .cv-content blockquote {
          margin: 1rem 0;
          padding-left: 1rem;
          border-left: 3px solid #e5e7eb;
          color: #6b7280;
          font-style: italic;
        }
        .cv-content hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2rem 0;
        }
        .cv-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .cv-content th {
          font-weight: 600;
          background-color: #f9fafb;
          color: #000;
        }
        .cv-content th, .cv-content td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .cv-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .cv-content pre {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          border: 1px solid #e5e7eb;
        }
        .cv-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .cv-content a {
          color: #2563eb;
          text-decoration: none;
        }
        .cv-content a:hover {
          text-decoration: underline;
        }
        @media print {
          .cv-content {
            padding: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
      <div className="cv-content rounded-lg border border-border bg-white p-8 shadow-sm print:shadow-none print:border-0">
        {parsedContent}
      </div>
    </>
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
  let codeLanguage = "";

  function flushLists() {
    if (inList && listItems.length > 0) {
      const ListTag = listType === "ul" ? "ul" : "ol";
      elements.push(
        <ListTag key={`list-${elements.length}`} className="my-2 ml-6 list-disc space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-foreground/90">
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
      // Render contact info blockquote as a special styled div
      elements.push(
        <div key={`contact-info-${elements.length}`} className="my-4 space-y-1 text-sm text-muted-foreground">
          {blockquoteContent.map((item, idx) => (
            <p key={idx} className="leading-relaxed">
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
        <pre key={`code-${elements.length}`} className="my-4 overflow-x-auto rounded-lg bg-muted p-4">
          <code className="text-sm font-mono whitespace-pre">{codeContent.join("\n")}</code>
        </pre>
      );
      codeContent = [];
      inCodeBlock = false;
      codeLanguage = "";
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushLists();
        flushBlockquote();
        codeLanguage = trimmed.substring(3).trim();
        inCodeBlock = true;
        codeContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Skip empty lines (but flush current blocks)
    if (!trimmed) {
      flushLists();
      flushBlockquote();
      continue;
    }

    // Blockquote (contact info at top)
    if (trimmed.startsWith(">")) {
      flushLists();
      const blockquoteText = trimmed.substring(1).trim();
      // Check if next line is also a blockquote
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";
      if (nextLine.startsWith(">")) {
        // Multi-line blockquote
        inBlockquote = true;
        blockquoteContent.push(blockquoteText);
      } else {
        // Single line blockquote - render as contact info
        elements.push(
          <p key={`contact-${i}`} className="my-1 text-muted-foreground text-sm leading-relaxed">
            {formatInlineMarkdown(blockquoteText)}
          </p>
        );
      }
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed.match(/^[-*_]{3,}$/)) {
      flushLists();
      flushBlockquote();
      elements.push(<hr key={`hr-${i}`} className="my-6 border-border" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      flushLists();
      flushBlockquote();
      elements.push(
        <h1 key={`h1-${i}`} className="mb-4 text-3xl font-bold tracking-tight">
          {formatInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushLists();
      flushBlockquote();
      elements.push(
        <h2 key={`h2-${i}`} className="mb-3 mt-8 text-2xl font-semibold border-b border-border pb-2">
          {formatInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushLists();
      flushBlockquote();
      elements.push(
        <h3 key={`h3-${i}`} className="mb-2 mt-6 text-xl font-semibold">
          {formatInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
      continue;
    }

    // Lists
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

    // Table
    if (trimmed.startsWith("|")) {
      flushLists();
      flushBlockquote();
      const cells = trimmed
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell);
      
      if (cells.length > 0) {
        if (trimmed.match(/^\|[\s-:|]+\|$/)) {
          // Table separator row - skip
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

    // Regular paragraph
    if (trimmed && !inList && !inBlockquote && !inTable) {
      flushLists();
      flushBlockquote();
      elements.push(
        <p key={`p-${i}`} className="my-2 text-foreground/90 leading-relaxed">
          {formatInlineMarkdown(trimmed)}
        </p>
      );
    }
  }

  // Flush remaining blocks
  flushLists();
  flushBlockquote();
  flushCodeBlock();

  // Flush table
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="table-wrapper" className="my-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {tableHeaders.map((header, idx) => (
                <th key={idx} className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                  {formatInlineMarkdown(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="border border-border px-4 py-2">
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

function formatInlineMarkdown(text: string): ReactNode {
  const parts: (string | ReactNode)[] = [];
  
  // Process in order: code, links, bold, italic (to avoid conflicts)
  // Use a simpler approach: process and replace sequentially
  
  let processed = text;
  const replacements: Array<{ placeholder: string; element: ReactNode }> = [];
  let placeholderIndex = 0;

  // Process code first (highest priority)
  processed = processed.replace(/`([^`]+)`/g, (match, content) => {
    const placeholder = `__CODE_${placeholderIndex}__`;
    replacements.push({
      placeholder,
      element: (
        <code key={`code-${placeholderIndex}`} className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
          {content}
        </code>
      ),
    });
    placeholderIndex++;
    return placeholder;
  });

  // Process links
  processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, content, url) => {
    const placeholder = `__LINK_${placeholderIndex}__`;
    replacements.push({
      placeholder,
      element: (
        <a
          key={`link-${placeholderIndex}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          {content}
        </a>
      ),
    });
    placeholderIndex++;
    return placeholder;
  });

  // Process bold (must come before italic)
  processed = processed.replace(/\*\*([^*]+?)\*\*/g, (match, content) => {
    const placeholder = `__BOLD_${placeholderIndex}__`;
    replacements.push({
      placeholder,
      element: (
        <strong key={`bold-${placeholderIndex}`} className="font-semibold">
          {content}
        </strong>
      ),
    });
    placeholderIndex++;
    return placeholder;
  });

  // Process italic (only single asterisks, not part of bold)
  processed = processed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, (match, content) => {
    const placeholder = `__ITALIC_${placeholderIndex}__`;
    replacements.push({
      placeholder,
      element: (
        <em key={`italic-${placeholderIndex}`} className="italic">
          {content}
        </em>
      ),
    });
    placeholderIndex++;
    return placeholder;
  });

  // Split by placeholders and reconstruct
  const segments = processed.split(/(__\w+_\d+__)/);
  
  return (
    <>
      {segments.map((segment, index) => {
        const replacement = replacements.find((r) => r.placeholder === segment);
        if (replacement) {
          return <Fragment key={index}>{replacement.element}</Fragment>;
        }
        return segment ? <Fragment key={index}>{segment}</Fragment> : null;
      })}
    </>
  );
}
