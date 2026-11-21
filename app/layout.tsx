import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rayo Codex — Mathematical Language Archive",
  description: "Explore the impossible word: pi-powered magical language, indexed by volume, chapter, verse, and phrase.",
  openGraph: { title: "Rayo Codex", description: "One word. Beyond scale." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
