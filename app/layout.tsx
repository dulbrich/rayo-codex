import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Rayo Codex · Reader", template: "%s · Rayo Codex" },
  description: "Read and pronounce David and Harvey’s imagined longest word, built syllable by syllable from the digits of π.",
};

export const viewport: Viewport = { themeColor: "#101517", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
