import { Fraunces, Source_Serif_4 } from "next/font/google";

/**
 * Editorial fonts are scoped to the post route to keep the rest of the
 * site lighter. `--font-fraunces` and `--font-source-serif` are consumed
 * by `.prose` styles in `globals.css` and by a few inline references in
 * `[slug]/page.tsx`. The CSS vars are applied to a wrapper div, which is
 * enough for descendants (including the prose content) to resolve them.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${fraunces.variable} ${sourceSerif.variable} contents`}>
      {children}
    </div>
  );
}
