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
      setAdminSuccessMsg(`Threshold updated to ${newThresholdInput} years on-chain!`);
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

  const statCards = [
    {
      label: 'Total Proofs Verified',
      value: state?.totalVerifications || 0,
      suffix: '',
      icon: Users,
      color: 'purple',
      detail: 'On-chain counter increments',
      detailColor: 'text-emerald-400/60',
    },
    {
      label: 'Min Age Threshold',
      value: state?.minAgeThreshold || 18,
      suffix: ' yrs',
      icon: ShieldCheck,
      color: 'cyan',
      detail: 'Configurable via Compact circuit',
      detailColor: 'text-purple-300/40',
    },
    {
      label: 'Gate Status',
      value: state?.gateActive ? 'LIVE' : 'PAUSED',
      suffix: '',
      icon: Activity,
      color: state?.gateActive ? 'emerald' : 'rose',
      detail: 'Midnight Preprod Consensus',
      detailColor: 'text-purple-300/40',
    },
    {
      label: 'Privacy Leakage',
      value: '0',
      suffix: ' Bits',
      icon: Lock,
      color: 'emerald',
      detail: '100% Zero-Knowledge Witness',
      detailColor: 'text-emerald-400/60',
    },
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* Contract ID Banner */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600/20 to-pink-600/20 border border-purple-500/15 flex items-center justify-center text-purple-300">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-purple-200/70">Midnight Preprod Contract:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                DEPLOYED
              </span>
            </div>
            <p className="font-mono text-xs text-cyan-300/70 font-medium select-all mt-0.5">
              {state?.contractAddress || 'c634cc887df0973ba82bc12e8eec22a7e4b7fc3cbce230cd84cc57b01183cf48'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (state?.contractAddress) {
              navigator.clipboard.writeText(state.contractAddress);
              setAdminSuccessMsg('Contract ID copied!');
              setTimeout(() => setAdminSuccessMsg(null), 2500);
            }
          }}
          className="px-4 py-2 rounded-xl bg-midnight-900/60 border border-purple-500/15 hover:border-purple-400/30 text-purple-300 text-xs font-medium transition-all"
        >
          Copy ID
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const iconColor = card.color === 'purple' ? 'from-purple-500/15 to-purple-600/15 text-purple-400 border-purple-500/15' :
            card.color === 'cyan' ? 'from-cyan-500/15 to-cyan-600/15 text-cyan-400 border-cyan-500/15' :
            card.color === 'emerald' ? 'from-emerald-500/15 to-emerald-600/15 text-emerald-400 border-emerald-500/15' :
            'from-rose-500/15 to-rose-600/15 text-rose-400 border-rose-500/15';
          const valueColor = card.color === 'emerald' ? 'text-emerald-400' :
            card.color === 'cyan' ? 'text-cyan-400' :
            card.color === 'rose' ? 'text-rose-400' : '';

          return (
            <div key={idx} className="glass-panel card-hover-lift p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-300/50">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${iconColor} border flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-display font-bold font-mono mt-2 ${valueColor || 'text-white'}`}>
                {card.value}{card.suffix}
              </p>
              <p className={`text-[11px] mt-1.5 flex items-center space-x-1 ${card.detailColor}`}>
                {card.color === 'emerald' && card.label !== 'Gate Status' && <CheckCircle2 className="w-3 h-3" />}
                <span>{card.detail}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Row: Stream & Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Verification Stream */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/15 pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-white flex items-center space-x-2">
                <Database className="w-5 h-5 text-purple-400/70" />
                <span>Anonymous Verification Stream</span>
              </h3>
              <p className="text-xs text-purple-300/40 mt-0.5">
                Zero-Knowledge proof settlements on Midnight testnet
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold badge-public tracking-wider">
              LIVE FEED
            </span>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 mx-auto flex items-center justify-center mb-3">
                  <Database className="w-5 h-5 text-purple-400/40" />
                </div>
                <p className="text-xs text-purple-400/40">No verifications recorded yet.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-midnight-950/50 border border-purple-900/10 hover:border-purple-500/15 transition-all font-mono text-xs space-y-2 card-hover-lift"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.isEligible ? 'badge-private' : 'bg-rose-950/30 text-rose-400 border border-rose-500/20'
                      }`}>
                        {log.isEligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                      </span>
                      <span className="text-[11px] text-purple-300/50">
                        Threshold &gt;= {log.minAgeRequired} yrs
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-purple-400/40">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-purple-500/20">•</span>
                      <span>Block #{log.blockHeight}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-purple-300/50 bg-midnight-900/40 p-2.5 rounded-lg border border-purple-950/50">
                    <div className="truncate">
                      <span className="text-purple-400/40">Tx:</span> {log.txHash}
                    </div>
                    <div className="truncate">
                      <span className="text-purple-400/40">Nullifier:</span> {log.anonymizedNullifier}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Governance Panel */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-purple-900/15 pb-4">
              <h3 className="text-lg font-display font-bold text-white flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-purple-400/70" />
                <span>Admin Panel</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono badge-zk">
                CIRCUITS
              </span>
            </div>

            {/* Threshold Control */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-purple-200/70">
                Update Gate Threshold
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newThresholdInput}
                  onChange={(e) => setNewThresholdInput(parseInt(e.target.value) || 18)}
                  className="w-24 glass-input px-3 py-2 text-sm font-mono text-center"
                />
                <button
                  onClick={handleUpdateThreshold}
                  disabled={isUpdating}
                  className="flex-1 py-2 px-3 rounded-xl glow-btn text-white text-xs font-bold disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Set Threshold'}
                </button>
              </div>
              <p className="text-[10px] text-purple-400/35">
                Calls the Compact admin circuit to update ledger threshold.
              </p>
            </div>

            {adminSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/15 border border-emerald-500/20 text-emerald-300 text-xs">
                {adminSuccessMsg}
              </div>
            )}

            {/* Toggle Gate */}
            <div className="pt-3 border-t border-purple-900/15 space-y-2.5">
              <label className="text-xs font-semibold text-purple-200/70">
                Emergency Pause / Resume
              </label>
              <button
                onClick={handleToggleGate}
                disabled={isUpdating}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all ${
                  state?.gateActive
                    ? 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-500/20 text-rose-300'
                    : 'bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
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

          {/* Reset */}
          <div className="pt-4 border-t border-purple-900/15">
            <button
              onClick={handleResetDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-midnight-950/50 border border-purple-900/10 hover:border-purple-700/20 text-purple-400/60 hover:text-purple-200 text-xs font-medium flex items-center justify-center space-x-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Demo Defaults</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
