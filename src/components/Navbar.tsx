'use client';

import React, { useState, useEffect } from 'react';
import { LaceWalletService } from '@/midnight/laceConnector';
import { WalletAccount } from '@/midnight/types';
import { ShieldCheck, Lock, CheckCircle2, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  onNavSelect?: (tab: string) => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavSelect, activeTab = 'gate' }) => {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { id: 'gate', label: 'ZK Gate' },
    { id: 'explorer', label: 'Privacy Explorer' },
    { id: 'circuit', label: 'Compact Circuit' },
    { id: 'stats', label: 'Ledger Stats' },
  ];

  return (
    <header className="max-w-7xl mx-auto flex justify-between items-center bg-gradient-to-r from-[#12102A]/90 to-[#1A1035]/90 backdrop-blur-2xl border border-purple-500/30 rounded-[18px] px-6 py-4 shadow-[0_0_40px_rgba(168,85,247,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] relative z-50">
      {/* Brand Logo */}
      <div
        className="flex items-center gap-3 font-black text-lg cursor-pointer group select-none"
        onClick={() => onNavSelect?.('gate')}
      >
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.6)] text-white text-base">
          🛡️
        </span>
        <span className="tracking-tight font-black">
          Midnight<span className="text-pink-400">Gate</span>
        </span>
        <span className="text-[10px] font-mono bg-purple-500/20 border border-purple-500/40 px-2.5 py-1 rounded-full text-purple-300">
          ZK • v0.4.1
        </span>
      </div>

      {/* Desktop Nav Items */}
      <div className="hidden md:flex gap-7 text-[13px] text-zinc-400 font-medium">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavSelect?.(item.id)}
            className={`transition-all pb-1 ${
              activeTab === item.id
                ? 'text-purple-300 border-b-2 border-purple-400 font-bold shadow-[0_1px_10px_rgba(168,85,247,0.4)]'
                : 'hover:text-zinc-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right Side: Wallet Connection */}
      <div className="flex items-center gap-3">
        {wallet?.isConnected ? (
          <div className="flex items-center gap-2">
            <div
              onClick={copyAddress}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/40 border border-purple-500/30 hover:border-pink-500/50 transition-all text-xs"
              title="Click to copy wallet address"
            >
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px]">
                <Lock className="w-2.5 h-2.5" />
              </div>
              <span className="font-mono text-purple-200 font-medium">
                {wallet.address.substring(0, 7)}...{wallet.address.substring(wallet.address.length - 4)}
              </span>
              {copied && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </div>

            <button
              onClick={handleDisconnect}
              className="p-2 rounded-full bg-black/40 border border-white/10 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 transition"
              title="Disconnect Wallet"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-sm font-bold shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.7)] active:scale-95 transition disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : '🔗 Connect Lace'}
          </button>
        )}

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#12102A]/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl p-4 space-y-2 shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavSelect?.(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-xl transition ${
                activeTab === item.id
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
