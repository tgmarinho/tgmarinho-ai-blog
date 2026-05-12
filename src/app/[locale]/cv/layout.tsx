import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV",
  description: "Curriculum Vitae - Thiago Marinho de Oliveira - AI Product Engineer",
};

export default function CVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
