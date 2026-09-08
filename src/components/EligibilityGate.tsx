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
      // Prompt wallet connect first
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold badge-zk flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Proof Circuit</span>
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                contractState?.gateActive ? 'badge-private' : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
              }`}>
                {contractState?.gateActive ? 'Active Gate' : 'Gate Paused'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Verifiable Age & Eligibility Gate
            </h2>
            <div className="flex items-center space-x-2 pt-0.5">
              <span className="text-xs font-semibold text-purple-300">Midnight Contract ID:</span>
              <span className="font-mono text-xs text-cyan-300 bg-midnight-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                {contractState?.contractAddress || 'mn_contract_eligibility_gate_0x8f2a1b94d7e291c0a85fb32e71d4a96c'}
              </span>
            </div>
            <p className="text-sm text-purple-200/70 max-w-2xl pt-1">
              Prove you meet the required threshold <span className="font-semibold text-purple-300">({minRequired}+ years)</span> using a client-side Compact witness. Your exact age and birth year are cryptographically shielded and never submitted to the blockchain.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-midnight-900/80 p-4 rounded-xl border border-purple-900/40">
            <div className="text-right">
              <p className="text-[11px] text-purple-300/60 font-medium">On-Chain Requirement</p>
              <p className="text-xl font-bold font-mono text-cyan-400">&gt;= {minRequired} Years</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Form & Privacy Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Private Witness Inputs */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Private Witness Configuration</span>
              </h3>
              <p className="text-xs text-emerald-400/80 font-medium mt-0.5">
                Evaluated strictly inside your device's browser memory sandbox
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono badge-private">
              STAYS LOCAL
            </span>
          </div>

          {/* Age Slider & Inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-purple-200 flex items-center space-x-2">
                <span>Claimed Age</span>
                <span className="text-xs font-normal text-purple-400/60">(Simulated private attribute)</span>
              </label>
              <span className="text-xl font-bold font-mono text-purple-100 bg-purple-950/60 px-3 py-1 rounded-lg border border-purple-800/50">
                {ageInput} <span className="text-xs text-purple-300">years</span>
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={ageInput}
              onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
              className="w-full h-2 bg-midnight-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-purple-400/50">
              <span>10 yrs</span>
              <span className="text-cyan-400 font-semibold">Min Gate: {minRequired} yrs</span>
              <span>100 yrs</span>
            </div>
          </div>

          {/* Corresponding Birth Year Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-purple-900/40 space-y-1.5">
              <label className="text-xs font-medium text-purple-300/80 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Calculated Birth Year</span>
              </label>
              <input
                type="number"
                min="1920"
                max={currentYear}
                value={birthYearInput}
                onChange={(e) => handleYearChange(parseInt(e.target.value) || 2000)}
                className="w-full glass-input px-3 py-1.5 rounded-lg text-sm font-mono"
              />
              <p className="text-[10px] text-purple-400/50">Private witness attribute</p>
            </div>

            <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-purple-900/40 space-y-1.5">
              <label className="text-xs font-medium text-purple-300/80 flex items-center space-x-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero-Knowledge Salt / Nullifier</span>
              </label>
              <input
                type="text"
                placeholder="Auto-generated cryptographic salt..."
                value={customSalt}
                onChange={(e) => setCustomSalt(e.target.value)}
                className="w-full glass-input px-3 py-1.5 rounded-lg text-sm font-mono placeholder:text-purple-600"
              />
              <p className="text-[10px] text-purple-400/50">Prevents address linkability</p>
            </div>
          </div>

          {/* Client-side Live Predicate Check */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isHypotheticallyEligible
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center space-x-3">
              {isHypotheticallyEligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  {isHypotheticallyEligible ? 'Predicate Satisfied' : 'Predicate Not Satisfied'}
                </p>
                <p className="text-xs opacity-80">
                  {isHypotheticallyEligible
                    ? `Input (${ageInput} yrs) >= Threshold (${minRequired} yrs). ZK proof will verify successfully.`
                    : `Input (${ageInput} yrs) < Threshold (${minRequired} yrs). Compact circuit will evaluate to false.`}
                </p>
              </div>
            </div>
          </div>

          {/* Execution Button */}
          <button
            onClick={handleGenerateProof}
            disabled={isProving || !contractState?.gateActive}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide shadow-xl flex items-center justify-center space-x-2 transition-all ${
              isProving
                ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-wait'
                : !contractState?.gateActive
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white hover:shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>{isProving ? 'Synthesizing ZK Proof...' : 'Generate Compact ZK Proof & Verify'}</span>
          </button>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: Public Disclosure & Privacy Inspector */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <span>Public On-Chain Disclosure</span>
                </h3>
                <p className="text-xs text-cyan-400/80 font-medium mt-0.5">
                  The only data written to Midnight Ledger
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono badge-public">
                ON-CHAIN
              </span>
            </div>

            {/* Privacy Matrix Table */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-midnight-950/80 border border-purple-900/30 flex items-center justify-between">
                <span className="text-purple-300/80">Exact Age / DOB</span>
                <span className="font-mono text-emerald-400 font-semibold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Confidential (0 bits leaked)</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-midnight-950/80 border border-purple-900/30 flex items-center justify-between">
                <span className="text-purple-300/80">Eligibility Flag (`isEligible`)</span>
                <span className="font-mono text-cyan-400 font-semibold flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>disclose(isEligible) = {isHypotheticallyEligible ? 'true' : 'false'}</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-midnight-950/80 border border-purple-900/30 flex items-center justify-between">
                <span className="text-purple-300/80">Nullifier / Proof $\pi$</span>
                <span className="font-mono text-purple-300 font-semibold">
                  Succinct KZG / PLONK
                </span>
              </div>

              <div className="p-3 rounded-xl bg-midnight-950/80 border border-purple-900/30 flex items-center justify-between">
                <span className="text-purple-300/80">Public Gate Counter</span>
                <span className="font-mono text-purple-300 font-semibold">
                  totalVerifications (+1 if true)
                </span>
              </div>
            </div>
          </div>

          {/* Proof Summary Card if generated */}
          {proofResult && (
            <div className={`p-4 rounded-xl border ${
              proofResult.isEligible
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {proofResult.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <h4 className="font-bold text-sm">
                  {proofResult.isEligible ? 'Access Gate Granted!' : 'Verification Rejected'}
                </h4>
              </div>
              <p className="text-xs opacity-80 mb-3">
                {proofResult.isEligible
                  ? 'Your zero-knowledge proof was verified by the Midnight contract. An anonymous entry token has been authorized.'
                  : 'The Compact circuit verified your witness is below the required threshold.'}
              </p>
              <div className="font-mono text-[10px] space-y-1 bg-midnight-950/80 p-2.5 rounded-lg border border-purple-900/40">
                <div className="truncate"><span className="text-purple-400">Tx:</span> {proofResult.txHash}</div>
                <div className="truncate"><span className="text-purple-400">Nullifier:</span> {proofResult.nullifier}</div>
              </div>
            </div>
          )}

          {/* Quick Info Footer */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 text-xs text-purple-300/70 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Powered by Midnight Compact DSL with zero-knowledge private witness bindings.</span>
          </div>

        </div>

      </div>

      {/* ZK Pipeline Stepper Visualization (always active or updates live) */}
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
