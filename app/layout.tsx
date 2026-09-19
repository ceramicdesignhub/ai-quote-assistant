import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuotePilot — AI Quote Assistant",
  description:
    "Turn customer enquiries into ready-to-send professional quotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
