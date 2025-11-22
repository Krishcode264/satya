import { useNavigate } from "react-router-dom";
import { useDashboardStore } from '../store/dashboardStore';
import { getAttackTypeColor, formatTimestamp, getSeverityColor } from '../utils/helpers';

export const AttackFeedSection = () => {
  const logs = useDashboardStore((state) => state.logs);
  const navigate = useNavigate();
  return (
    <section className="relative bg-dark-card/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-dark-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Live Attack Feed
          </h2>
        </div>
        {logs.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-dark-border/50">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gradient-to-r from-dark-bg/90 to-dark-bg/50 backdrop-blur-sm border-b border-dark-border/50">
                <tr>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">Timestamp</th>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">Attack Type</th>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">Input (Preview)</th>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">IP Address</th>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">Page</th>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">Deception Used</th>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">Severity</th>
                  <th className="p-4 text-left font-bold text-accent/90 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-b border-dark-border/30 hover:bg-gradient-to-r hover:from-dark-bg/50 hover:to-dark-bg/30 transition-all duration-200 group"
                  >
                    <td className="p-4 text-text-primary/90 font-medium">{formatTimestamp(log.timestamp)}</td>
                    <td className="p-4">
                      <span
                        className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-lg"
                        style={{ backgroundColor: getAttackTypeColor(log.attackType) }}
                      >
                        {log.attackType}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-text-secondary/80 max-w-[200px] truncate bg-dark-bg/30 px-3 py-2 rounded border border-dark-border/30">
                      {log.input.length > 50 ? `${log.input.substring(0, 50)}...` : log.input}
                    </td>
                    <td className="p-4 text-text-primary/90 font-mono text-xs">{log.ip}</td>
                    <td className="p-4 text-text-primary/90">{log.page}</td>
                    <td className="p-4 text-amber-400 text-sm italic max-w-[250px] font-medium">{log.deceptionUsed}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        className="px-4 py-2 bg-gradient-to-r from-accent to-cyan-400 text-dark-bg border-none rounded-lg font-bold text-xs cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                        onClick={() => navigate(`/logs/${log.id}`)}
                        >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-dark-bg/30 to-dark-bg/10 rounded-xl border border-dark-border/50">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-text-secondary/60 italic text-base">
              No attacks logged yet. Waiting for activity...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

