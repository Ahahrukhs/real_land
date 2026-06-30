import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ourika Estates UP Map",
  description: "A cinematic Uttar Pradesh destination map for Ourika Estates."
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
