import React, { ReactNode } from "react";
import { Callout } from "./callout";
import { YouTubeEmbed } from "./video";
import { CopyButton } from "./copy-button";

// Stub components for React Native and other components that appear in blog posts
const StubComponent = ({ children, ...props }: any) => <span {...props}>{children}</span>;

const components: Record<string, React.ComponentType<any>> = {
  Callout,
  YouTubeEmbed,
  // React Native components stubs
  ActivityIndicator: StubComponent,
  Text: StubComponent,
  View: StubComponent,
  ScrollView: StubComponent,
  TouchableOpacity: StubComponent,
  Image: StubComponent,
  FlatList: StubComponent,
  SafeAreaView: StubComponent,
  StatusBar: StubComponent,
  // Components from blog posts that don't exist
  ProblemStatement: StubComponent,
  Widget: StubComponent,
  Video: StubComponent,
  TreeSandbox: StubComponent,
  EmbeddedTranspiler: StubComponent,
  VisitorSandbox: StubComponent,
  BabelPipeline: StubComponent,
  TraverseVisitor: StubComponent,
};

function formatInlineMarkdown(text: string): ReactNode {
  if (!text) return null;
  
  let processed = text;
  const replacements: Array<{ placeholder: string; element: ReactNode }> = [];
  let placeholderIndex = 0;

  // Process code first (inline code)
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

  // Process bold
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

  // Process italic
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

  // If no replacements were made, return text as-is
  if (replacements.length === 0) {
    return <>{text}</>;
  }

  // Split by placeholders and reconstruct
  // Use a regex that captures the placeholder pattern
  const placeholderRegex = /(__\w+_\d+__)/g;
  const segments: (string | ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex
  placeholderRegex.lastIndex = 0;
  
  while ((match = placeholderRegex.exec(processed)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      const textSegment = processed.substring(lastIndex, match.index);
      if (textSegment) {
        segments.push(textSegment);
      }
    }
    
    // Add the replacement element
    const replacement = replacements.find((r) => r.placeholder === match[1]);
    if (replacement) {
      segments.push(replacement.element);
    } else {
      // If replacement not found, keep the placeholder as text (shouldn't happen)
      segments.push(match[1]);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last placeholder
  if (lastIndex < processed.length) {
    segments.push(processed.substring(lastIndex));
  }
  
  // If no segments were created, return the original text
  if (segments.length === 0) {
    return <>{text}</>;
  }
  
  return <>{segments}</>;
}

export function parseMarkdown(content: string): ReactNode {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = "";
  let inList = false;
  let listItems: string[] = [];
  let listType: "ul" | "ol" = "ul";
  let inIframe = false;
  let iframeContent: string[] = [];

  function flushCodeBlock() {
    if (inCodeBlock && codeContent.length > 0) {
      const codeText = codeContent.join("\n");
      // Render as text - React will automatically escape HTML/JSX
      elements.push(
        <div key={`code-wrapper-${elements.length}`} className="relative group my-4">
          <pre className="overflow-x-auto rounded-lg bg-muted p-4">
            <code className={`text-sm font-mono whitespace-pre language-${codeLanguage || "plaintext"}`}>
              {codeText}
            </code>
          </pre>
          <CopyButton className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
      codeContent = [];
      inCodeBlock = false;
      codeLanguage = "";
    }
  }

  function flushList() {
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

  function parseIframeAttributes(iframeHtml: string): React.HTMLAttributes<HTMLIFrameElement> {
    const attrs: React.HTMLAttributes<HTMLIFrameElement> = {};
    
    // Normalize the HTML string (remove newlines, normalize spaces)
    const normalized = iframeHtml.replace(/\s+/g, " ").trim();
    
    // Extract src (with quotes or without)
    const srcMatch = normalized.match(/src=["']?([^"'\s>]+)["']?/i);
    if (srcMatch) attrs.src = srcMatch[1];
    
    // Extract width (with quotes or without)
    const widthMatch = normalized.match(/width=["']?(\d+)["']?/i);
    if (widthMatch) attrs.width = parseInt(widthMatch[1]);
    
    // Extract height (with quotes or without)
    const heightMatch = normalized.match(/height=["']?(\d+)["']?/i);
    if (heightMatch) attrs.height = parseInt(heightMatch[1]);
    
    // Extract frameborder (convert to frameBorder for React)
    const frameborderMatch = normalized.match(/frameborder=["']?(\d+)["']?/i);
    if (frameborderMatch) attrs.frameBorder = frameborderMatch[1];
    
    // Extract allow (with quotes)
    const allowMatch = normalized.match(/allow=["']([^"']+)["']/i);
    if (allowMatch) attrs.allow = allowMatch[1];
    
    // Extract allowFullScreen (convert to allowFullScreen for React)
    if (normalized.match(/allowfullscreen/i)) {
      attrs.allowFullScreen = true;
    }
    
    // Extract className (JSX format)
    const classNameMatch = normalized.match(/className=["']([^"']+)["']/);
    if (classNameMatch) attrs.className = classNameMatch[1];
    
    return attrs;
  }

  function flushIframe() {
    if (inIframe && iframeContent.length > 0) {
      const iframeHtml = iframeContent.join("\n");
      const attrs = parseIframeAttributes(iframeHtml);
      
      // Calculate aspect ratio if width and height are provided
      let aspectRatio = "aspect-video"; // default 16:9
      if (attrs.width && attrs.height) {
        const ratio = attrs.width / attrs.height;
        if (Math.abs(ratio - 16/9) < 0.1) {
          aspectRatio = "aspect-video";
        } else if (Math.abs(ratio - 4/3) < 0.1) {
          aspectRatio = "aspect-[4/3]";
        } else if (Math.abs(ratio - 21/9) < 0.1) {
          aspectRatio = "aspect-[21/9]";
        } else {
          // Use custom aspect ratio
          const customRatio = `${attrs.width}/${attrs.height}`;
          aspectRatio = `aspect-[${customRatio}]`;
        }
      }
      
      // Add responsive wrapper
      elements.push(
        <div key={`iframe-${elements.length}`} className={`my-6 ${aspectRatio} w-full overflow-hidden rounded-lg`}>
          <iframe
            {...attrs}
            className={`w-full h-full border-0 ${attrs.className || ""}`}
            loading="lazy"
            title="Embedded content"
          />
        </div>
      );
      
      iframeContent = [];
      inIframe = false;
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
        flushList();
        flushIframe();
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

    // Iframe detection (single line or multi-line)
    if (trimmed.includes("<iframe") || inIframe) {
      if (trimmed.includes("<iframe") && !inIframe) {
        flushList();
        inIframe = true;
        iframeContent = [];
      }
      
      iframeContent.push(line);
      
      // Check if iframe is closed (single line: self-closing or multi-line: closing tag)
      const isSelfClosing = trimmed.includes("/>") && trimmed.includes("<iframe");
      const hasClosingTag = trimmed.includes("</iframe>");
      
      if (isSelfClosing || hasClosingTag) {
        flushIframe();
      }
      continue;
    }

    // Skip empty lines
    if (!trimmed) {
      flushList();
      flushIframe();
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      flushList();
      flushIframe();
      elements.push(
        <h1 key={`h1-${i}`} className="mb-4 text-3xl font-bold tracking-tight">
          {formatInlineMarkdown(trimmed.substring(2))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      flushIframe();
      elements.push(
        <h2 key={`h2-${i}`} className="mb-3 mt-8 text-2xl font-semibold border-b border-border pb-2">
          {formatInlineMarkdown(trimmed.substring(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      flushIframe();
      elements.push(
        <h3 key={`h3-${i}`} className="mb-2 mt-6 text-xl font-semibold">
          {formatInlineMarkdown(trimmed.substring(4))}
        </h3>
      );
      continue;
    }

    // Lists
    if (trimmed.match(/^[-*]\s/)) {
      inList = true;
      listType = "ul";
      listItems.push(trimmed.substring(2).trim());
      continue;
    }
    if (trimmed.match(/^\d+\.\s/)) {
      inList = true;
      listType = "ol";
      listItems.push(trimmed.replace(/^\d+\.\s/, "").trim());
      continue;
    }

    // Paragraphs
    if (trimmed && !inList) {
      flushIframe();
      elements.push(
        <p key={`p-${i}`} className="mb-4 leading-relaxed">
          {formatInlineMarkdown(trimmed)}
        </p>
      );
    }
  }

  flushCodeBlock();
  flushList();
  flushIframe();

  // Ensure we always return something
  if (elements.length === 0) {
    return <p className="text-muted-foreground">No content to display</p>;
  }

  return <>{elements}</>;
}
