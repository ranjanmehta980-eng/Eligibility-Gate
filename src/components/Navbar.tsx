'use client';

import React, { useState, useEffect } from 'react';
import { LaceWalletService } from '@/midnight/laceConnector';
import { WalletAccount } from '@/midnight/types';
import { ShieldCheck, Wallet, Lock, ExternalLink, LogOut, CheckCircle2, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavSelect?: (tab: string) => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavSelect, activeTab = 'gate' }) => {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const service = LaceWalletService.getInstance();
    const unsub = service.subscribe((acc) => setWallet(acc));
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-midnight-950/90 backdrop-blur-xl border-b border-purple-900/20 shadow-lg shadow-black/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavSelect?.('gate')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 shadow-glow-purple transition-transform group-hover:scale-105">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold tracking-tight">
              <span className="gradient-text">Midnight</span>
              <span className="text-white">Gate</span>
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavSelect?.(item.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                activeTab === item.id
                  ? 'text-white'
                  : 'text-purple-300/60 hover:text-purple-100'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 rounded-xl bg-purple-500/15 border border-purple-500/25" />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Side: Network + Wallet */}
        <div className="flex items-center space-x-3">
          {/* Network Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-midnight-900/60 border border-purple-900/30 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-purple-200/80 font-medium">Preprod</span>
            <span className="text-purple-500/40">•</span>
            <span className="text-purple-300/50 font-mono text-[10px]">Halo2</span>
          </div>

          {/* Wallet State */}
          {wallet?.isConnected ? (
            <div className="flex items-center space-x-2">
              <div 
                onClick={copyAddress}
                className="group cursor-pointer flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-midnight-900/60 border border-purple-500/20 hover:border-purple-400/40 transition-all text-xs"
                title="Click to copy address"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <Lock className="w-2.5 h-2.5" />
                </div>
                <span className="font-mono text-purple-200 font-medium">
                  {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 4)}
                </span>
                {copied && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>

              <button
                onClick={handleDisconnect}
                className="p-2 rounded-xl bg-midnight-900/60 border border-purple-900/30 hover:bg-rose-950/30 hover:border-rose-500/30 text-purple-400 hover:text-rose-400 transition-all"
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="glow-btn flex items-center space-x-2 px-5 py-2 rounded-full text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-wait"
            >
              <Wallet className="w-4 h-4" />
              <span>{connecting ? 'Connecting...' : 'Connect Lace'}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-midnight-900/60 border border-purple-900/30 text-purple-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-midnight-950/95 backdrop-blur-xl border-b border-purple-900/20 p-4 space-y-1 animate-fade-in-up">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavSelect?.(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-purple-500/15 text-white border border-purple-500/25'
                  : 'text-purple-300/60 hover:text-white hover:bg-purple-900/10'
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
