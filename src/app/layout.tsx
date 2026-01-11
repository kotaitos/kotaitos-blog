import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClickSpark from "@/shared/components/ClickSpark";
import { Footer } from "@/shared/components/Footer";
import { Navigation } from "@/shared/components/Navigation";
import { SeasonalBackground } from "@/shared/components/SeasonalBackground";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "kotaitos",
  description: "kotaitos's website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`scroll-smooth ${jetbrainsMono.variable}`}>
      <body className="font-mono">
        <SeasonalBackground />
        <ClickSpark
          sparkColor="#22c55e"
          sparkSize={8}
          sparkRadius={20}
          sparkCount={8}
          duration={400}
        >
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ClickSpark>
      </body>
    </html>
  );
}
