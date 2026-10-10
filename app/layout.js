// Root layout component: sets metadata, loads required Google Fonts (Anton and Space Mono), and wraps the application.
// Fonts are injected as CSS variables for consistent application-wide typography tokens.

import { Anton, Space_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Aether",
  description: "A scroll-driven visual experience combining street graphics with digital wireframes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.variable} ${spaceMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
