import { useDashboardStore } from '../store/dashboardStore';
import { getAttackTypeColor, formatTimestamp, escapeHtml, getSeverityColor } from '../utils/helpers';

export const LogDetailsModal = () => {
  const selectedLog = useDashboardStore((state) => state.selectedLog);
  const setSelectedLog = useDashboardStore((state) => state.setSelectedLog);
  
  if (!selectedLog) return null;
  
  const log = selectedLog;
  const onClose = () => setSelectedLog(null);
  const detailItems = [
    { label: 'Timestamp', value: formatTimestamp(log.timestamp) },
    { label: 'IP Address', value: log.ip },
    { label: 'Page', value: log.page },
    { label: 'Field', value: log.field },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[1000] p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-dark-card/95 to-dark-card/80 backdrop-blur-xl border-2 border-dark-border/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-dark-card/95 to-dark-card/80 backdrop-blur-xl border-b border-dark-border/50 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-cyan-400 bg-clip-text text-transparent">
              Attack Details
            </h2>
            <p className="text-xs text-text-secondary/60 mt-1">Comprehensive attack information</p>
          </div>
          <button
            className="bg-dark-bg/50 hover:bg-dark-bg border border-dark-border/50 text-text-secondary hover:text-text-primary text-2xl cursor-pointer leading-none p-2 w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1 w-8 bg-gradient-to-r from-accent to-cyan-400 rounded-full"></div>
              <h3 className="text-xl font-bold text-accent">Basic Information</h3>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
              {detailItems.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-dark-bg/50 to-dark-bg/30 backdrop-blur-sm border border-dark-border/30 rounded-xl p-4 hover:border-accent/30 transition-all duration-200">
                  <span className="text-xs text-text-secondary/70 uppercase tracking-wider font-semibold block mb-2">{item.label}:</span>
                  <span className="text-sm text-text-primary font-medium">{item.value}</span>
                </div>
              ))}
              <div className="bg-gradient-to-br from-dark-bg/50 to-dark-bg/30 backdrop-blur-sm border border-dark-border/30 rounded-xl p-4 hover:border-accent/30 transition-all duration-200">
                <span className="text-xs text-text-secondary/70 uppercase tracking-wider font-semibold block mb-2">Attack Type:</span>
                <span
                  className="inline-block w-fit px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide text-white shadow-lg"
                  style={{ backgroundColor: getAttackTypeColor(log.attackType) }}
                >
                  {log.attackType}
                </span>
              </div>
              <div className="bg-gradient-to-br from-dark-bg/50 to-dark-bg/30 backdrop-blur-sm border border-dark-border/30 rounded-xl p-4 hover:border-accent/30 transition-all duration-200">
                <span className="text-xs text-text-secondary/70 uppercase tracking-wider font-semibold block mb-2">Severity:</span>
                <span className={`inline-block w-fit px-4 py-2 rounded-full text-xs font-bold text-white shadow-md ${getSeverityColor(log.severity)}`}>
                  {log.severity} / 5
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1 w-8 bg-gradient-to-r from-accent to-cyan-400 rounded-full"></div>
              <h3 className="text-xl font-bold text-accent">Full Payload</h3>
            </div>
            <pre className="bg-gradient-to-br from-dark-bg/80 to-dark-bg/50 backdrop-blur-sm border border-dark-border/50 rounded-xl p-5 font-mono text-sm text-accent whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto shadow-inner">
              {escapeHtml(log.input)}
            </pre>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1 w-8 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
              <h3 className="text-xl font-bold text-accent">Deception Strategy</h3>
            </div>
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-l-4 border-amber-400 rounded-xl p-5">
              <p className="text-amber-300 text-base italic font-medium">{log.deceptionUsed}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-accent">Hash Chain Information</h3>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-dark-bg/50 to-dark-bg/30 backdrop-blur-sm border border-dark-border/30 rounded-xl p-5 hover:border-accent/30 transition-all duration-200">
                <span className="font-semibold text-text-secondary/80 text-sm block mb-3">Previous Hash:</span>
                <code className="text-accent font-mono text-xs break-all bg-dark-bg/50 px-4 py-3 rounded-lg border border-accent/20 block">
                  {log.previousHash || 'Genesis (First Entry)'}
                </code>
              </div>
              <div className="bg-gradient-to-br from-dark-bg/50 to-dark-bg/30 backdrop-blur-sm border border-dark-border/30 rounded-xl p-5 hover:border-accent/30 transition-all duration-200">
                <span className="font-semibold text-text-secondary/80 text-sm block mb-3">Current Hash:</span>
                <code className="text-accent font-mono text-xs break-all bg-dark-bg/50 px-4 py-3 rounded-lg border border-accent/20 block">{log.currentHash}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

