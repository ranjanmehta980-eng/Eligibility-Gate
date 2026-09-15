'use client';

import React, { useState } from 'react';
import { Code2, Check, Copy, Sparkles, Lock, Globe } from 'lucide-react';

export const CompactCircuitViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string>('witness');

  const compactCode = `// ============================================================================
// Midnight Network Smart Contract: Verifiable Private Eligibility Gate
// Language: Compact (Midnight Smart Contract DSL)
// Level: 3 Production Specification
// ============================================================================

export ledger totalVerifications: Counter;
export ledger minAgeThreshold: Uint<16>;
export ledger gateActive: Boolean;
export ledger admin: Bytes<32>;

// ----------------------------------------------------------------------------
// Private Witnesses (Executed strictly inside user's local client prover)
// ----------------------------------------------------------------------------
witness userAgeWitness(): Uint<16>;
witness userEntropyWitness(): Bytes<32>;

constructor(initialMinAge: Uint<16>, adminPublicKey: Bytes<32>) {
    minAgeThreshold = initialMinAge;
    gateActive = true;
    admin = adminPublicKey;
}

/**
 * @notice Verifies user eligibility against threshold without disclosing age.
 * @dev Evaluates predicate in ZK witness sandbox. Only the boolean result is disclosed.
 */
export circuit verifyEligibility(): Boolean {
    // 1. Assert public ledger preconditions
    assert gateActive "Eligibility Gate is currently paused or inactive";

    // 2. Ingest private witness data into client-side ZK prover sandbox
    const age = userAgeWitness();
    const entropy = userEntropyWitness();

    // 3. Sanity check private input constraints within the circuit
    assert age < 150 "Invalid age witness: out of human bounds";

    // 4. Compute privacy-preserving predicate
    const eligible: Boolean = age >= minAgeThreshold;

    // 5. Explicitly disclose ONLY the boolean outcome to the public ledger
    // Crucial: The 'age' and 'entropy' variables NEVER leave the private witness scope.
    const isDisclosedEligible: Boolean = disclose(eligible);

    // 6. On-chain state mutation upon successful proof verification
    if (isDisclosedEligible) {
        totalVerifications.increment(1);
    }

    return isDisclosedEligible;
}

export circuit setMinAgeThreshold(newThreshold: Uint<16>): Void {
    assert newThreshold > 0 "Threshold must be greater than zero";
    minAgeThreshold = newThreshold;
}

export circuit setGateActive(active: Boolean): Void {
    gateActive = active;
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(compactCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const annotations = [
    {
      id: 'witness',
      step: '1',
      title: 'Private Witness',
      desc: (
        <>
          <code className="font-mono text-emerald-300/80 text-[11px] bg-emerald-500/5 px-1.5 py-0.5 rounded">witness userAgeWitness(): Uint&lt;16&gt;</code> binds directly to client local memory, shielded from all validators.
        </>
      ),
      color: 'emerald',
      icon: Lock,
    },
    {
      id: 'predicate',
      step: '2',
      title: 'Arithmetic Constraints',
      desc: (
        <>
          <code className="font-mono text-purple-300/80 text-[11px] bg-purple-500/5 px-1.5 py-0.5 rounded">age &gt;= minAgeThreshold</code> compiles to zero-knowledge polynomial equations.
        </>
      ),
      color: 'purple',
      icon: Sparkles,
    },
    {
      id: 'disclose',
      step: '3',
      title: 'Selective Disclosure',
      desc: (
        <>
          <code className="font-mono text-cyan-300/80 text-[11px] bg-cyan-500/5 px-1.5 py-0.5 rounded">disclose(eligible)</code> writes ONLY the boolean outcome to Midnight state.
        </>
      ),
      color: 'cyan',
      icon: Globe,
    },
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold badge-zk flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>Compact DSL</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold badge-private">
                contract.compact
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              <span className="gradient-text">Compact Smart Contract</span>
              <span className="text-white"> Source</span>
            </h2>
            <p className="text-sm text-purple-200/50 max-w-2xl mt-2 leading-relaxed">
              Declarative zero-knowledge circuit architecture with private witness queries and selective disclosures.
            </p>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-midnight-900/60 border border-purple-500/20 hover:border-purple-400/40 text-purple-200 text-sm font-medium transition-all group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />}
            <span>{copied ? 'Copied!' : 'Copy Source'}</span>
          </button>
        </div>
      </div>

      {/* Numbered Annotation Cards (1/3, 2/3, 3/3 style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {annotations.map((ann) => {
          const isActive = selectedAnnotation === ann.id;
          const Icon = ann.icon;
          const colorClasses = {
            emerald: {
              active: 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-cyan',
              inactive: 'bg-midnight-950/40 border-purple-900/15 hover:border-emerald-500/20',
              stepColor: 'text-emerald-400',
              iconBg: 'bg-emerald-500/10 text-emerald-400',
            },
            purple: {
              active: 'bg-purple-950/20 border-purple-500/40 shadow-glow-purple',
              inactive: 'bg-midnight-950/40 border-purple-900/15 hover:border-purple-500/20',
              stepColor: 'text-purple-400',
              iconBg: 'bg-purple-500/10 text-purple-400',
            },
            cyan: {
              active: 'bg-cyan-950/20 border-cyan-500/40 shadow-glow-cyan',
              inactive: 'bg-midnight-950/40 border-purple-900/15 hover:border-cyan-500/20',
              stepColor: 'text-cyan-400',
              iconBg: 'bg-cyan-500/10 text-cyan-400',
            },
          }[ann.color]!;

          return (
            <div
              key={ann.id}
              onClick={() => setSelectedAnnotation(ann.id)}
              className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                isActive ? colorClasses.active : colorClasses.inactive
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-2xl font-display font-bold ${colorClasses.stepColor}`}>
                  {ann.step}/3
                </span>
                <div className={`w-8 h-8 rounded-xl ${colorClasses.iconBg} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <h4 className={`font-display font-bold text-sm mb-2 ${colorClasses.stepColor}`}>
                {ann.title}
              </h4>
              <p className="text-xs text-purple-200/60 leading-relaxed">{ann.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Code Display Area */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/15 text-xs font-mono text-purple-400/50">
          <span>contract/contract.compact</span>
          <span className="text-purple-400/30">Compact v0.19.0 (Level 3)</span>
        </div>
        <pre className="font-mono text-xs text-purple-100/80 overflow-x-auto p-5 rounded-xl bg-midnight-950/70 border border-purple-900/10 leading-relaxed">
          {compactCode}
        </pre>
      </div>

    </div>
  );
};
