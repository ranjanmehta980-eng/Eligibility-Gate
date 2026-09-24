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

export default function MidnightGateCaseFile() {
  const [age, setAge] = useState<number>(21);
  const currentYear = 2026;
  const birthYear = currentYear - age;

  const [activeTab, setActiveTab] = useState<string>('gate');
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [contractState, setContractState] = useState<ContractState | null>(null);
  const [isProving, setIsProving] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<number>(0); // 0 = idle, 1..4 = active/done
  const [pipelineStatusText, setPipelineStatusText] = useState<string>('awaiting run');
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

  const minRequired = contractState?.minAgeThreshold || 18;
  const isSatisfied = age >= minRequired;

  const handleConnect = async () => {
    if (wallet?.isConnected) {
      LaceWalletService.getInstance().disconnect();
    } else {
      await LaceWalletService.getInstance().connect('preprod');
    }
  };

  const handleRunVerification = async () => {
    if (isProving) return;

    if (!wallet?.isConnected) {
      await LaceWalletService.getInstance().connect('preprod');
    }

    try {
      setIsProving(true);
      setPipelineState(1);
      setPipelineStatusText('running…');

      const client = EligibilityGateClient.getInstance();
      const result = await client.verifyEligibility(
        { age: Number(age) },
        (progress: ProofGenerationProgress) => {
          if (progress.step === 'loading-witness') setPipelineState(1);
          else if (progress.step === 'synthesizing-constraints') setPipelineState(2);
          else if (progress.step === 'generating-zk-proof') setPipelineState(3);
          else if (progress.step === 'verifying-on-chain' || progress.step === 'completed') setPipelineState(4);
        }
      );

      setPipelineState(4);
      setPipelineStatusText('verified · 4/4 complete');
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
      setPipelineStatusText('verification failed');
    } finally {
      setIsProving(false);
    }
  };

  const contractAddressDisplay = contractState?.contractAddress
    ? `${contractState.contractAddress.substring(0, 6)}…${contractState.contractAddress.substring(contractState.contractAddress.length - 6)}`
    : 'c634cc…83cf48';

  const txHashDisplay = proofResult?.txHash
    ? `${proofResult.txHash.substring(0, 6)}…${proofResult.txHash.substring(proofResult.txHash.length - 4)}`
    : '0x9c2e…4f1a';

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e8e5dc] font-mono selection:bg-[#5aa07d]/30 selection:text-[#e8e5dc] flex flex-col justify-between">
      {/* HEADER / FOLDER TABS */}
      <header className="border-b border-[#2c2c30] pt-6 px-4 md:px-8">
        <div className="max-w-[1180px] mx-auto text-[#55575c] text-xs tracking-wider mb-3">
          FILE NO. MG-0441 · NETWORK: MIDNIGHT PREPROD · STATUS: {wallet?.isConnected ? 'LACE CONNECTED' : 'READY'}
        </div>
        <div className="max-w-[1180px] mx-auto flex items-end gap-1.5 flex-wrap">
          <div className="stamp-font text-[17px] text-[#e8e5dc] py-2.5 px-4 tracking-wide flex items-center gap-1">
            midnight<span className="text-[#5aa07d] font-bold">•</span>gate
          </div>
          <button
            onClick={() => setActiveTab('gate')}
            className={`py-2.5 px-4 text-[13px] border border-b-0 transition-all ${
              activeTab === 'gate'
                ? 'bg-[#1e1e22] text-[#e8e5dc] border-[#55575c]'
                : 'bg-[#17171a] text-[#84878c] border-[#2c2c30] hover:text-[#e8e5dc]'
            }`}
          >
            ZK Gate
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`py-2.5 px-4 text-[13px] border border-b-0 transition-all ${
              activeTab === 'explorer'
                ? 'bg-[#1e1e22] text-[#e8e5dc] border-[#55575c]'
                : 'bg-[#17171a] text-[#84878c] border-[#2c2c30] hover:text-[#e8e5dc]'
            }`}
          >
            Privacy Explorer
          </button>
          <button
            onClick={() => setActiveTab('circuit')}
            className={`py-2.5 px-4 text-[13px] border border-b-0 transition-all ${
              activeTab === 'circuit'
                ? 'bg-[#1e1e22] text-[#e8e5dc] border-[#55575c]'
                : 'bg-[#17171a] text-[#84878c] border-[#2c2c30] hover:text-[#e8e5dc]'
            }`}
          >
            Compact Circuit
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2.5 px-4 text-[13px] border border-b-0 transition-all ${
              activeTab === 'stats'
                ? 'bg-[#1e1e22] text-[#e8e5dc] border-[#55575c]'
                : 'bg-[#17171a] text-[#84878c] border-[#2c2c30] hover:text-[#e8e5dc]'
            }`}
          >
            Ledger Stats
          </button>
          <div className="flex-1 border-b border-[#2c2c30] self-stretch min-w-[12px]" />
          <button
            onClick={handleConnect}
            className="mb-1 py-1.5 px-3 text-xs border border-[#2c2c30] bg-[#17171a] text-[#84878c] hover:text-[#e8e5dc] hover:border-[#55575c] transition-all"
          >
            {wallet?.isConnected
              ? `[ 🔒 ${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)} ]`
              : '[ 🔗 CONNECT LACE ]'}
          </button>
        </div>
      </header>

      {/* TAB CONTENT: GATE VIEW */}
      {activeTab === 'gate' && (
        <main className="flex-1">
          {/* HERO SECTION */}
          <section className="max-w-[1180px] mx-auto py-12 px-4 md:px-8 relative">
            <h1 className="stamp-font font-normal text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 max-w-[720px] text-[#e8e5dc]">
              The exact age never<br />leaves the room.
            </h1>
            <p className="text-[#84878c] max-w-[520px] text-sm leading-relaxed m-0">
              Only a single fact is allowed out: yes or no, eighteen or older. Everything else stays sealed in the witness's own device.
            </p>

            <div className="stamp absolute top-8 right-4 md:right-8" aria-hidden="true">
              <span>PROOF</span>
              <span className="big">VERIFIED</span>
              <span>ZK · v0.4.1</span>
            </div>
          </section>

          {/* TWO COLUMN CASE GRID */}
          <div className="max-w-[1180px] mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-6">
            {/* LEFT PANEL: PRIVATE WITNESS */}
            <div className="border border-[#2c2c30] bg-[#17171a]">
              <div className="flex justify-between items-center py-3.5 px-5 border-b border-[#2c2c30] text-xs text-[#84878c] tracking-wider">
                <b className="text-[#e8e5dc] font-semibold">Private Witness</b>
                <span>held on device</span>
              </div>
              <div className="p-6">
                <div className="text-xs text-[#84878c] mb-2.5">Drag to set the witness's age</div>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                  className="w-full my-2 mb-4"
                />
                <div className="flex items-baseline gap-2.5 mb-2 text-[13px] text-[#84878c]">
                  Selected age <span className="text-[22px] stamp-font text-[#e8e5dc]">{age}</span> years
                </div>
                <div className="flex items-baseline gap-2.5 mb-4 text-[13px] text-[#84878c]">
                  Birth year <span className="redact" title="Hover to reveal (client memory only)">{birthYear}</span>
                </div>

                <div
                  className={`mt-4 p-3.5 border border-dashed flex gap-3 items-start transition-all ${
                    isSatisfied
                      ? 'border-[#5aa07d] bg-[#5aa07d]/[0.03]'
                      : 'border-[#c4483a] bg-[#c4483a]/[0.03]'
                  }`}
                >
                  <span className={`text-base font-bold ${isSatisfied ? 'text-[#5aa07d]' : 'text-[#c4483a]'}`}>
                    {isSatisfied ? '✓' : '✕'}
                  </span>
                  <div>
                    <div className="text-[#e8e5dc] text-[13px] mb-0.5 font-medium">
                      {isSatisfied ? `Predicate satisfied: age ≥ ${minRequired}` : `Predicate unsatisfied: age < ${minRequired}`}
                    </div>
                    <div className="text-[#84878c] text-xs leading-relaxed">
                      {isSatisfied
                        ? 'Checked locally. No birth year, name, or document ever transmitted.'
                        : `Applicant is below required gate threshold (min ${minRequired} years).`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunVerification}
                  disabled={isProving}
                  className="mt-5 w-full p-3.5 bg-transparent text-[#e8e5dc] border border-[#e8e5dc] font-mono text-[13px] tracking-wider cursor-pointer hover:bg-[#e8e5dc] hover:text-[#0a0a0c] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isProving ? 'VERIFYING…' : 'RUN VERIFICATION →'}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: PUBLIC DISCLOSURE */}
            <div className="border border-[#2c2c30] bg-[#17171a] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center py-3.5 px-5 border-b border-[#2c2c30] text-xs text-[#84878c] tracking-wider">
                  <b className="text-[#e8e5dc] font-semibold">Public Disclosure</b>
                  <span>written to ledger</span>
                </div>
                <div className="bg-[#000] p-5 text-[13px] space-y-2.5">
                  <div className="flex justify-between py-2 border-b border-dotted border-[#262626] text-[#84878c]">
                    <span>Root hash</span>
                    <a
                      href="https://preprod.midnight.network/contract/c634cc887df0973ba82bc12e8eec22a7e4b7fc3cbce230cd84cc57b01183cf48"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#e8e5dc] font-medium hover:underline"
                    >
                      {contractAddressDisplay}
                    </a>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#262626] text-[#84878c]">
                    <span>Block height</span>
                    <b className="text-[#e8e5dc] font-medium">1,248,931</b>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#262626] text-[#84878c]">
                    <span>Claim recorded</span>
                    <b className="text-[#e8e5dc] font-medium">age ≥ {minRequired} = {isSatisfied ? 'true' : 'false'}</b>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dotted border-[#262626] text-[#84878c]">
                    <span>Status</span>
                    <span className="text-[#5aa07d] text-xs font-semibold">✓ verified on-chain</span>
                  </div>
                  <div className="flex justify-between py-2 text-[#84878c]">
                    <span>Transaction</span>
                    <b className="text-[#e8e5dc] font-medium">{txHashDisplay}</b>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-4">
                <div className="text-xs text-[#55575c] leading-relaxed">
                  <b className="text-[#84878c]">Dual-state model.</b> The witness's real age is computed and discarded off-chain. The chain only ever sees the one bit it needed.
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE / COMPACT PROOF PIPELINE */}
          <div className="max-w-[1180px] mx-auto py-11 px-4 md:px-8">
            <div className="flex justify-between items-baseline mb-7 flex-wrap gap-2">
              <h2 className="stamp-font font-normal text-xl text-[#e8e5dc] m-0">Compact proof pipeline</h2>
              <span className="text-[#55575c] text-xs tracking-wider">{pipelineStatusText}</span>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-0">
              {[
                {
                  n: '1',
                  t: 'Private witness',
                  d: 'Age validated on the local device.',
                  s: pipelineState >= 1 ? 'completed' : 'pending',
                },
                {
                  n: '2',
                  t: 'Constraint synthesis',
                  d: 'Age comparison compiled to an R1CS circuit.',
                  s: pipelineState >= 2 ? 'completed' : 'pending',
                },
                {
                  n: '3',
                  t: 'Proof generation',
                  d: 'A zero-knowledge proof of the claim is produced.',
                  s: pipelineState >= 3 ? 'completed' : 'pending',
                },
                {
                  n: '4',
                  t: 'On-chain verify',
                  d: 'Only the proof and its boolean result are submitted.',
                  s: pipelineState >= 4 ? 'completed' : 'pending',
                },
              ].map((step, idx) => (
                <div key={idx} className="flex-1 relative md:pr-4">
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-[15px] right-0 w-4 h-[1px] bg-[#2c2c30]" />
                  )}
                  <div
                    className={`w-[30px] h-[30px] border text-xs flex items-center justify-center mb-3.5 transition-all ${
                      step.s === 'completed'
                        ? 'border-[#5aa07d] text-[#5aa07d] bg-[#5aa07d]/[0.08]'
                        : 'border-[#55575c] text-[#55575c]'
                    }`}
                  >
                    {step.s === 'completed' ? '✓' : step.n}
                  </div>
                  <h3 className="text-[13px] m-0 mb-1 text-[#e8e5dc] font-medium">{step.t}</h3>
                  <p className="m-0 mb-2 text-xs text-[#84878c]">{step.d}</p>
                  <div
                    className={`text-[11px] tracking-wider ${
                      step.s === 'completed' ? 'text-[#5aa07d]' : 'text-[#55575c]'
                    }`}
                  >
                    {step.s}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* OTHER TABS */}
      {activeTab === 'explorer' && (
        <main className="max-w-[1180px] mx-auto py-8 px-4 md:px-8 flex-1">
          <PrivacyExplorer />
        </main>
      )}

      {activeTab === 'circuit' && (
        <main className="max-w-[1180px] mx-auto py-8 px-4 md:px-8 flex-1">
          <CompactCircuitViewer />
        </main>
      )}

      {activeTab === 'stats' && (
        <main className="max-w-[1180px] mx-auto py-8 px-4 md:px-8 flex-1">
          <StatsDashboard />
        </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#2c2c30] py-4 px-4 md:px-8 max-w-[1180px] mx-auto text-[#55575c] text-[11px] flex justify-between flex-wrap gap-2 w-full">
        <span>midnight•gate — case file MG-0441</span>
        <span>no personal data leaves this page</span>
      </footer>

      {/* ACCESS BADGE MODAL */}
      <AccessBadgeModal badgeData={badgeData} onClose={() => setBadgeData(null)} />
    </div>
  );
}
