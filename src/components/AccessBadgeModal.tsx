'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Download, X, Sparkles, Lock, QrCode } from 'lucide-react';

interface AccessBadgeModalProps {
  badgeData: {
    ageThreshold: number;
    txHash: string;
    proofHash: string;
    nullifier: string;
    timestamp: number;
  } | null;
  onClose: () => void;
}

export const AccessBadgeModal: React.FC<AccessBadgeModalProps> = ({ badgeData, onClose }) => {
  if (!badgeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-xl animate-fade-in-up">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden border border-purple-500/30">
        
        {/* Background glow orbs */}
        <div className="absolute -right-24 -top-24 w-72 h-72 bg-gradient-to-br from-purple-600/20 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-midnight-900/60 hover:bg-purple-900/30 text-purple-400/60 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-500 text-white shadow-glow-purple mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-display font-black tracking-tight gradient-text">
            Verifiable Private Access Pass
          </h3>
          <p className="text-xs text-purple-300/50 font-medium">
            Zero-Knowledge Credential — Midnight Network
          </p>
        </div>

        {/* Digital Ticket Visualizer */}
        <div className="rounded-2xl bg-midnight-950/60 p-5 border border-purple-500/15 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/15">
            <div>
              <span className="text-[10px] uppercase font-mono text-purple-400/40 tracking-wider">Status</span>
              <p className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified ({badgeData.ageThreshold}+ Years)</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-purple-400/40 tracking-wider">Issued</span>
              <p className="text-xs font-mono text-purple-200/60">
                {new Date(badgeData.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {[
              { label: 'Transaction Hash', value: badgeData.txHash },
              { label: 'Cryptographic Nullifier', value: badgeData.nullifier },
              { label: 'Proof Commitment', value: badgeData.proofHash },
            ].map((item, idx) => (
              <div key={idx}>
                <span className="text-[10px] text-purple-400/35 block">{item.label}</span>
                <p className="text-purple-200/60 truncate bg-midnight-900/50 p-2.5 rounded-lg border border-purple-900/10">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/10 flex items-center justify-between text-xs">
            <span className="text-purple-300/50 font-medium">Privacy Status:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Leakage Verified</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl glow-btn text-white font-bold text-sm tracking-wide"
        >
          Done & Return to Gate
        </button>

      </div>
    </div>
  );
};
