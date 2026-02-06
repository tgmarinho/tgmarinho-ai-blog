import * as runtime from "react/jsx-runtime";
import React from "react";
import { Callout } from "./callout";
import { CopyButton } from "./copy-button";
import { YouTubeEmbed } from "./video";
import { ShareButton } from "./share-button";
import { parseMarkdown } from "./markdown-parser";

// This is now used for markdown strings, not compiled MDX
const useMarkdownContent = (markdown: string) => {
  try {
    return parseMarkdown(markdown);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Markdown parsing error:", error);
    }
    return null;
  }
};

// Stub components for React Native and other components that appear in blog posts
const StubComponent = ({ children, ...props }: any) => <span {...props}>{children}</span>;

const components = {
  Callout,
  YouTubeEmbed,
  ShareButton,
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

interface MdxContentProps {
  code: string;
}

export function MdxContent({ code }: MdxContentProps) {
  if (!code) {
    return <div className="prose max-w-none">No content available</div>;
  }

  const content = code;

  // Check if code is compiled MDX (starts with function/export) or markdown string
  const isCompiledMDX = content.trim().startsWith("function") || content.trim().startsWith("export");
  
  if (isCompiledMDX) {
    // Handle compiled MDX
    try {
      const fn = new Function("React", "runtime", content);
      const result = fn(React, { ...runtime });
      const Component = result?.default || result;
      if (!Component) {
        return <div className="prose max-w-none">Error: Could not compile MDX component</div>;
      }
      return (
        <div className="prose max-w-none">
          <Component components={components} />
        </div>
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("MDX render error:", error);
        return <div className="prose max-w-none">Error rendering content: {String(error)}</div>;
      }
      return <div className="prose max-w-none" />;
    }
  } else {
    // Handle markdown string
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Parsing markdown, content length:", content.length);
      }
      const parsedContent = useMarkdownContent(content);
      if (!parsedContent) {
        if (process.env.NODE_ENV === "development") {
          console.warn("parseMarkdown returned null or undefined");
        }
        return <div className="prose max-w-none">Error parsing markdown</div>;
      }
      return <div className="prose max-w-none">{parsedContent}</div>;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Markdown render error:", error);
        return <div className="prose max-w-none">Error rendering markdown: {String(error)}</div>;
      }
      return <div className="prose max-w-none" />;
    }
  }
}
