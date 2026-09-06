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
      title: 'Private Witness Sandbox',
      desc: 'Local Ingestion (Never leaves browser)',
      icon: KeyRound,
    },
    {
      id: 'synthesizing-constraints',
      title: 'Constraint Synthesis',
      desc: 'Halo2 / R1CS PLONK Arithmetization',
      icon: Cpu,
    },
    {
      id: 'generating-zk-proof',
      title: 'Zero-Knowledge Proof',
      desc: 'KZG Polynomial Commitments',
      icon: Sparkles,
    },
    {
      id: 'verifying-on-chain',
      title: 'Midnight Preprod Settlement',
      desc: 'On-chain SNARK Verification',
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
      {/* Background glow orb */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-purple-100 flex items-center space-x-2">
            <span>Compact ZK Proof Pipeline</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-950/80 border border-purple-500/40 text-purple-300">
              Halo2 / PLONK
            </span>
          </h3>
          <p className="text-xs text-purple-300/60">Live execution of client-side witness & proof generation</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-purple-300">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-midnight-950 rounded-full overflow-hidden mb-6 border border-purple-900/40">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border transition-all ${
                status === 'active'
                  ? 'bg-purple-900/30 border-purple-400 shadow-md shadow-purple-950/60 scale-[1.02]'
                  : status === 'completed'
                  ? 'bg-purple-950/30 border-emerald-500/30'
                  : 'bg-midnight-900/40 border-purple-950/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    status === 'active'
                      ? 'bg-purple-500 text-white animate-pulse'
                      : status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-purple-950 text-purple-400'
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
                <span className="text-[10px] font-mono text-purple-400/60">0{idx + 1}</span>
              </div>

              <h4 className="text-xs font-semibold text-purple-100">{step.title}</h4>
              <p className="text-[11px] text-purple-300/60 mt-0.5">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Realtime Status Log */}
      <div className="p-3 rounded-xl bg-midnight-950/90 border border-purple-900/40 font-mono text-xs text-purple-300 flex items-start space-x-2.5">
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
          <p className="text-purple-200 font-medium">{statusMessage}</p>
          {proofHash && (
            <p className="text-[11px] text-purple-400/70 truncate mt-1">
              <span className="text-purple-400">Proof Hash:</span> {proofHash}
            </p>
          )}
          {txHash && (
            <p className="text-[11px] text-purple-400/70 truncate">
              <span className="text-purple-400">Tx Hash:</span> {txHash}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
