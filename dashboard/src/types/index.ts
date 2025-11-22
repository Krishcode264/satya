export interface Log {
  id: string;
  timestamp: string;
  attackType: string;
  input: string;
  ip: string;
  page: string;
  field: string;
  deceptionUsed: string;
  severity: number;
  previousHash?: string;
  currentHash: string;
}

export interface Stats {
  totalAttacks: number;
  sqlInjection: number;
  xssAttack: number;
  commandInjection: number;
  dirTraversal: number;
  highRiskCount: number;
  avgDelayTime: number;
}

export interface HashChain {
  genesisHash: string | null;
  latestHash: string | null;
  chainLength: number;
  recentEntries: Array<{
    attackType: string;
    timestamp: string;
    hash: string;
    input: string;
  }>;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export type AttackType = 'SQL_INJECTION' | 'XSS_ATTACK' | 'COMMAND_INJECTION' | 'DIR_TRAVERSAL' | 'UNKNOWN_SUSPICIOUS' | 'NORMAL';

export interface WebSocketMessage {
  type: 'initial' | 'new_attack';
  logs?: Log[];
  log?: Log;
  stats?: Stats;
  hashChain?: HashChain;
}

