import * as runtime from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Callout } from "./callout";
import { CopyButton } from "./copy-button";
import { YouTubeEmbed } from "./video";
import { ShareButton } from "./share-button";
import { RagOverviewLabAuto } from "../lab/rag-overview/rag-overview-lab-auto";

// Stub components for React Native and other components that appear in blog posts
const StubComponent = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{children}</span>
);

const components = {
  Callout,
  YouTubeEmbed,
  ShareButton,
  RagOverviewLab: RagOverviewLabAuto,
  // React Native components stubs (to avoid MDX validation errors)
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
  pre: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement>) => {
    return (
      <div className="relative group">
        <pre {...props}>{children}</pre>
        <CopyButton
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    );
  },
};

type CompiledMDXComponent = React.ComponentType<{
  components?: Record<string, unknown>;
}>;

// Per-process cache for compiled MDX components. Compiling 40+ KB of JS via
// `new Function(...)` on every render is expensive (~1s of CPU); since the
// compiled body is deterministic per post content, memoize by content string.
// The cache survives across requests on the same Node worker.
const compiledByStringCache = new Map<string, CompiledMDXComponent>();

function compileMDX(content: string): CompiledMDXComponent | null {
  const cached = compiledByStringCache.get(content);
  if (cached) return cached;

  try {
    const fn = new Function(content);
    let result:
      | { default?: CompiledMDXComponent }
      | undefined;
    try {
      result = fn({ ...runtime });
    } catch {
      result = new Function("React", "runtime", content)(React, {
        ...runtime,
      });
    }
    const Component = result?.default;
    if (!Component) return null;
    compiledByStringCache.set(content, Component);
    return Component;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("MDX render error:", error);
    }
    return null;
  }
}

interface MdxContentProps {
  code: string;
}

export function MdxContent({ code }: MdxContentProps) {
  const content = code.trim();

  // Check if code is compiled MDX. Velite's `s.mdx()` output is a function-body
  // string that begins with destructuring of jsx-runtime (`const{Fragment...}`)
  // or with `function`/`export` depending on bundler. Distinguish from plain
  // HTML (which begins with a `<` tag).
  const isHTML = content.startsWith("<");
  const isCompiledMDX = !isHTML;
  const Component = useMemo(
    () => (isCompiledMDX ? compileMDX(content) : null),
    [content, isCompiledMDX],
  );

  if (!code) {
    return <div className="prose max-w-none">No content available</div>;
  }

  if (isCompiledMDX) {
    if (!Component) {
      return <div className="prose max-w-none" />;
    }
    return React.createElement(
      "div",
      { className: "prose max-w-none" },
      React.createElement(Component, { components }),
    );
  }

  if (isHTML) {
    // Velite s.markdown() returns compiled HTML - render it directly
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Fallback: plain text
  return <div className="prose max-w-none">{content}</div>;
}
