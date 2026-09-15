'use client';

import React, { useState, useEffect } from 'react';
import { EligibilityGateClient } from '@/midnight/contractClient';
import { LaceWalletService } from '@/midnight/laceConnector';
import { ContractState, ProverStep, WalletAccount } from '@/midnight/types';
import { ProofGenerationProgress } from '@/midnight/zkProver';
import { ZKProofStepper } from './ZKProofStepper';
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Key, 
  Calendar,
  Zap,
  Fingerprint
} from 'lucide-react';

interface EligibilityGateProps {
  onSuccessBadge?: (details: any) => void;
}

export const EligibilityGate: React.FC<EligibilityGateProps> = ({ onSuccessBadge }) => {
  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [ageInput, setAgeInput] = useState<number>(21);
  const [birthYearInput, setBirthYearInput] = useState<number>(2003);
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

  const handleAgeChange = (val: number) => {
    setAgeInput(val);
    const calculatedYear = new Date().getFullYear() - val;
    setBirthYearInput(calculatedYear);
    setProofResult(null);
    setErrorMessage(null);
  };

  const handleYearChange = (year: number) => {
    setBirthYearInput(year);
    const calculatedAge = new Date().getFullYear() - year;
    setAgeInput(calculatedAge);
    setProofResult(null);
    setErrorMessage(null);
  };

  const currentYear = new Date().getFullYear();
  const minRequired = contractState?.minAgeThreshold || 18;
  const isHypotheticallyEligible = ageInput >= minRequired;

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
          age: ageInput,
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

  return (
    <div className="w-full space-y-6">
      
      {/* Top Banner / Gate Status */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        {/* Accent gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold badge-zk flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Proof Circuit</span>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                contractState?.gateActive ? 'badge-private' : 'bg-rose-950/30 text-rose-400 border border-rose-500/25'
              }`}>
                {contractState?.gateActive ? '● Active' : '○ Paused'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              <span className="gradient-text">Verifiable Age & Eligibility Gate</span>
            </h2>
            <p className="text-sm text-purple-200/50 max-w-2xl leading-relaxed">
              Prove you meet the required threshold <span className="font-semibold text-purple-300/80">({minRequired}+ years)</span> using a client-side Compact witness. Your exact age is cryptographically shielded.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-midnight-900/60 p-4 rounded-xl border border-purple-900/20">
            <div className="text-right">
              <p className="text-[11px] text-purple-300/50 font-medium">On-Chain Requirement</p>
              <p className="text-xl font-bold font-mono gradient-text">&gt;= {minRequired} Years</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Form & Privacy Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Private Witness Inputs */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-900/15 pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Private Witness Configuration</span>
              </h3>
              <p className="text-xs text-emerald-400/60 font-medium mt-0.5">
                Evaluated strictly inside your device's browser memory
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold badge-private tracking-wider">
              STAYS LOCAL
            </span>
          </div>

          {/* Age Slider & Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-purple-200/80 flex items-center space-x-2">
                <span>Claimed Age</span>
                <span className="text-xs font-normal text-purple-400/40">(Private attribute)</span>
              </label>
              <span className="text-2xl font-bold font-mono gradient-text px-3 py-1">
                {ageInput} <span className="text-xs text-purple-300/60 font-normal">years</span>
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={ageInput}
              aria-label="Private age witness slider"
              title="Drag to simulate different confidential age values"
              onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] font-mono text-purple-400/40">
              <span>10 yrs</span>
              <span className="text-purple-400/70 font-semibold">Min Gate: {minRequired} yrs</span>
              <span>100 yrs</span>
            </div>
          </div>

          {/* Birth Year & Salt Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-midnight-950/60 border border-purple-900/15 space-y-2">
              <label className="text-xs font-medium text-purple-300/60 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400/60" />
                <span>Calculated Birth Year</span>
              </label>
              <input
                type="number"
                min="1920"
                max={currentYear}
                value={birthYearInput}
                onChange={(e) => handleYearChange(parseInt(e.target.value) || 2000)}
                className="w-full glass-input px-3 py-2 text-sm font-mono"
              />
              <p className="text-[10px] text-purple-400/35">Private witness attribute</p>
            </div>

            <div className="p-4 rounded-xl bg-midnight-950/60 border border-purple-900/15 space-y-2">
              <label className="text-xs font-medium text-purple-300/60 flex items-center space-x-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-purple-400/60" />
                <span>ZK Salt / Nullifier</span>
              </label>
              <input
                type="text"
                placeholder="Auto-generated..."
                value={customSalt}
                onChange={(e) => setCustomSalt(e.target.value)}
                className="w-full glass-input px-3 py-2 text-sm font-mono placeholder:text-purple-600/40"
              />
              <p className="text-[10px] text-purple-400/35">Prevents address linkability</p>
            </div>
          </div>

          {/* Live Predicate Check */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            isHypotheticallyEligible
              ? 'bg-emerald-950/15 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-950/15 border-rose-500/20 text-rose-300'
          }`}>
            <div className="flex items-center space-x-3">
              {isHypotheticallyEligible ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-rose-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">
                  {isHypotheticallyEligible ? 'Predicate Satisfied' : 'Predicate Not Satisfied'}
                </p>
                <p className="text-xs opacity-70">
                  {isHypotheticallyEligible
                    ? `Input (${ageInput} yrs) >= Threshold (${minRequired} yrs)`
                    : `Input (${ageInput} yrs) < Threshold (${minRequired} yrs)`}
                </p>
              </div>
            </div>
          </div>

          {/* Execution Button */}
          <button
            onClick={handleGenerateProof}
            disabled={isProving || !contractState?.gateActive}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center space-x-2 transition-all ${
              isProving
                ? 'bg-purple-900/30 text-purple-300 border border-purple-500/20 cursor-wait'
                : !contractState?.gateActive
                ? 'bg-midnight-900/60 text-purple-500/40 cursor-not-allowed border border-purple-900/15'
                : 'glow-btn text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>{isProving ? 'Synthesizing ZK Proof...' : 'Generate Compact ZK Proof & Verify'}</span>
          </button>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: Public Disclosure & Privacy Inspector */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/15 pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-white flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <span>Public On-Chain Disclosure</span>
                </h3>
                <p className="text-xs text-cyan-400/50 font-medium mt-0.5">
                  The only data written to Midnight Ledger
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold badge-public tracking-wider">
                ON-CHAIN
              </span>
            </div>

            {/* Privacy Matrix */}
            <div className="space-y-2 text-xs">
              {[
                { label: 'Exact Age / DOB', value: 'Confidential (0 bits leaked)', icon: Lock, color: 'emerald' },
                { label: 'Eligibility Flag', value: `disclose(isEligible) = ${isHypotheticallyEligible ? 'true' : 'false'}`, icon: Globe, color: 'cyan' },
                { label: 'Nullifier / Proof π', value: 'Succinct KZG / PLONK', icon: Key, color: 'purple' },
                { label: 'Public Gate Counter', value: 'totalVerifications (+1)', icon: Zap, color: 'purple' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-midnight-950/50 border border-purple-900/10 flex items-center justify-between group hover:border-purple-500/15 transition-all">
                  <span className="text-purple-300/60">{item.label}</span>
                  <span className={`font-mono font-semibold flex items-center space-x-1.5 ${
                    item.color === 'emerald' ? 'text-emerald-400' : item.color === 'cyan' ? 'text-cyan-400' : 'text-purple-300'
                  }`}>
                    <item.icon className="w-3 h-3" />
                    <span>{item.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Proof Summary Card */}
          {proofResult && (
            <div className={`p-4 rounded-xl border ${
              proofResult.isEligible
                ? 'bg-emerald-950/15 border-emerald-500/25 text-emerald-200'
                : 'bg-rose-950/15 border-rose-500/25 text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {proofResult.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <h4 className="font-display font-bold text-sm">
                  {proofResult.isEligible ? 'Access Gate Granted!' : 'Verification Rejected'}
                </h4>
              </div>
              <p className="text-xs opacity-70 mb-3">
                {proofResult.isEligible
                  ? 'Your ZK proof was verified. An anonymous entry token has been authorized.'
                  : 'The Compact circuit verified your witness is below threshold.'}
              </p>
              <div className="font-mono text-[10px] space-y-1 bg-midnight-950/60 p-2.5 rounded-lg border border-purple-900/15">
                <div className="truncate"><span className="text-purple-400/60">Tx:</span> {proofResult.txHash}</div>
                <div className="truncate"><span className="text-purple-400/60">Nullifier:</span> {proofResult.nullifier}</div>
              </div>
            </div>
          )}

          {/* Quick Info Footer */}
          <div className="p-3 rounded-xl bg-purple-950/15 border border-purple-900/15 text-xs text-purple-300/50 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-400/50 shrink-0" />
            <span>Powered by Midnight Compact DSL with zero-knowledge private witness bindings.</span>
          </div>

        </div>

      </div>

      {/* ZK Pipeline Stepper */}
      <ZKProofStepper
        currentStep={proverStep}
        statusMessage={statusMessage}
        progressPercent={progressPercent}
        proofHash={proofResult?.proofHash}
        txHash={proofResult?.txHash}
      />

    </div>
  );
};
