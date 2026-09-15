'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { EligibilityGate } from '@/components/EligibilityGate';
import { PrivacyExplorer } from '@/components/PrivacyExplorer';
import { CompactCircuitViewer } from '@/components/CompactCircuitViewer';
import { StatsDashboard } from '@/components/StatsDashboard';
import { AccessBadgeModal } from '@/components/AccessBadgeModal';
import { Shield, Sparkles, Lock, ExternalLink, Github, ArrowRight, ShieldCheck, Zap, Eye } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('gate');
  const [badgeData, setBadgeData] = useState<any>(null);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Navbar */}
      <Navbar activeTab={activeTab} onNavSelect={setActiveTab} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>POWERED BY MIDNIGHT NETWORK</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-6">
            <span className="gradient-text">Verifiable Private</span>
            <br />
            <span className="text-white">Eligibility Gate</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base md:text-lg text-purple-200/60 mb-8 leading-relaxed">
            Prove you meet eligibility requirements using zero-knowledge proofs. Your private data never leaves your browser — only the boolean result is disclosed on-chain.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => setActiveTab('gate')}
            className="glow-btn inline-flex items-center space-x-2 px-8 py-3.5 rounded-full text-white font-bold text-sm tracking-wide"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch ZK Gate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Decorative gradient accent behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-purple-600/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      </section>

      {/* Feature Highlights Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel card-hover-lift rounded-2xl p-5 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Zero-Knowledge Privacy</h3>
              <p className="text-xs text-purple-300/60 leading-relaxed">Private witnesses stay in your browser. Zero bits of personal data leaked on-chain.</p>
            </div>
          </div>

          <div className="glass-panel card-hover-lift rounded-2xl p-5 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Compact Smart Contracts</h3>
              <p className="text-xs text-purple-300/60 leading-relaxed">Halo2/PLONK circuits compiled from Midnight's declarative Compact DSL.</p>
            </div>
          </div>

          <div className="glass-panel card-hover-lift rounded-2xl p-5 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Selective Disclosure</h3>
              <p className="text-xs text-purple-300/60 leading-relaxed">Only the boolean eligibility result is disclosed. Exact age remains confidential.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider max-w-5xl mx-auto mb-8" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
        
        {/* Tab Switcher Body */}
        <div className="animate-fade-in-up">
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
        </div>

      </main>

      {/* Access Pass Modal */}
      <AccessBadgeModal badgeData={badgeData} onClose={() => setBadgeData(null)} />

      {/* Footer */}
      <footer className="relative border-t border-purple-900/15 bg-midnight-950/80 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-glow-purple">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-lg font-display font-bold gradient-text">MidnightGate</span>
              </div>
              <p className="text-xs text-purple-300/50 leading-relaxed max-w-xs">
                Production-grade zero-knowledge dApp for verifiable private eligibility verification on Midnight Network.
              </p>
            </div>

            {/* Links Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-purple-200/70 uppercase tracking-wider">Resources</h4>
              <div className="space-y-2">
                <a href="https://midnight.network" target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs text-purple-300/50 hover:text-purple-200 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>Midnight Network</span>
                </a>
                <a href="https://docs.midnight.network" target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs text-purple-300/50 hover:text-purple-200 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  <span>Documentation</span>
                </a>
                <a href="https://github.com/ranjanmehta980-eng/Eligibility-Gate" target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-xs text-purple-300/50 hover:text-purple-200 transition-colors">
                  <Github className="w-3 h-3" />
                  <span>Source Code</span>
                </a>
              </div>
            </div>

            {/* Status Column */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-purple-200/70 uppercase tracking-wider">Status</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Halo2 Proof Engine: Active</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-purple-300/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Network: Midnight Preprod</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-purple-300/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Architecture: Level 3 ZK</span>
                </div>
              </div>
            </div>

          </div>

          {/* Copyright Bar */}
          <div className="section-divider mt-8 mb-4" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-purple-300/40">
            <span>Built with Compact Smart Contracts on Midnight Network</span>
            <span>© 2025 MidnightGate — Level 3 Production Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
