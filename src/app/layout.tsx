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
      <body className="min-h-screen bg-midnight-950 bg-midnight-mesh text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
