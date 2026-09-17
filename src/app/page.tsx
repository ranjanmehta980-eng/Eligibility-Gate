'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { EligibilityGate } from '@/components/EligibilityGate';
import { PrivacyExplorer } from '@/components/PrivacyExplorer';
import { CompactCircuitViewer } from '@/components/CompactCircuitViewer';
import { StatsDashboard } from '@/components/StatsDashboard';
import { AccessBadgeModal } from '@/components/AccessBadgeModal';
import { ExternalLink, Github, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('gate');
  const [badgeData, setBadgeData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#060311] text-white p-4 md:p-6 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-pink-600/20 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* HEADER - GLASS */}
      <Navbar activeTab={activeTab} onNavSelect={setActiveTab} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto mt-6 space-y-6">
        {activeTab === 'gate' && (
          <EligibilityGate onSuccessBadge={(data) => setBadgeData(data)} />
        )}

        {activeTab === 'explorer' && (
          <PrivacyExplorer />
        )}

        {activeTab === 'circuit' && (
          <CompactCircuitViewer />
        )}

        {activeTab === 'stats' && (
          <StatsDashboard />
        )}
      </main>

      {/* ACCESS BADGE MODAL */}
      <AccessBadgeModal badgeData={badgeData} onClose={() => setBadgeData(null)} />

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto w-full mt-12 pt-8 pb-4 border-t border-purple-500/15 text-xs text-zinc-400">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[11px] font-bold">🛡️</span>
            <span className="font-bold text-white">MidnightGate Protocol</span>
            <span className="text-zinc-500">• Level 3 Production ZK dApp</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://preprod.midnight.network/contract/c634cc887df0973ba82bc12e8eec22a7e4b7fc3cbce230cd84cc57b01183cf48"
              target="_blank"
              rel="noreferrer"
              className="hover:text-pink-400 transition flex items-center gap-1"
            >
              <span>On-Chain Contract</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/ranjanmehta980-eng/Eligibility-Gate"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-300 transition flex items-center gap-1"
            >
              <span>GitHub Source</span>
              <Github className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="text-center md:text-left mt-4 text-[11px] text-zinc-500">
          Powered by Midnight Network • Built with Compact Smart Contracts & Halo2/PLONK Proofs
        </div>
      </footer>
    </div>
  );
}
