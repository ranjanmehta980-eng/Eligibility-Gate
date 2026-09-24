import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midnight Gate | Verifiable Private Access (Level-3 ZK dApp)",
  description: "Production-grade decentralized zero-knowledge eligibility and age gate powered by Midnight Network and Compact smart contracts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0c] text-[#e8e5dc] antialiased selection:bg-[#5aa07d]/30 selection:text-[#e8e5dc] font-mono">
        {children}
      </body>
    </html>
  );
}
