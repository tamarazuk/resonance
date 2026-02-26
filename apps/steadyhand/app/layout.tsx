import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TooltipProvider } from "@resonance/ui/components/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Steadyhand",
    template: "%s — Steadyhand",
  },
  description: "AI-powered career toolkit",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
