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
      <body className="min-h-screen bg-midnight-950 text-slate-100 antialiased selection:bg-purple-500/40 selection:text-white relative">
        {/* Ambient Background Orbs */}
        <div className="ambient-orb w-[600px] h-[600px] bg-purple-600/20 top-[-200px] left-[-200px] animate-float" />
        <div className="ambient-orb w-[500px] h-[500px] bg-pink-600/15 bottom-[10%] right-[-150px] animate-float-delayed" />
        <div className="ambient-orb w-[400px] h-[400px] bg-cyan-600/10 top-[40%] left-[30%] animate-float" style={{ animationDelay: '4s' }} />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
