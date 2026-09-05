export type MidnightNetwork = 'preprod' | 'preview' | 'local-sandbox';

export interface WalletAccount {
  address: string;
  network: MidnightNetwork;
  shieldedBalance: string;
  unshieldedBalance: string;
  isConnected: boolean;
}

export type ProverStep = 
  | 'idle'
  | 'loading-witness'
  | 'synthesizing-constraints'
  | 'generating-zk-proof'
  | 'verifying-on-chain'
  | 'completed'
  | 'failed';

export interface ProofLogEntry {
  id: string;
  timestamp: number;
  txHash: string;
  proofHash: string;
  isEligible: boolean;
  minAgeRequired: number;
  anonymizedNullifier: string;
  blockHeight: number;
}

export interface ContractState {
  totalVerifications: number;
  minAgeThreshold: number;
  gateActive: boolean;
  adminAddress: string;
  contractAddress: string;
}

export interface ZKProofWitnessInput {
  age: number;
  birthDate?: string;
  salt?: string;
}
