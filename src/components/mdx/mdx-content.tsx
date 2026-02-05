import * as runtime from "react/jsx-runtime";
import { Callout } from "./callout";
import { CopyButton } from "./copy-button";
import { YouTubeEmbed } from "./video";

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

const components = {
  Callout,
  YouTubeEmbed,
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
  const Component = useMDXComponent(code);
  return (
    <div className="prose max-w-none">
      <Component components={components} />
    </div>
  );
}
