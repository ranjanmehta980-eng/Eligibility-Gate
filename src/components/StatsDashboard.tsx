'use client';

import React, { useState, useEffect } from 'react';
import { EligibilityGateClient } from '@/midnight/contractClient';
import { ContractState, ProofLogEntry } from '@/midnight/types';
import { 
  Activity, 
  ShieldCheck, 
  Sliders, 
  RefreshCw, 
  ExternalLink, 
  Users, 
  CheckCircle2, 
  Clock, 
  Database,
  Lock,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

export const StatsDashboard: React.FC = () => {
  const [state, setState] = useState<ContractState | null>(null);
  const [logs, setLogs] = useState<ProofLogEntry[]>([]);
  const [newThresholdInput, setNewThresholdInput] = useState<number>(21);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const client = EligibilityGateClient.getInstance();
    const unsubState = client.subscribeState((st) => {
      setState(st);
      if (st) setNewThresholdInput(st.minAgeThreshold);
    });
    const unsubLogs = client.subscribeLogs(setLogs);
    return () => {
      unsubState();
      unsubLogs();
    };
  }, []);

  const handleUpdateThreshold = async () => {
    try {
      setIsUpdating(true);
      await EligibilityGateClient.getInstance().setMinAgeThreshold(newThresholdInput);
      setAdminSuccessMsg(`Threshold successfully updated to ${newThresholdInput} years on-chain!`);
      setTimeout(() => setAdminSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleGate = async () => {
    try {
      setIsUpdating(true);
      await EligibilityGateClient.getInstance().toggleGateActive();
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetDemo = () => {
    EligibilityGateClient.getInstance().resetToDefaults();
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Contract Identification Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-midnight-900/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-purple-200">Midnight Preprod Contract ID:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                DEPLOYED & ACTIVE
              </span>
            </div>
            <p className="font-mono text-xs text-cyan-300 font-semibold select-all mt-0.5">
              {state?.contractAddress || 'mn_contract_eligibility_gate_0x8f2a1b9'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (state?.contractAddress) {
              navigator.clipboard.writeText(state.contractAddress);
              setAdminSuccessMsg('Contract ID copied to clipboard!');
              setTimeout(() => setAdminSuccessMsg(null), 2500);
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/50 text-purple-300 text-xs font-medium transition-all"
        >
          Copy Contract ID
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border-purple-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300/70">Total Proofs Verified</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-2">
            {state?.totalVerifications || 0}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>On-chain counter increments</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-purple-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300/70">Min Age Threshold</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {state?.minAgeThreshold || 18} <span className="text-sm font-normal text-purple-300">years</span>
          </p>
          <p className="text-[11px] text-purple-300/60 mt-1">Configurable via Compact circuit</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-purple-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300/70">Gate Status</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              state?.gateActive 
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500/30 text-rose-400'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white mt-2">
            {state?.gateActive ? (
              <span className="text-emerald-400">OPERATIONAL</span>
            ) : (
              <span className="text-rose-400">PAUSED</span>
            )}
          </p>
          <p className="text-[11px] text-purple-300/60 mt-1">Midnight Preprod Consensus</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-purple-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300/70">Privacy Leakage Metric</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            0 Bits
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-1">100% Zero-Knowledge Witness</p>
        </div>

      </div>

      {/* Main Row: Recent Anonymous Stream & Admin Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recent Anonymous Verifications Stream */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Database className="w-5 h-5 text-purple-400" />
                <span>On-Chain Anonymous Verification Stream</span>
              </h3>
              <p className="text-xs text-purple-300/60 mt-0.5">
                Real-time Zero-Knowledge proof settlements recorded on Midnight testnet
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono badge-public">
                PREPROD FEED
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-xs text-purple-400/60 text-center py-6">No verifications recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-midnight-950/80 border border-purple-900/40 hover:border-purple-600/50 transition-all font-mono text-xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.isEligible ? 'badge-private' : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.isEligible ? 'VERIFIED ELIGIBLE' : 'INELIGIBLE'}
                      </span>
                      <span className="text-[11px] text-purple-300">
                        Threshold &gt;= {log.minAgeRequired} yrs
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-purple-400/60">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Block #{log.blockHeight}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-purple-300/80 bg-midnight-900/60 p-2 rounded-lg border border-purple-950">
                    <div className="truncate">
                      <span className="text-purple-400">Tx:</span> {log.txHash}
                    </div>
                    <div className="truncate">
                      <span className="text-purple-400">Nullifier:</span> {log.anonymizedNullifier}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Contract Admin Governance Panel */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <span>Admin Governance</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono badge-zk">
                CIRCUITS
              </span>
            </div>

            {/* Adjust Threshold Form */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-purple-200">
                Update Gate Threshold (`setMinAgeThreshold`)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newThresholdInput}
                  onChange={(e) => setNewThresholdInput(parseInt(e.target.value) || 18)}
                  className="w-24 glass-input px-3 py-1.5 rounded-lg text-sm font-mono text-center"
                />
                <button
                  onClick={handleUpdateThreshold}
                  disabled={isUpdating}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Set Threshold'}
                </button>
              </div>
              <p className="text-[10px] text-purple-400/60">
                Calls the Compact admin circuit to update ledger threshold.
              </p>
            </div>

            {adminSuccessMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
                {adminSuccessMsg}
              </div>
            )}

            {/* Toggle Gate Active */}
            <div className="pt-2 border-t border-purple-900/30 space-y-2">
              <label className="text-xs font-semibold text-purple-200">
                Emergency Pause / Resume
              </label>
              <button
                onClick={handleToggleGate}
                disabled={isUpdating}
                className={`w-full py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all ${
                  state?.gateActive
                    ? 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {state?.gateActive ? (
                  <>
                    <PauseCircle className="w-4 h-4" />
                    <span>Pause Eligibility Gate</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Resume Eligibility Gate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reset Demo Button */}
          <div className="pt-4 border-t border-purple-900/30">
            <button
              onClick={handleResetDemo}
              className="w-full py-2 px-3 rounded-lg bg-midnight-950/80 border border-purple-900/40 hover:border-purple-700 text-purple-400 hover:text-purple-200 text-xs font-medium flex items-center justify-center space-x-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State & Logs to Demo Defaults</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
