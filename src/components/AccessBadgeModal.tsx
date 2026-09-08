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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden border border-purple-500/40">
        
        {/* Background glow gradient */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-purple-600/30 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-purple-900/50 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            Verifiable Private Access Pass
          </h3>
          <p className="text-xs text-purple-300/80 font-medium">
            Zero-Knowledge Credential Issued by Midnight Network
          </p>
        </div>

        {/* Digital Ticket Visualizer */}
        <div className="rounded-2xl bg-gradient-to-b from-midnight-900 to-midnight-950 p-5 border border-purple-500/30 space-y-4 shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
            <div>
              <span className="text-[10px] uppercase font-mono text-purple-400 tracking-wider">Status</span>
              <p className="text-sm font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified ({badgeData.ageThreshold}+ Years)</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-purple-400 tracking-wider">Issued</span>
              <p className="text-xs font-mono text-purple-200">
                {new Date(badgeData.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-purple-400/70 block">Transaction Hash</span>
              <p className="text-purple-200 truncate bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
                {badgeData.txHash}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-purple-400/70 block">Cryptographic Nullifier</span>
              <p className="text-purple-200 truncate bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
                {badgeData.nullifier}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-purple-400/70 block">Proof Commitment</span>
              <p className="text-purple-200 truncate bg-purple-950/40 p-2 rounded-lg border border-purple-900/30">
                {badgeData.proofHash}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between text-xs">
            <span className="text-purple-300 font-medium">Privacy Status:</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Leakage (Age Shielded & Verified)</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition-all"
        >
          Done & Return to Gate
        </button>

      </div>
    </div>
  );
};
