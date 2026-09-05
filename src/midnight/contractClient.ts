import { ContractState, ProofLogEntry, ZKProofWitnessInput } from './types';
import { MidnightZKProverEngine, ProofGenerationProgress } from './zkProver';

const INITIAL_STATE: ContractState = {
  totalVerifications: 142,
  minAgeThreshold: 18,
  gateActive: true,
  adminAddress: 'mn_preprod_admin9901428xklasdf09238471203948',
  contractAddress: 'mn_contract_eligibility_gate_0x8f2a1b94d7e291c0a85fb32e71d4a96c',
};

const INITIAL_LOGS: ProofLogEntry[] = [
  {
    id: 'log-1',
    timestamp: Date.now() - 1000 * 60 * 12,
    txHash: '0x3a8f9b7c12d4e5f67890abcdef1234567890abcdef1234567890abcdef123456',
    proofHash: '0xzkp_8f0a2b1c4e6d8a7c9b0e1f2a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    isEligible: true,
    minAgeRequired: 18,
    anonymizedNullifier: '0xnull_9a8b7c6d5e4f3a2b',
    blockHeight: 482910,
  },
  {
    id: 'log-2',
    timestamp: Date.now() - 1000 * 60 * 45,
    txHash: '0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6',
    proofHash: '0xzkp_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    isEligible: true,
    minAgeRequired: 18,
    anonymizedNullifier: '0xnull_3c4d5e6f7a8b9c0d',
    blockHeight: 482894,
  },
  {
    id: 'log-3',
    timestamp: Date.now() - 1000 * 60 * 90,
    txHash: '0x4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
    proofHash: '0xzkp_5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    isEligible: true,
    minAgeRequired: 18,
    anonymizedNullifier: '0xnull_8f7e6d5c4b3a2f1e',
    blockHeight: 482840,
  },
];

export class EligibilityGateClient {
  private static instance: EligibilityGateClient;
  private state: ContractState = { ...INITIAL_STATE };
  private logs: ProofLogEntry[] = [...INITIAL_LOGS];
  private stateListeners: Array<(state: ContractState) => void> = [];
  private logListeners: Array<(logs: ProofLogEntry[]) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      const cachedState = localStorage.getItem('midnight_gate_state');
      const cachedLogs = localStorage.getItem('midnight_gate_logs');
      if (cachedState) {
        try { this.state = JSON.parse(cachedState); } catch {}
      }
      if (cachedLogs) {
        try { this.logs = JSON.parse(cachedLogs); } catch {}
      }
    }
  }

  public static getInstance(): EligibilityGateClient {
    if (!EligibilityGateClient.instance) {
      EligibilityGateClient.instance = new EligibilityGateClient();
    }
    return EligibilityGateClient.instance;
  }

  public subscribeState(cb: (state: ContractState) => void): () => void {
    this.stateListeners.push(cb);
    cb(this.state);
    return () => {
      this.stateListeners = this.stateListeners.filter((c) => c !== cb);
    };
  }

  public subscribeLogs(cb: (logs: ProofLogEntry[]) => void): () => void {
    this.logListeners.push(cb);
    cb(this.logs);
    return () => {
      this.logListeners = this.logListeners.filter((c) => c !== cb);
    };
  }

  private notify() {
    this.stateListeners.forEach((cb) => cb({ ...this.state }));
    this.logListeners.forEach((cb) => cb([...this.logs]));
    if (typeof window !== 'undefined') {
      localStorage.setItem('midnight_gate_state', JSON.stringify(this.state));
      localStorage.setItem('midnight_gate_logs', JSON.stringify(this.logs));
    }
  }

  public getState(): ContractState {
    return { ...this.state };
  }

  public getLogs(): ProofLogEntry[] {
    return [...this.logs];
  }

  /**
   * Invokes the Compact circuit `verifyEligibility()`
   */
  public async verifyEligibility(
    witness: ZKProofWitnessInput,
    onProgress?: (progress: ProofGenerationProgress) => void
  ): Promise<{ isEligible: boolean; txHash: string; proofHash: string; nullifier: string }> {
    if (!this.state.gateActive) {
      throw new Error('Circuit Precondition Failed: Eligibility gate is paused');
    }

    // 1. Run client-side zero-knowledge proof generation
    const proofPayload = await MidnightZKProverEngine.executeEligibilityProof(
      witness,
      this.state.minAgeThreshold,
      onProgress
    );

    const isEligible = proofPayload.disclosedOutput.isEligible;
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // 2. If eligible, update on-chain ledger state
    if (isEligible) {
      this.state.totalVerifications += 1;
    }

    // 3. Append to anonymous on-chain verification log
    const newEntry: ProofLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      txHash: txHash,
      proofHash: proofPayload.proofHash,
      isEligible: isEligible,
      minAgeRequired: this.state.minAgeThreshold,
      anonymizedNullifier: proofPayload.nullifier,
      blockHeight: 482900 + this.state.totalVerifications,
    };

    this.logs = [newEntry, ...this.logs.slice(0, 19)];
    this.notify();

    return {
      isEligible,
      txHash,
      proofHash: proofPayload.proofHash,
      nullifier: proofPayload.nullifier,
    };
  }

  /**
   * Updates minimum age threshold (Admin Circuit)
   */
  public async setMinAgeThreshold(newThreshold: number): Promise<void> {
    if (newThreshold < 1 || newThreshold > 100) {
      throw new Error('Invalid threshold: Must be between 1 and 100');
    }
    await new Promise((r) => setTimeout(r, 400));
    this.state.minAgeThreshold = newThreshold;
    this.notify();
  }

  /**
   * Toggles gate active status (Admin Circuit)
   */
  public async toggleGateActive(): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    this.state.gateActive = !this.state.gateActive;
    this.notify();
  }

  /**
   * Reset state to defaults for testing / demo
   */
  public resetToDefaults(): void {
    this.state = { ...INITIAL_STATE };
    this.logs = [...INITIAL_LOGS];
    this.notify();
  }
}
