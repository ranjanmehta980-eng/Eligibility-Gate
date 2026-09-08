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
    contractAddress: "mn_contract_eligibility_gate_0x8f2a1b9",
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

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold badge-zk flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Knowledge Privacy Guarantee</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Privacy Explorer & Ledger Observer Inspector
            </h2>
            <p className="text-sm text-purple-200/70 max-w-2xl mt-1">
              Inspect exactly what information remains inside your confidential browser sandbox versus what is publicly recorded and visible to validators on the Midnight Network.
            </p>
          </div>

          <div className="flex p-1 bg-midnight-900/80 rounded-xl border border-purple-900/40">
            <button
              onClick={() => setActiveTab('side-by-side')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'side-by-side'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setActiveTab('raw-ledger')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'raw-ledger'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              Raw On-Chain Diff
            </button>
            <button
              onClick={() => setActiveTab('threat-model')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'threat-model'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300/70 hover:text-white'
              }`}
            >
              Zero-Leakage Proof Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Tab */}
      {activeTab === 'side-by-side' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Local Witness Sandbox */}
          <div className="glass-panel rounded-2xl p-6 border-emerald-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <EyeOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-300">Local Witness Sandbox</h3>
                  <p className="text-[11px] text-emerald-400/70">Client Device Prover (0 Bits Leaked)</p>
                </div>
              </div>
              <button
                onClick={() => copyJson(sampleWitness)}
                className="p-1.5 rounded-lg bg-midnight-900/80 border border-emerald-500/30 hover:bg-emerald-950/40 text-emerald-400 transition-all text-xs flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'JSON'}</span>
              </button>
            </div>

            <div className="mt-4 font-mono text-xs bg-midnight-950/90 rounded-xl p-4 border border-emerald-900/30 text-emerald-200/90 space-y-2.5 overflow-x-auto">
              <div className="flex items-center justify-between text-purple-400/60 pb-1 border-b border-purple-900/20 text-[10px]">
                <span>CONFIDENTIAL FIELD</span>
                <span>LOCAL MEMORY STATE</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-emerald-400 font-semibold">"userDateOfBirth":</span>
                <span className="text-emerald-300">"2001-04-14"</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-emerald-400 font-semibold">"userCalculatedAge":</span>
                <span className="text-emerald-300">23</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-emerald-400 font-semibold">"governmentIdHash":</span>
                <span className="text-emerald-300">"0x89f02c918a0b..."</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-emerald-400 font-semibold">"userEntropySalt":</span>
                <span className="text-emerald-300">"0x4a9b8c7d6e5f..."</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-emerald-400 font-semibold">"circuitEvaluation":</span>
                <span className="text-emerald-300">"23 &gt;= 18 =&gt; true"</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300/80 flex items-start space-x-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Shielded Boundary:</strong> These values are used solely to generate algebraic commitments. They are destroyed upon proof computation and never transmitted across the network.
              </span>
            </div>
          </div>

          {/* Card 2: What On-Chain Observers & Validators See */}
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cyan-300">Public Midnight Ledger</h3>
                  <p className="text-[11px] text-cyan-400/70">What Validators & Block Explorers See</p>
                </div>
              </div>
              <button
                onClick={() => copyJson(sampleLedgerTransaction)}
                className="p-1.5 rounded-lg bg-midnight-900/80 border border-cyan-500/30 hover:bg-cyan-950/40 text-cyan-400 transition-all text-xs flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'JSON'}</span>
              </button>
            </div>

            <div className="mt-4 font-mono text-xs bg-midnight-950/90 rounded-xl p-4 border border-cyan-900/30 text-cyan-200/90 space-y-2.5 overflow-x-auto">
              <div className="flex items-center justify-between text-purple-400/60 pb-1 border-b border-purple-900/20 text-[10px]">
                <span>ON-CHAIN FIELD</span>
                <span>VALIDATED VALUE</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyan-400 font-semibold">"circuit":</span>
                <span className="text-cyan-300">"verifyEligibility"</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyan-400 font-semibold">"disclosedOutput.isEligible":</span>
                <span className="text-emerald-400 font-bold">true</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyan-400 font-semibold">"proof":</span>
                <span className="text-purple-300">"&lt;SNARK_PROOF_PI_BYTES&gt;"</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyan-400 font-semibold">"nullifier":</span>
                <span className="text-cyan-300">"0xnull_3c4d5e6f7a8b..."</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyan-400 font-semibold">"totalVerifications":</span>
                <span className="text-cyan-300">+1 (Counter)</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300/80 flex items-start space-x-2">
              <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Identity Tracing:</strong> The block validator only verifies cryptographic validity of the proof $\pi$. The validator cannot infer whether user is 18, 35, or 80.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Raw Ledger Diff Tab */}
      {activeTab === 'raw-ledger' && (
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Compact State Transition Diff</h3>
          <p className="text-xs text-purple-200/70 mb-4">
            Deterministic state transition delta verified on Midnight Preprod testnet.
          </p>
          <pre className="p-4 rounded-xl bg-midnight-950 border border-purple-900/40 font-mono text-xs text-purple-200 overflow-x-auto">
{`// Midnight State Delta Specification
{
  "blockHeight": 482914,
  "contract": "mn_contract_eligibility_gate_0x8f2a1b9",
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
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Cryptographic Privacy Guarantees</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-midnight-950/80 border border-purple-900/40 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                <Check className="w-4 h-4" />
                <span>Zero Knowledge</span>
              </div>
              <p className="text-xs text-purple-300/70">
                The verifier learns zero information beyond the validity of the statement (Age &gt;= 18).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-midnight-950/80 border border-purple-900/40 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
                <Check className="w-4 h-4" />
                <span>Unlinkability</span>
              </div>
              <p className="text-xs text-purple-300/70">
                Independent proofs generated with randomized salt cannot be linked to the same wallet or real-world identity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-midnight-950/80 border border-purple-900/40 space-y-2">
              <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm">
                <Check className="w-4 h-4" />
                <span>Soundness & Integrity</span>
              </div>
              <p className="text-xs text-purple-300/70">
                It is computationally infeasible for an ineligible user to generate a valid proof satisfying the Compact circuit.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
