import * as runtime from "react/jsx-runtime";
import React from "react";
import { Callout } from "./callout";
import { CopyButton } from "./copy-button";
import { YouTubeEmbed } from "./video";
import { ShareButton } from "./share-button";

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

  const content = code.trim();

  // Check if code is compiled MDX (starts with function/export)
  const isCompiledMDX = content.startsWith("function") || content.startsWith("export");

  // Check if code is already HTML (from Velite s.markdown())
  const isHTML = content.startsWith("<");

  if (isCompiledMDX) {
    try {
      const fn = new Function("React", "runtime", content);
      const result = fn(React, { ...runtime });
      const Component = result?.default || result;
      if (!Component) {
        return <div className="prose max-w-none" />;
      }
      return (
        <div className="prose max-w-none">
          <Component components={components} />
        </div>
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("MDX render error:", error);
      }
      return <div className="prose max-w-none" />;
    }
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
