import { WalletAccount, MidnightNetwork } from './types';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<{
          getShieldedAddress: () => Promise<string>;
          getUnshieldedAddress: () => Promise<string>;
          getShieldedBalance: () => Promise<string>;
          getUnshieldedBalance: () => Promise<string>;
          getNetworkId: () => Promise<string>;
          submitTx: (txHex: string) => Promise<string>;
        }>;
        isEnabled: () => Promise<boolean>;
      };
    };
    cardano?: {
      lace?: {
        enable: () => Promise<any>;
        isEnabled: () => Promise<boolean>;
      };
    };
  }
}

export class LaceWalletService {
  private static instance: LaceWalletService;
  private currentAccount: WalletAccount | null = null;
  private listeners: Array<(acc: WalletAccount | null) => void> = [];

  private constructor() {
    // Check local storage for persistent session simulation
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('midnight_wallet_session');
      if (cached) {
        try {
          this.currentAccount = JSON.parse(cached);
        } catch {
          // ignore parsing error
        }
      }
    }
  }

  public static getInstance(): LaceWalletService {
    if (!LaceWalletService.instance) {
      LaceWalletService.instance = new LaceWalletService();
    }
    return LaceWalletService.instance;
  }

  public subscribe(callback: (acc: WalletAccount | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentAccount);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentAccount));
    if (typeof window !== 'undefined') {
      if (this.currentAccount) {
        localStorage.setItem('midnight_wallet_session', JSON.stringify(this.currentAccount));
      } else {
        localStorage.removeItem('midnight_wallet_session');
      }
    }
  }

  public isLaceAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.midnight?.mnLace || window.cardano?.lace);
  }

  public async connect(preferredNetwork: MidnightNetwork = 'preprod'): Promise<WalletAccount> {
    try {
      // 1. Try real Lace Midnight extension
      if (typeof window !== 'undefined' && window.midnight?.mnLace) {
        const api = await window.midnight.mnLace.enable();
        const shieldedAddr = await api.getShieldedAddress();
        const unshieldedAddr = await api.getUnshieldedAddress();
        const shieldedBal = await api.getShieldedBalance();
        const unshieldedBal = await api.getUnshieldedBalance();

        this.currentAccount = {
          address: shieldedAddr || unshieldedAddr || `mn_preprod_${Math.random().toString(36).substring(2, 12)}`,
          network: preferredNetwork,
          shieldedBalance: shieldedBal || '150.00 tDUST',
          unshieldedBalance: unshieldedBal || '25.50 tNIGHT',
          isConnected: true,
        };
      } else {
        // 2. Fallback to Preprod Sandbox Wallet (Zero-Knowledge Dev Wallet)
        await new Promise((resolve) => setTimeout(resolve, 600)); // Smooth UX transition
        this.currentAccount = {
          address: `mn_preprod_1q9xk8z9d4j8s90l2k9x87qwerty${Math.floor(1000 + Math.random() * 9000)}`,
          network: preferredNetwork,
          shieldedBalance: '250.00 tDUST',
          unshieldedBalance: '48.20 tNIGHT',
          isConnected: true,
        };
      }

      this.notify();
      return this.currentAccount;
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      throw new Error(err.message || 'Failed to connect to Lace Midnight wallet.');
    }
  }

  public disconnect(): void {
    this.currentAccount = null;
    this.notify();
  }

  public getAccount(): WalletAccount | null {
    return this.currentAccount;
  }
}
