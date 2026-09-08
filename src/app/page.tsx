'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { EligibilityGate } from '@/components/EligibilityGate';
import { PrivacyExplorer } from '@/components/PrivacyExplorer';
import { CompactCircuitViewer } from '@/components/CompactCircuitViewer';
import { StatsDashboard } from '@/components/StatsDashboard';
import { AccessBadgeModal } from '@/components/AccessBadgeModal';
import { Shield, Sparkles, Lock, ArrowUpRight, Github, ExternalLink, Terminal } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('gate');
  const [badgeData, setBadgeData] = useState<any>(null);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <Navbar activeTab={activeTab} onNavSelect={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto pb-2 space-x-2">
          {[
            { id: 'gate', label: 'ZK Gate' },
            { id: 'explorer', label: 'Privacy Explorer' },
            { id: 'circuit', label: 'Compact Circuit' },
            { id: 'stats', label: 'Ledger Stats' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap border transition-all ${
                activeTab === item.id
                  ? 'bg-purple-600/30 text-white border-purple-500'
                  : 'bg-midnight-900/60 text-purple-300/70 border-purple-900/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab Switcher Body */}
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

      {/* Access Pass Modal */}
      <AccessBadgeModal badgeData={badgeData} onClose={() => setBadgeData(null)} />

      {/* Footer */}
      <footer className="border-t border-purple-900/30 bg-midnight-950/80 backdrop-blur-xl py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-purple-300/60">
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span>
              Built with <strong className="text-purple-200">Compact Smart Contracts</strong> on <strong className="text-purple-200">Midnight Network</strong> (Level 3 Architecture)
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Halo2 Proof Engine: Active</span>
            </div>
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-purple-200 transition-colors flex items-center space-x-1"
            >
              <span>Midnight Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}
