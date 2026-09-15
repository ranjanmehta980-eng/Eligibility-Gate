'use client';

import React from 'react';
import { ProverStep } from '@/midnight/types';
import { ShieldCheck, Cpu, KeyRound, CheckCircle, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface ZKProofStepperProps {
  currentStep: ProverStep;
  statusMessage: string;
  progressPercent: number;
  proofHash?: string;
  txHash?: string;
}

export const ZKProofStepper: React.FC<ZKProofStepperProps> = ({
  currentStep,
  statusMessage,
  progressPercent,
  proofHash,
  txHash,
}) => {
  const steps = [
    {
      id: 'loading-witness',
      title: 'Private Witness',
      desc: 'Local Ingestion',
      icon: KeyRound,
    },
    {
      id: 'synthesizing-constraints',
      title: 'Constraint Synthesis',
      desc: 'Halo2 / PLONK',
      icon: Cpu,
    },
    {
      id: 'generating-zk-proof',
      title: 'ZK Proof Gen',
      desc: 'KZG Commitments',
      icon: Sparkles,
    },
    {
      id: 'verifying-on-chain',
      title: 'On-Chain Verify',
      desc: 'SNARK Settlement',
      icon: ShieldCheck,
    },
  ];

  const getStepStatus = (stepId: string) => {
    const order = ['loading-witness', 'synthesizing-constraints', 'generating-zk-proof', 'verifying-on-chain', 'completed'];
    const currentIndex = order.indexOf(currentStep);
    const stepIndex = order.indexOf(stepId);

    if (currentStep === 'failed') return 'failed';
    if (currentIndex > stepIndex || currentStep === 'completed') return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full glass-panel-glow rounded-2xl p-6 relative overflow-hidden">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-display font-bold text-purple-100 flex items-center space-x-2">
            <span>Compact ZK Proof Pipeline</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-500/10 border border-purple-500/20 text-purple-300/70">
              Halo2 / PLONK
            </span>
          </h3>
          <p className="text-xs text-purple-300/40 mt-0.5">Live execution of client-side witness & proof generation</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-mono font-bold gradient-text">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress Bar with Shimmer */}
      <div className="w-full h-1.5 bg-midnight-950/60 rounded-full overflow-hidden mb-6 border border-purple-900/15">
        <div className="h-full relative rounded-full overflow-hidden" style={{ width: `${progressPercent}%` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400" />
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>

      {/* Steps Grid with Connecting Lines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 relative">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all relative ${
                status === 'active'
                  ? 'bg-purple-900/20 border-purple-400/40 shadow-glow-purple scale-[1.02]'
                  : status === 'completed'
                  ? 'bg-midnight-900/40 border-emerald-500/20'
                  : 'bg-midnight-900/30 border-purple-950/30 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    status === 'active'
                      ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-glow-purple'
                      : status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-midnight-950/60 text-purple-400/50'
                  }`}
                >
                  {status === 'active' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-purple-400/30 font-semibold">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>

              <h4 className="text-xs font-display font-semibold text-purple-100/90">{step.title}</h4>
              <p className="text-[11px] text-purple-300/40 mt-0.5">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Status Log */}
      <div className="p-3.5 rounded-xl bg-midnight-950/70 border border-purple-900/10 font-mono text-xs text-purple-300/70 flex items-start space-x-2.5">
        <div className="mt-0.5">
          {currentStep === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : currentStep === 'failed' ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-purple-200/80 font-medium">{statusMessage}</p>
          {proofHash && (
            <p className="text-[11px] text-purple-400/40 truncate mt-1">
              <span className="text-purple-400/50">Proof:</span> {proofHash}
            </p>
          )}
          {txHash && (
            <p className="text-[11px] text-purple-400/40 truncate">
              <span className="text-purple-400/50">Tx:</span> {txHash}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
