import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Primland Explorer Dashboard",
  description: "A cinematic Next.js resort map dashboard inspired by Blue Ridge mountain estates."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
