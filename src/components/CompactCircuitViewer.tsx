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

  return (
    <div className="w-full space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold badge-zk flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>Compact DSL</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold badge-private">
                contract.compact
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Midnight Compact Smart Contract Source
            </h2>
            <p className="text-sm text-purple-200/70 max-w-2xl mt-1">
              Declarative zero-knowledge circuit architecture specifying private witness queries, arithmetic assertions, and explicit selective disclosures.
            </p>
          </div>

          <button
            onClick={copyCode}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-sm font-medium transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
            <span>{copied ? 'Copied Contract' : 'Copy Source Code'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Explanatory Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setSelectedAnnotation('witness')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedAnnotation === 'witness'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
              : 'bg-midnight-950/60 border-purple-900/40 hover:border-purple-700'
          }`}
        >
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-1">
            <Lock className="w-4 h-4" />
            <span>1. Private Witness</span>
          </div>
          <p className="text-xs text-purple-200/80">
            <code className="font-mono text-emerald-300">witness userAgeWitness(): Uint&lt;16&gt;</code> binds directly to client local memory, shielded from all validators.
          </p>
        </div>

        <div 
          onClick={() => setSelectedAnnotation('predicate')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedAnnotation === 'predicate'
              ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50'
              : 'bg-midnight-950/60 border-purple-900/40 hover:border-purple-700'
          }`}
        >
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            <span>2. Arithmetic Constraints</span>
          </div>
          <p className="text-xs text-purple-200/80">
            <code className="font-mono text-purple-300">age &gt;= minAgeThreshold</code> compiles to zero-knowledge polynomial equations without revealing `age`.
          </p>
        </div>

        <div 
          onClick={() => setSelectedAnnotation('disclose')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            selectedAnnotation === 'disclose'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50'
              : 'bg-midnight-950/60 border-purple-900/40 hover:border-purple-700'
          }`}
        >
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm mb-1">
            <Globe className="w-4 h-4" />
            <span>3. Selective Disclosure</span>
          </div>
          <p className="text-xs text-purple-200/80">
            <code className="font-mono text-cyan-300">disclose(eligible)</code> writes ONLY the boolean outcome to Midnight state, preserving total confidentiality.
          </p>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-900/40">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-900/30 text-xs font-mono text-purple-400">
          <span>contract/contract.compact</span>
          <span>Compact v0.19.0 (Level 3 Compliant)</span>
        </div>
        <pre className="font-mono text-xs text-purple-100 overflow-x-auto p-4 rounded-xl bg-midnight-950/90 border border-purple-900/40 leading-relaxed">
          {compactCode}
        </pre>
      </div>

    </div>
  );
};
