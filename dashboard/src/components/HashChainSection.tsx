import { useDashboardStore } from '../store/dashboardStore';
import { getAttackTypeColor, formatTimestamp } from '../utils/helpers';

export const HashChainSection = () => {
  const hashChain = useDashboardStore((state) => state.hashChain);
  
  if (!hashChain) return null;
  return (
    <section className="relative bg-dark-card/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-dark-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hash Chain (Blockchain-style Immutability)
          </h2>
        </div>
        
        <div className="flex flex-col gap-4 mb-8">
          <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-dark-bg/90 to-dark-bg/50 backdrop-blur-sm rounded-xl border border-dark-border/50 hover:border-accent/30 transition-all duration-300">
            <span className="font-semibold text-text-secondary/80 min-w-[140px] text-sm">Genesis Hash:</span>
            <code className="text-accent font-mono text-sm break-all bg-dark-bg/50 px-3 py-1.5 rounded-lg border border-accent/20">
              {hashChain.genesisHash || 'N/A'}
            </code>
          </div>
          <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-dark-bg/90 to-dark-bg/50 backdrop-blur-sm rounded-xl border border-dark-border/50 hover:border-accent/30 transition-all duration-300">
            <span className="font-semibold text-text-secondary/80 min-w-[140px] text-sm">Latest Hash:</span>
            <code className="text-accent font-mono text-sm break-all bg-dark-bg/50 px-3 py-1.5 rounded-lg border border-accent/20">
              {hashChain.latestHash || 'N/A'}
            </code>
          </div>
          <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-dark-bg/90 to-dark-bg/50 backdrop-blur-sm rounded-xl border border-dark-border/50 hover:border-accent/30 transition-all duration-300">
            <span className="font-semibold text-text-secondary/80 min-w-[140px] text-sm">Chain Length:</span>
            <span className="text-accent font-mono text-lg font-bold bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
              {hashChain.chainLength}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg mb-5 text-accent font-semibold">Recent Chain Entries (Last 5)</h3>
          {hashChain.recentEntries && hashChain.recentEntries.length > 0 ? (
            <div className="flex flex-col gap-4">
              {hashChain.recentEntries.map((entry, idx) => (
                <div key={idx} className="group relative bg-gradient-to-br from-dark-bg/90 to-dark-bg/50 backdrop-blur-sm border border-dark-border/50 rounded-xl p-5 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-lg"
                      style={{ backgroundColor: getAttackTypeColor(entry.attackType) }}
                    >
                      {entry.attackType}
                    </span>
                    <span className="text-xs text-text-secondary/70 font-medium">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  <code className="block text-accent font-mono text-xs break-all mb-3 bg-dark-bg/50 px-3 py-2 rounded-lg border border-accent/20">
                    {entry.hash}
                  </code>
                  <div className="text-text-primary/90 text-sm italic pl-2 border-l-2 border-accent/30">{entry.input}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary/60 py-12 italic bg-dark-bg/30 rounded-xl border border-dark-border/50">
              No chain entries yet
            </p>
          )}
        </div>

        <div className="mt-6 p-5 bg-gradient-to-r from-dark-bg/90 to-dark-bg/50 backdrop-blur-sm border-l-4 border-accent rounded-xl border border-dark-border/50">
          <p className="text-text-secondary/80 leading-relaxed text-sm">
            <strong className="text-accent">How it works:</strong> Each log entry's hash is calculated using the previous entry's hash,
            creating an immutable chain. Any modification to a log entry would break the chain integrity.
          </p>
        </div>
      </div>
    </section>
  );
};

