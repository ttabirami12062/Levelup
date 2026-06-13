import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/lib/gameContext";

export const metadata: Metadata = {
  title: "Levelup — Play Smart. Rise Fast.",
  description: "A math learning game for kids aged 8-10.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-[#EBF5FF]">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}