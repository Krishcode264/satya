import { useDashboardStore } from '../store/dashboardStore';
import type { DashboardState } from '../store/dashboardStore';

export const DashboardHeader = () => {
  const connectionStatus = useDashboardStore((state: DashboardState) => state.connectionStatus);
  const getStatusStyles = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          dot: 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 border-emerald-500/30'
        };
      case 'error':
        return {
          dot: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 border-amber-500/30'
        };
      default:
        return {
          dot: 'bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.6)]',
          text: 'text-red-400',
          badge: 'bg-red-500/20 border-red-500/30'
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <header className="relative bg-gradient-to-r from-dark-card via-dark-card/95 to-dark-card px-10 py-6 flex justify-between items-center border-b border-dark-border/50 backdrop-blur-sm shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent"></div>
      <div className="relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent via-cyan-300 to-accent bg-clip-text text-transparent">
          🦎 CHAMELEON Forensic Dashboard
        </h1>
        <p className="text-xs text-text-secondary/70 mt-1">Real-time Security Monitoring</p>
      </div>
      <div className="relative z-10 flex items-center gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusStyles.badge} backdrop-blur-sm`}>
          <span className={`w-2.5 h-2.5 rounded-full ${statusStyles.dot}`}></span>
          <span className={`text-sm font-medium ${statusStyles.text}`}>
            {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'error' ? 'Warning' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
};

