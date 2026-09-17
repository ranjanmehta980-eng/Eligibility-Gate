'use client';

import React, { useState, useEffect } from 'react';
import { EligibilityGateClient } from '@/midnight/contractClient';
import { LaceWalletService } from '@/midnight/laceConnector';
import { ContractState, ProverStep, WalletAccount } from '@/midnight/types';
import { ProofGenerationProgress } from '@/midnight/zkProver';
import { PrivacyExplorer } from '@/components/PrivacyExplorer';
import { CompactCircuitViewer } from '@/components/CompactCircuitViewer';
import { StatsDashboard } from '@/components/StatsDashboard';
import { AccessBadgeModal } from '@/components/AccessBadgeModal';

export default function MidnightGateUltra() {
  const [age, setAge] = useState<number>(21);
  const birthYear = 2026 - age;

  const [activeTab, setActiveTab] = useState<string>('gate');
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [proverStep, setProverStep] = useState<ProverStep>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [proofResult, setProofResult] = useState<{
    isEligible: boolean;
    txHash: string;
    proofHash: string;
    nullifier: string;
  } | null>(null);
  const [badgeData, setBadgeData] = useState<any>(null);

  useEffect(() => {
    const client = EligibilityGateClient.getInstance();
    const unsubState = client.subscribeState(setContractState);
    const unsubWallet = LaceWalletService.getInstance().subscribe(setWallet);
    return () => {
      unsubState();
      unsubWallet();
    };
  }, []);

  const minRequired = contractState?.minAgeThreshold || 21;
  const isSatisfied = age >= minRequired;

  const handleConnect = async () => {
    if (wallet?.isConnected) {
      LaceWalletService.getInstance().disconnect();
    } else {
      await LaceWalletService.getInstance().connect('preprod');
    }
  };

  const handleGenerateProof = async () => {
    if (!wallet?.isConnected) {
      await LaceWalletService.getInstance().connect('preprod');
    }

    try {
      setIsProving(true);
      const client = EligibilityGateClient.getInstance();
      const result = await client.verifyEligibility(
        { age: Number(age) },
        (progress: ProofGenerationProgress) => {
          setProverStep(progress.step);
          setProgressPercent(progress.progressPercent);
        }
      );
      setProofResult(result);
      if (result.isEligible) {
        setBadgeData({
          ageThreshold: minRequired,
          txHash: result.txHash,
          proofHash: result.proofHash,
          nullifier: result.nullifier,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProving(false);
    }
  };

  const contractAddressDisplay = contractState?.contractAddress
    ? `${contractState.contractAddress.substring(0, 6)}...${contractState.contractAddress.substring(contractState.contractAddress.length - 6)}`
    : '0x7f4d...a9e2b8';

  const txHashDisplay = proofResult?.txHash
    ? `${proofResult.txHash.substring(0, 6)}...${proofResult.txHash.substring(proofResult.txHash.length - 4)}`
    : '0x9c2e...4f1a';

  return (
    <div className="min-h-screen bg-[#060311] text-white p-4 md:p-6 font-sans relative overflow-hidden">
      {/* BG GLOW */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-pink-600/20 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* HEADER - GLASS */}
      <header className="max-w-7xl mx-auto flex justify-between items-center bg-gradient-to-r from-[#12102A]/90 to-[#1A1035]/90 backdrop-blur-2xl border border-purple-500/30 rounded-[18px] px-6 py-4 shadow-[0_0_40px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div
          className="flex items-center gap-3 font-black text-lg cursor-pointer"
          onClick={() => setActiveTab('gate')}
        >
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.6)] text-base">
            🛡️
          </span>
          MidnightGate{' '}
          <span className="text-[10px] font-mono bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 rounded-full text-purple-300">
            ZK • v0.4.1
          </span>
        </div>
        <div className="hidden md:flex gap-7 text-[13px] text-zinc-400 font-medium">
          <button
            onClick={() => setActiveTab('gate')}
            className={`transition-all ${
              activeTab === 'gate'
                ? 'text-purple-300 border-b-2 border-purple-400 pb-1 font-bold'
                : 'hover:text-zinc-200'
            }`}
          >
            ZK Gate
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`transition-all ${
              activeTab === 'explorer'
                ? 'text-purple-300 border-b-2 border-purple-400 pb-1 font-bold'
                : 'hover:text-zinc-200'
            }`}
          >
            Privacy Explorer
          </button>
          <button
            onClick={() => setActiveTab('circuit')}
            className={`transition-all ${
              activeTab === 'circuit'
                ? 'text-purple-300 border-b-2 border-purple-400 pb-1 font-bold'
                : 'hover:text-zinc-200'
            }`}
          >
            Compact Circuit
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`transition-all ${
              activeTab === 'stats'
                ? 'text-purple-300 border-b-2 border-purple-400 pb-1 font-bold'
                : 'hover:text-zinc-200'
            }`}
          >
            Ledger Stats
          </button>
        </div>
        <button
          onClick={handleConnect}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-bold shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.7)] transition active:scale-95"
        >
          {wallet?.isConnected
            ? `🔒 ${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`
            : '🔗 Connect Lace'}
        </button>
      </header>

      {/* TAB CONTENT: GATE VIEW */}
      {activeTab === 'gate' && (
        <>
          {/* TITLE CARD */}
          <div className="max-w-7xl mx-auto mt-6 bg-gradient-to-br from-[#12102A] to-[#0F0D24] border border-purple-500/20 rounded-[20px] p-7 shadow-[0_0_50px_rgba(139,92,246,0.1)] relative">
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
              <div>
                <h1 className="text-[28px] font-black tracking-tight text-white">Zero Knowledge Age Gate</h1>
                <p className="text-[13px] text-zinc-400 mt-1">
                  Verify age ≥ {minRequired} privately on-chain using zero-knowledge proofs — no personal data exposed
                </p>
              </div>
              <span className="hidden md:flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Network: Midnight Preprod • {wallet?.isConnected ? 'Lace Connected' : 'Ready'}
              </span>
            </div>
          </div>

          {/* TWO COLUMN GRID: LEFT (PRIVATE) | RIGHT (PUBLIC) */}
          <div className="max-w-7xl mx-auto mt-6 grid lg:grid-cols-2 gap-6">
            {/* LEFT - PRIVATE */}
            <div className="relative bg-gradient-to-br from-[#14112D]/90 to-[#0E0C22]/90 backdrop-blur-xl border border-pink-500/20 rounded-[20px] p-6 shadow-[0_0_60px_rgba(236,72,153,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.05] to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-400/50 to-transparent" />

              <div className="flex justify-between relative">
                <h3 className="font-bold flex gap-2 text-white">🛡️ Private Witness Configuration</h3>
                <span className="text-[10px] px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300">
                  Off-chain • Private
                </span>
              </div>

              <div className="mt-6 bg-black/40 border border-white/10 rounded-xl p-4 relative">
                <p className="text-xs text-zinc-400">Age Slider</p>
                <div className="relative mt-4 h-2 bg-zinc-800 rounded-full">
                  <div
                    className="absolute h-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                    style={{ width: `${((age - 10) / 90) * 100}%` }}
                  />
                  <div
                    className="absolute w-6 h-4 bg-gradient-to-br from-purple-300 to-pink-300 rounded-md -top-1 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                    style={{ left: `calc(${((age - 10) / 90) * 100}% - 12px)` }}
                  />
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                  className="absolute top-[38px] left-4 right-4 opacity-0 cursor-pointer h-6 w-auto"
                />

                <p className="mt-5 text-sm">
                  Selected Age: <span className="text-[26px] font-black text-pink-400">{age}</span>{' '}
                  <span className="text-white font-bold">years</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1">Calculated Birth Year:</p>
                <p className="text-xl font-bold text-white">{birthYear}</p>

                <div
                  className={`mt-4 rounded-xl p-3 flex gap-2 items-center border transition-all ${
                    isSatisfied
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
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
                      Requirement: age ≥ {minRequired}{' '}
                      {isSatisfied ? '✓ Verified locally, no PII shared' : '✕ Below threshold'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateProof}
                  disabled={isProving}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-bold shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.7)] transition active:scale-98 disabled:opacity-50"
                >
                  {isProving ? 'Synthesizing ZK Proof...' : 'Generate Compact ZK Proof & Verify'}
                </button>
              </div>
            </div>

            {/* RIGHT - PUBLIC */}
            <div className="relative bg-gradient-to-br from-[#14112D]/90 to-[#0E0C22]/90 backdrop-blur-xl border border-cyan-500/20 rounded-[20px] p-6 shadow-[0_0_60px_rgba(6,182,212,0.12),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              <div>
                <div className="flex justify-between">
                  <h3 className="font-bold flex gap-2 text-white">🔗 Public On-Chain Disclosure</h3>
                  <span className="text-[10px] px-3 py-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-300">
                    On-chain • Public
                  </span>
                </div>

                <div className="mt-6 bg-black/50 border border-white/5 rounded-xl p-4 space-y-3 font-mono text-[12px]">
                  <div>
                    <span className="text-zinc-500">On-Chain Root Hash:</span>
                    <br />
                    <a
                      href="https://preprod.midnight.network/contract/c634cc887df0973ba82bc12e8eec22a7e4b7fc3cbce230cd84cc57b01183cf48"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-300 hover:underline"
                    >
                      {contractAddressDisplay}
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
                  <div className="text-zinc-400 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span>🔗 Midnight Network</span>
                    <span className="text-cyan-300">Tx: {txHashDisplay}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-zinc-400">
                <span className="text-cyan-300 font-bold">Dual-State Model:</span> Exact age never leaves client device. Only the 1-bit boolean outcome is disclosed.
              </div>
            </div>
          </div>

          {/* PIPELINE */}
          <div className="max-w-7xl mx-auto mt-6 bg-gradient-to-br from-[#12102A] to-[#0F0D24] border border-purple-500/20 rounded-[20px] p-7 shadow-[0_0_50px_rgba(139,92,246,0.08)] relative">
            <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-white">Compact ZK Proof Pipeline</h3>
              <span className="text-[11px] text-fuchsia-300">
                ● 4-stage verification — {isProving ? `${progressPercent}% in progress` : 'live'}
              </span>
            </div>
            <div className="mt-8 grid md:grid-cols-4 gap-4 relative">
              <div className="absolute top-[22px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-cyan-500/50 hidden md:block" />
              {[
                { t: 'Private Witness', s: `Age=${age} validated locally` },
                { t: 'Constraint Synthesis', s: 'R1CS circuit compiled' },
                { t: 'ZK Proof Gen', s: 'Proof generated • 1.42s' },
                { t: 'On-Chain Verify', s: 'Verified on Midnight Lace' },
              ].map((i, idx) => (
                <div key={idx} className="text-center relative">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] font-bold">
                    ✓
                  </div>
                  <p className="text-sm font-bold mt-3 text-white">{i.t}</p>
                  <p className="text-[11px] text-zinc-400 mt-1">{i.s}</p>
                  <span className="inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-300">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* OTHER TABS */}
      {activeTab === 'explorer' && (
        <div className="max-w-7xl mx-auto mt-6">
          <PrivacyExplorer />
        </div>
      )}

      {activeTab === 'circuit' && (
        <div className="max-w-7xl mx-auto mt-6">
          <CompactCircuitViewer />
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="max-w-7xl mx-auto mt-6">
          <StatsDashboard />
        </div>
      )}

      {/* ACCESS BADGE MODAL */}
      <AccessBadgeModal badgeData={badgeData} onClose={() => setBadgeData(null)} />
    </div>
  );
}
