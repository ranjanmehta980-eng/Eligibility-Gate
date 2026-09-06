'use client';

import React, { useState, useEffect } from 'react';
import { LaceWalletService } from '@/midnight/laceConnector';
import { WalletAccount } from '@/midnight/types';
import { ShieldCheck, Wallet, Lock, Activity, ExternalLink, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onNavSelect?: (tab: string) => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavSelect, activeTab = 'gate' }) => {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const service = LaceWalletService.getInstance();
    const unsub = service.subscribe((acc) => setWallet(acc));
    return () => unsub();
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      await LaceWalletService.getInstance().connect('preprod');
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    LaceWalletService.getInstance().disconnect();
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-900/30 bg-midnight-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavSelect?.('gate')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/40 border border-purple-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-100 bg-clip-text text-transparent">
                Midnight<span className="text-purple-400 font-extrabold">Gate</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md badge-zk">
                Level 3 ZK
              </span>
            </div>
            <p className="text-xs text-purple-300/60 font-medium">Verifiable Private Eligibility Gate</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-midnight-900/60 rounded-xl border border-purple-900/30">
          {[
            { id: 'gate', label: 'ZK Gate' },
            { id: 'explorer', label: 'Privacy Explorer' },
            { id: 'circuit', label: 'Compact Circuit' },
            { id: 'stats', label: 'Ledger Stats' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavSelect?.(item.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Network Indicator & Wallet Connection */}
        <div className="flex items-center space-x-3">
          {/* Contract Address Chip */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs font-mono text-purple-300">
            <span className="text-[10px] text-purple-400 font-semibold uppercase">Contract ID:</span>
            <span className="text-cyan-300 font-medium">mn_contract_0x8f2a1b9</span>
          </div>

          {/* Network Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-midnight-900/80 border border-purple-900/40 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-purple-200/90 font-medium">Preprod</span>
            <span className="text-purple-400/40">|</span>
            <span className="text-purple-300/60 font-mono text-[11px]">Halo2</span>
          </div>

          {/* Wallet State */}
          {wallet?.isConnected ? (
            <div className="flex items-center space-x-2">
              <div 
                onClick={copyAddress}
                className="group cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-400 transition-all text-xs"
                title="Click to copy address"
              >
                <div className="w-5 h-5 rounded-full bg-purple-600/40 flex items-center justify-center text-purple-300">
                  <Lock className="w-3 h-3" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-mono text-purple-200 font-semibold">
                    {wallet.address.substring(0, 10)}...{wallet.address.substring(wallet.address.length - 4)}
                  </span>
                  <span className="text-[10px] text-purple-300/60 font-mono">
                    {wallet.shieldedBalance}
                  </span>
                </div>
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    copy
                  </span>
                )}
              </div>

              <button
                onClick={handleDisconnect}
                className="p-2 rounded-xl bg-purple-950/30 border border-purple-900/40 hover:bg-rose-950/40 hover:border-rose-500/40 text-purple-400 hover:text-rose-400 transition-all"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              <span>{connecting ? 'Connecting...' : 'Connect Lace'}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
