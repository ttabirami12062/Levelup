import type { Metadata } from "next";
import "./globals.css";

// This is the metadata for Levelup
// It sets the browser tab title and description
// These also matter for SEO when the app goes live
export const metadata: Metadata = {
  title: "Levelup — Play Smart. Rise Fast.",
  description: "A math learning game for kids aged 8-10. Solve problems, earn rewards, build your world.",
};

// RootLayout wraps every single page in Levelup
// Whatever is here appears on every screen
// children = the actual page being rendered inside this wrapper
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-ui antialiased bg-[#EBF5FF]">
        {children}
      </body>
    </html>
  );
}