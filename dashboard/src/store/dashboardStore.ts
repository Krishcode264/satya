import { create } from 'zustand';
import type { Log, Stats, HashChain, ConnectionStatus } from '../types';

export interface DashboardState {
  // State
  logs: Log[];
  stats: Stats | null;
  hashChain: HashChain | null;
  connectionStatus: ConnectionStatus;
  selectedLog: Log | null;
  
  // Actions
  setLogs: (logs: Log[]) => void;
  addLog: (log: Log) => void;
  setStats: (stats: Stats | null) => void;
  setHashChain: (hashChain: HashChain | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSelectedLog: (log: Log | null) => void;
  reset: () => void;
}

const initialState = {
  logs: [],
  stats: null,
  hashChain: null,
  connectionStatus: 'disconnected' as ConnectionStatus,
  selectedLog: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  ...initialState,
  
  setLogs: (logs) => set({ logs }),
  
  addLog: (log) => set((state) => ({
    logs: [log, ...state.logs]
  })),
  
  setStats: (stats) => set({ stats }),
  
  setHashChain: (hashChain) => set({ hashChain }),
  
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  
  setSelectedLog: (selectedLog) => set({ selectedLog }),
  
  reset: () => set(initialState),
}));

