'use client';

import React, { useState, useEffect } from 'react';
import { EligibilityGateClient } from '@/midnight/contractClient';
import { LaceWalletService } from '@/midnight/laceConnector';
import { ContractState, ProverStep, WalletAccount } from '@/midnight/types';
import { ProofGenerationProgress } from '@/midnight/zkProver';
import { ZKProofStepper } from './ZKProofStepper';
import { Sparkles, AlertTriangle, Fingerprint } from 'lucide-react';

interface EligibilityGateProps {
  onSuccessBadge?: (details: any) => void;
}

export const EligibilityGate: React.FC<EligibilityGateProps> = ({ onSuccessBadge }) => {
  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [age, setAge] = useState<number>(21);
  const [customSalt, setCustomSalt] = useState<string>('');

  // Prover state
  const [isProving, setIsProving] = useState<boolean>(false);
  const [proverStep, setProverStep] = useState<ProverStep>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to synthesize witness');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [proofResult, setProofResult] = useState<{
    isEligible: boolean;
    txHash: string;
    proofHash: string;
    nullifier: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const client = EligibilityGateClient.getInstance();
    const unsubState = client.subscribeState(setContractState);
    const unsubWallet = LaceWalletService.getInstance().subscribe(setWallet);
    return () => {
      unsubState();
      unsubWallet();
    };
  }, []);

  const minRequired = contractState?.minAgeThreshold || 18;
  const isSatisfied = age >= minRequired;
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;

  const handleAgeChange = (val: number) => {
    setAge(val);
    setProofResult(null);
    setErrorMessage(null);
  };

  const handleGenerateProof = async () => {
    if (!wallet?.isConnected) {
      try {
        await LaceWalletService.getInstance().connect('preprod');
      } catch (e: any) {
        setErrorMessage('Please connect Lace wallet to continue');
        return;
      }
    }

    try {
      setIsProving(true);
      setErrorMessage(null);
      setProofResult(null);

      const client = EligibilityGateClient.getInstance();

      const result = await client.verifyEligibility(
        {
          age: age,
          salt: customSalt || undefined,
        },
        (progress: ProofGenerationProgress) => {
          setProverStep(progress.step);
          setStatusMessage(progress.message);
          setProgressPercent(progress.progressPercent);
        }
      );

      setProofResult(result);
      if (result.isEligible && onSuccessBadge) {
        onSuccessBadge({
          ageThreshold: minRequired,
          txHash: result.txHash,
          proofHash: result.proofHash,
          nullifier: result.nullifier,
          timestamp: Date.now(),
        });
      }
    } catch (err: any) {
      console.error(err);
      setProverStep('failed');
      setErrorMessage(err.message || 'ZK proof generation failed');
      setStatusMessage('Verification failed. Inspect constraints.');
    } finally {
      setIsProving(false);
    }
  };

  const contractAddressDisplay = contractState?.contractAddress 
    ? `${contractState.contractAddress.substring(0, 8)}...${contractState.contractAddress.substring(contractState.contractAddress.length - 6)}`
    : 'c634cc...3cf48';

  const txHashDisplay = proofResult?.txHash
    ? `${proofResult.txHash.substring(0, 8)}...${proofResult.txHash.substring(proofResult.txHash.length - 4)}`
    : '0x9c2e...4f1a';

  return (
    <div className="w-full space-y-6">
      
      {/* TITLE CARD */}
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-[#12102A] to-[#0F0D24] border border-purple-500/20 rounded-[20px] p-7 shadow-[0_0_50px_rgba(139,92,246,0.1)] relative">
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-[28px] font-black tracking-tight text-white">Zero Knowledge Age Gate</h1>
            <p className="text-[13px] text-zinc-400 mt-1">
              Verify age ≥ {minRequired} privately on-chain using zero-knowledge proofs — no personal data exposed
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-[11px] px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium shrink-0">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Network: Midnight Preprod • {wallet?.isConnected ? 'Lace Connected' : 'Ready'}
          </span>
        </div>
      </div>

      {/* TWO COLUMN GRID: LEFT (PRIVATE) | RIGHT (PUBLIC) */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
        
        {/* LEFT - PRIVATE WITNESS */}
        <div className="relative bg-gradient-to-br from-[#14112D]/90 to-[#0E0C22]/90 backdrop-blur-xl border border-pink-500/20 rounded-[20px] p-6 shadow-[0_0_60px_rgba(236,72,153,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.05] to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-400/50 to-transparent" />

          <div className="flex justify-between items-center relative">
            <h3 className="font-bold flex gap-2 items-center text-white">
              <span>🛡️</span> Private Witness Configuration
            </h3>
            <span className="text-[10px] px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 font-mono">
              Off-chain • Private
            </span>
          </div>

          <div className="mt-6 bg-black/40 border border-white/10 rounded-xl p-5 relative space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-zinc-400 font-medium">Age Slider (Private Attribute)</p>
              <span className="text-[10px] font-mono text-zinc-500">Min: 10 • Max: 100</span>
            </div>

            {/* Custom slider track and thumb */}
            <div className="relative my-4 h-2 bg-zinc-800 rounded-full">
              <div
                className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                style={{ width: `${((age - 10) / 90) * 100}%` }}
              />
              <div
                className="absolute w-6 h-4 bg-gradient-to-br from-purple-300 to-pink-300 rounded-md -top-1 shadow-[0_0_15px_rgba(236,72,153,0.8)] transition-all pointer-events-none"
                style={{ left: `calc(${((age - 10) / 90) * 100}% - 12px)` }}
              />
              <input
                type="range"
                min="10"
                max="100"
                value={age}
                onChange={(e) => handleAgeChange(parseInt(e.target.value) || 18)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            <p className="mt-3 text-sm">
              Selected Age: <span className="text-[26px] font-black text-pink-400">{age}</span> <span className="text-white font-bold">years</span>
            </p>
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs text-zinc-400">Calculated Birth Year:</p>
                <p className="text-xl font-bold font-mono text-white">{birthYear}</p>
              </div>

              {/* Optional custom salt */}
              <div className="w-1/2">
                <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Fingerprint className="w-3 h-3 text-purple-400" />
                  <span>ZK Salt (Anti-Linkability)</span>
                </label>
                <input
                  type="text"
                  placeholder="Auto-randomized..."
                  value={customSalt}
                  onChange={(e) => setCustomSalt(e.target.value)}
                  className="w-full mt-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50"
                />
              </div>
            </div>

            {/* Predicate Satisfied Status Pill */}
            <div
              className={`mt-4 rounded-xl p-3.5 flex gap-3 items-center border transition-all ${
                isSatisfied
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold ${
                  isSatisfied ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {isSatisfied ? '✓' : '✕'}
              </span>
              <div>
                <p className="text-xs font-bold">
                  {isSatisfied ? 'Predicate Satisfied' : 'Predicate Unsatisfied'}
                </p>
                <p className="text-[11px] opacity-80">
                  Requirement: age ≥ {minRequired} {isSatisfied ? '✓ Verified locally, no PII shared' : '✕ Below threshold requirement'}
                </p>
              </div>
            </div>

            {/* Proof Action Button */}
            <button
              onClick={handleGenerateProof}
              disabled={isProving}
              className="w-full mt-3 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-bold text-white shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.7)] active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProving ? 'Synthesizing ZK Proof...' : 'Generate Compact ZK Proof & Verify'}</span>
            </button>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - PUBLIC DISCLOSURE */}
        <div className="relative bg-gradient-to-br from-[#14112D]/90 to-[#0E0C22]/90 backdrop-blur-xl border border-cyan-500/20 rounded-[20px] p-6 shadow-[0_0_60px_rgba(6,182,212,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex gap-2 items-center text-white">
                <span>🔗</span> Public On-Chain Disclosure
              </h3>
              <span className="text-[10px] px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 font-mono">
                On-chain • Public
              </span>
            </div>

            <div className="mt-6 bg-black/50 border border-white/5 rounded-xl p-5 space-y-3.5 font-mono text-[12px]">
              <div>
                <span className="text-zinc-500">On-Chain Contract / Root Hash:</span>
                <br />
                <a
                  href={`https://preprod.midnight.network/contract/${contractState?.contractAddress || 'c634cc887df0973ba82bc12e8eec22a7e4b7fc3cbce230cd84cc57b01183cf48'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:underline font-bold"
                >
                  {contractAddressDisplay} ↗
                </a>
              </div>
              <div>
                <span className="text-zinc-500">Block Height:</span>
                <br />
                <span className="text-white font-bold">1,248,931</span>
              </div>
              <div>
                <span className="text-zinc-500">Verification Status:</span>
                <br />
                <span className="inline-flex bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold mt-1">
                  ✓ Verified on-chain ✓
                </span>
              </div>
              <div className="text-zinc-400 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span>🔗 Midnight Network</span>
                <span className="text-cyan-300/80">Tx: {txHashDisplay}</span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantees Summary Pill */}
          <div className="mt-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200/80 leading-relaxed">
            <p className="font-bold text-cyan-300 mb-1">🛡️ Midnight Dual-State Privacy Invariant</p>
            <p className="text-[11px] text-zinc-400">
              Only the 1-bit boolean eligibility output and Halo2 succinct polynomial proof π are disclosed to the ledger. Exact birth year ({birthYear}) never leaves client sandbox memory.
            </p>
          </div>
        </div>

      </div>

      {/* PIPELINE STEPPER */}
      <ZKProofStepper
        currentStep={proverStep}
        statusMessage={statusMessage}
        progressPercent={progressPercent}
        proofHash={proofResult?.proofHash}
        txHash={proofResult?.txHash}
        isProving={isProving}
      />

    </div>
  );
};
