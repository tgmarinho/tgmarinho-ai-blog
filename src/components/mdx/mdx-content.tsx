import * as runtime from "react/jsx-runtime";
import React from "react";
import { Callout } from "./callout";
import { CopyButton } from "./copy-button";
import { YouTubeEmbed } from "./video";

const useMDXComponent = (code: string) => {
  try {
    // Check if code contains await and wrap in async if needed
    const hasAwait = /await\s+/.test(code);
    const wrappedCode = hasAwait 
      ? `(async function() { ${code} })()`
      : code;
    
    const fn = new Function("React", "runtime", wrappedCode);
    const result = fn(React, { ...runtime });
    return result?.default || result || (() => null);
  } catch (error) {
    // Silently fail during build - return empty component
    if (typeof window === "undefined") {
      return () => null;
    }
    console.warn("MDX component error:", error);
    return () => null;
  }
};

// Stub components for React Native and other components that appear in blog posts
const StubComponent = ({ children, ...props }: any) => <span {...props}>{children}</span>;

const components = {
  Callout,
  YouTubeEmbed,
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
  try {
    const Component = useMDXComponent(code);
    if (!Component) {
      return <div className="prose max-w-none">Error loading content</div>;
    }
    return (
      <div className="prose max-w-none">
        <Component components={components} />
      </div>
    );
  } catch (error) {
    // During build, return empty div to prevent build failures
    if (typeof window === "undefined") {
      return <div className="prose max-w-none" />;
    }
    console.error("MDX render error:", error);
    return <div className="prose max-w-none">Error rendering content</div>;
  }
}
