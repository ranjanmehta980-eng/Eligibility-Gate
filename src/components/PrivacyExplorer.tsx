'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Lock, Unlock, Database, Cpu, Check, AlertCircle, Copy } from 'lucide-react';

export const PrivacyExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'raw-ledger' | 'threat-model'>('side-by-side');
  const [copied, setCopied] = useState(false);

  const sampleWitness = {
    userDateOfBirth: "2001-04-14",
    userCalculatedAge: 23,
    governmentIdHash: "0x89f02c918a0b3e4f7d1a2c5b",
    userEntropySalt: "0x4a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d",
    deviceLocalEnclave: "Chrome/WebCrypto-V8",
    proverConstraintSatisfaction: true,
  };

  const sampleLedgerTransaction = {
    contractAddress: "c634cc887df0973ba82bc12e8eec22a7e4b7fc3cbce230cd84cc57b01183cf48",
    circuit: "verifyEligibility",
    proofType: "Halo2-PLONK-KZG",
    disclosedOutputs: {
      isEligible: true
    },
    publicInputs: {
      minAgeThreshold: 18
    },
    nullifierHash: "0xnull_3c4d5e6f7a8b9c0d",
    stateMutation: {
      totalVerifications: "+1"
    },
    gasFeePaidDust: "0.0042 tDUST"
  };

  const copyJson = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'side-by-side' as const, label: 'Side-by-Side View' },
    { id: 'raw-ledger' as const, label: 'Raw On-Chain Diff' },
    { id: 'threat-model' as const, label: 'Zero-Leakage Matrix' },
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold badge-zk flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ZK Privacy Guarantee</span>
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              <span className="gradient-text">Privacy Explorer</span>
              <span className="text-white"> & Ledger Inspector</span>
            </h2>
            <p className="text-sm text-purple-200/50 max-w-2xl mt-2 leading-relaxed">
              Inspect exactly what remains in your confidential sandbox versus what is publicly recorded on the Midnight Network.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-midnight-900/50 rounded-xl border border-purple-900/15">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'glow-btn text-white'
                    : 'text-purple-300/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Tab */}
      {activeTab === 'side-by-side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Local Witness Sandbox */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden card-hover-lift">
            {/* Left border accent */}
            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/15 ml-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-emerald-300">Local Witness Sandbox</h3>
                  <p className="text-[11px] text-emerald-400/50">Client Prover — 0 Bits Leaked</p>
                </div>
              </div>
              <button
                onClick={() => copyJson(sampleWitness)}
                className="p-2 rounded-lg bg-midnight-900/50 border border-emerald-500/15 hover:border-emerald-500/30 text-emerald-400 transition-all text-xs flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'JSON'}</span>
              </button>
            </div>

            <div className="mt-4 ml-3 font-mono text-xs bg-midnight-950/70 rounded-xl p-4 border border-emerald-900/15 text-emerald-200/80 space-y-2 overflow-x-auto">
              <div className="flex items-center justify-between text-purple-400/40 pb-1 border-b border-purple-900/10 text-[10px] uppercase tracking-wider">
                <span>Confidential Field</span>
                <span>Local Memory State</span>
              </div>
              {[
                { key: '"userDateOfBirth":', val: '"2001-04-14"' },
                { key: '"userCalculatedAge":', val: '23' },
                { key: '"governmentIdHash":', val: '"0x89f02c918a0b..."' },
                { key: '"userEntropySalt":', val: '"0x4a9b8c7d6e5f..."' },
                { key: '"circuitEvaluation":', val: '"23 >= 18 => true"' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-1 hover:bg-emerald-500/5 px-1 rounded transition-colors">
                  <span className="text-emerald-400/80 font-semibold">{row.key}</span>
                  <span className="text-emerald-300/70">{row.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 ml-3 p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/10 text-xs text-emerald-300/60 flex items-start space-x-2">
              <Lock className="w-4 h-4 text-emerald-400/60 shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300/80">Shielded Boundary:</strong> Values are destroyed upon proof computation and never transmitted.
              </span>
            </div>
          </div>

          {/* Public Midnight Ledger */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden card-hover-lift">
            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600" />
            
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/15 ml-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-cyan-300">Public Midnight Ledger</h3>
                  <p className="text-[11px] text-cyan-400/50">Validators & Block Explorers</p>
                </div>
              </div>
              <button
                onClick={() => copyJson(sampleLedgerTransaction)}
                className="p-2 rounded-lg bg-midnight-900/50 border border-cyan-500/15 hover:border-cyan-500/30 text-cyan-400 transition-all text-xs flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'JSON'}</span>
              </button>
            </div>

            <div className="mt-4 ml-3 font-mono text-xs bg-midnight-950/70 rounded-xl p-4 border border-cyan-900/15 text-cyan-200/80 space-y-2 overflow-x-auto">
              <div className="flex items-center justify-between text-purple-400/40 pb-1 border-b border-purple-900/10 text-[10px] uppercase tracking-wider">
                <span>On-Chain Field</span>
                <span>Validated Value</span>
              </div>
              {[
                { key: '"circuit":', val: '"verifyEligibility"', color: 'text-cyan-300/70' },
                { key: '"disclosedOutput.isEligible":', val: 'true', color: 'text-emerald-400 font-bold' },
                { key: '"proof":', val: '"<SNARK_PROOF_PI>"', color: 'text-purple-300/70' },
                { key: '"nullifier":', val: '"0xnull_3c4d5e..."', color: 'text-cyan-300/70' },
                { key: '"totalVerifications":', val: '+1 (Counter)', color: 'text-cyan-300/70' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-1 hover:bg-cyan-500/5 px-1 rounded transition-colors">
                  <span className="text-cyan-400/70 font-semibold">{row.key}</span>
                  <span className={row.color}>{row.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 ml-3 p-3 rounded-xl bg-cyan-950/10 border border-cyan-500/10 text-xs text-cyan-300/60 flex items-start space-x-2">
              <Database className="w-4 h-4 text-cyan-400/60 shrink-0 mt-0.5" />
              <span>
                <strong className="text-cyan-300/80">Zero Identity Tracing:</strong> The validator cannot infer whether user is 18, 35, or 80.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Raw Ledger Diff Tab */}
      {activeTab === 'raw-ledger' && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-display font-bold gradient-text mb-2">Compact State Transition Diff</h3>
          <p className="text-xs text-purple-200/50 mb-4">
            Deterministic state transition delta verified on Midnight Preprod testnet.
          </p>
          <pre className="p-5 rounded-xl bg-midnight-950/70 border border-purple-900/15 font-mono text-xs text-purple-200/80 overflow-x-auto leading-relaxed">
{`// Midnight State Delta Specification
{
  "blockHeight": 482914,
  "contract": "c634cc887df0973ba82bc12e8eec22a7e4b7fc3cbce230cd84cc57b01183cf48",
  "circuitExecuted": "verifyEligibility",
  "disclosures": {
    "isEligible": true
  },
  "ledgerMutations": {
    "totalVerifications": {
      "before": 142,
      "after": 143,
      "operation": "Counter.increment(1)"
    }
  },
  "privacyAudit": {
    "witnessInputCount": 2,
    "witnessDataLeaked": 0,
    "anonymityPreserved": true
  }
}`}
          </pre>
        </div>
      )}

      {/* Threat Model Tab */}
      {activeTab === 'threat-model' && (
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <h3 className="text-lg font-display font-bold gradient-text">Cryptographic Privacy Guarantees</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Zero Knowledge',
                desc: 'The verifier learns zero information beyond the validity of the statement (Age >= 18).',
                color: 'emerald',
              },
              {
                title: 'Unlinkability',
                desc: 'Independent proofs with randomized salt cannot be linked to the same wallet or identity.',
                color: 'cyan',
              },
              {
                title: 'Soundness & Integrity',
                desc: 'It is computationally infeasible for an ineligible user to generate a valid proof.',
                color: 'purple',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-midnight-950/50 border border-purple-900/15 space-y-3 card-hover-lift">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                    item.color === 'cyan' ? 'bg-cyan-500/15 text-cyan-400' :
                    'bg-purple-500/15 text-purple-400'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className={`font-display font-bold text-sm ${
                    item.color === 'emerald' ? 'text-emerald-400' :
                    item.color === 'cyan' ? 'text-cyan-400' : 'text-purple-400'
                  }`}>
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-purple-300/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-purple-950/10 border border-purple-800/15 text-xs text-purple-200/70 font-mono space-y-1">
            <span className="text-purple-400/60 font-bold block">Cryptographic Nullifier Invariant:</span>
            <p className="text-purple-300/50 font-mono">
              Nullifier = Poseidon_Hash(userPrivateKey, circuitId, salt) → Zero identity linkage across sessions.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
