import type { Metadata, Viewport } from "next";
import "./globals.css";
import { S } from "@/lib/strings";

export const metadata: Metadata = { title: `${S.appName}: ${S.tagline}`, description: S.pitch };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-paper font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
