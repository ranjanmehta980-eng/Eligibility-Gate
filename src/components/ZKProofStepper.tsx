'use client';

import React from 'react';
import { ProverStep } from '@/midnight/types';

interface ZKProofStepperProps {
  currentStep: ProverStep;
  statusMessage: string;
  progressPercent: number;
  proofHash?: string;
  txHash?: string;
  isProving?: boolean;
}

export const ZKProofStepper: React.FC<ZKProofStepperProps> = ({
  currentStep,
  statusMessage,
  progressPercent,
  proofHash,
  txHash,
  isProving,
}) => {
  const steps = [
    { t: 'Private Witness', s: 'Age validated locally', id: 'loading-witness' },
    { t: 'Constraint Synthesis', s: 'R1CS circuit compiled', id: 'synthesizing-constraints' },
    { t: 'ZK Proof Gen', s: 'Proof generated • 1.42s', id: 'generating-zk-proof' },
    { t: 'On-Chain Verify', s: 'Verified on Midnight Lace', id: 'verifying-on-chain' },
  ];

  const getStepStatus = (stepId: string) => {
    const order = ['loading-witness', 'synthesizing-constraints', 'generating-zk-proof', 'verifying-on-chain', 'completed'];
    const currentIndex = order.indexOf(currentStep);
    const stepIndex = order.indexOf(stepId);

    if (currentStep === 'failed') return 'failed';
    if (currentIndex > stepIndex || currentStep === 'completed' || (!isProving && currentStep === 'idle')) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-br from-[#12102A] to-[#0F0D24] border border-purple-500/20 rounded-[20px] p-7 shadow-[0_0_50px_rgba(139,92,246,0.08)] relative">
      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg text-white">Compact ZK Proof Pipeline</h3>
        <span className="text-[11px] text-fuchsia-300 font-medium">
          ● 4-stage verification — {isProving ? `Synthesizing (${progressPercent}%)` : 'live'}
        </span>
      </div>

      <div className="mt-8 grid md:grid-cols-4 gap-4 relative">
        {/* Connector Line */}
        <div className="absolute top-[22px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-cyan-500/50 hidden md:block z-0" />

        {steps.map((item, idx) => {
          const status = getStepStatus(item.id);
          const isActive = status === 'active';
          const isDone = status === 'completed';

          return (
            <div key={idx} className="text-center relative z-10">
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_25px_rgba(236,72,153,0.8)] animate-pulse scale-110'
                    : isDone
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                    : 'bg-zinc-800/80 border border-white/10 text-zinc-500'
                }`}
              >
                {isActive ? '⏳' : '✓'}
              </div>
              <p className="text-sm font-bold mt-3 text-white">{item.t}</p>
              <p className="text-[11px] text-zinc-400 mt-1">{item.s}</p>
              <span
                className={`inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                  isActive
                    ? 'bg-pink-500/20 border border-pink-500/40 text-pink-300 animate-pulse'
                    : isDone
                    ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-300'
                    : 'bg-zinc-800 border border-white/5 text-zinc-500'
                }`}
              >
                {isActive ? 'In Progress' : isDone ? 'Completed' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Log Details when generated */}
      {(proofHash || txHash || isProving) && (
        <div className="mt-6 pt-4 border-t border-purple-500/10 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>Status: <strong className="text-purple-300">{statusMessage}</strong></span>
          {proofHash && <span className="truncate">Proof: <strong className="text-pink-400">{proofHash.substring(0, 16)}...</strong></span>}
          {txHash && <span className="truncate">Tx: <strong className="text-cyan-400">{txHash.substring(0, 16)}...</strong></span>}
        </div>
      )}
    </div>
  );
};
