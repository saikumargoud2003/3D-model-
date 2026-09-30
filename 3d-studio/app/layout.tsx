import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Studio",
  description: "Generate interactive 3D models from a text prompt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
