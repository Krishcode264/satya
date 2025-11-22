import { Link, useParams } from "react-router-dom";
import { useDashboardStore } from "../store/dashboardStore";
import IPInfoPopup from "../components/IpInfo";
import { getAttackTypeColor, getSeverityColor, formatTimestamp, escapeHtml } from "../utils/helpers";

export default function LogDetailsPage() {
  const { id } = useParams();
  const logs = useDashboardStore((state) => state.logs);

  const log = logs.find((l) => String(l.id) === String(id));

  if (!log)
    return (
      <div className="p-10 text-center text-xl text-red-400">
        ❌ Log not found
      </div>
    );

  const detailItems = [
    { label: "Timestamp", value: formatTimestamp(log.timestamp) },
    { label: "IP Address", value: log.ip },
    { label: "Page", value: log.page },
    { label: "Field", value: log.field },
  ];

  return (
    <div className="p-10 max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors mb-6 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back</span>
        </Link>

      <h1 className="text-3xl font-bold text-accent mb-6">Attack Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {detailItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-dark-bg/40 p-5 rounded-xl border border-dark-border/40"
          >
            <p className="text-xs text-text-secondary mb-2">{item.label}:</p>
            <p className="text-lg font-semibold">{item.value}</p>

            {item.label === "IP Address" && <IPInfoPopup ip={item.value} />}
          </div>
        ))}

        <div className="bg-dark-bg/40 p-5 rounded-xl border border-dark-border/40">
          <p className="text-xs text-text-secondary mb-2">Attack Type:</p>
          <span
            className="px-4 py-2 rounded-full text-white text-sm font-bold"
            style={{ backgroundColor: getAttackTypeColor(log.attackType) }}
          >
            {log.attackType}
          </span>
        </div>

        <div className="bg-dark-bg/40 p-5 rounded-xl border border-dark-border/40">
          <p className="text-xs text-text-secondary mb-2">Severity:</p>
          <span
            className={`px-4 py-2 rounded-full text-white text-sm font-bold ${getSeverityColor(
              log.severity
            )}`}
          >
            {log.severity} / 5
          </span>
        </div>
      </div>

      {/* Payload */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-3 text-accent">Payload</h2>
        <pre className="bg-dark-bg/40 p-5 rounded-xl border border-dark-border/40 max-h-[200px] overflow-auto text-sm font-mono">
          {escapeHtml(log.input)}
        </pre>
      </div>

      {/* Deception Strategy */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-3 text-accent">Deception Strategy</h2>
        <div className="bg-amber-500/10 border-l-4 border-amber-400 p-5 rounded">
          <p className="text-amber-300 font-medium italic">{log.deceptionUsed}</p>
        </div>
      </div>

      {/* Hash Chain */}
      <div>
        <h2 className="text-xl font-bold mb-3 text-accent">Hash Chain</h2>
        <div className="space-y-3">
          <div className="bg-dark-bg/40 p-5 rounded-xl border border-dark-border/40">
            <p className="text-xs text-text-secondary mb-2">Previous Hash:</p>
            <code className="text-accent text-xs break-all">{log.previousHash}</code>
          </div>

          <div className="bg-dark-bg/40 p-5 rounded-xl border border-dark-border/40">
            <p className="text-xs text-text-secondary mb-2">Current Hash:</p>
            <code className="text-accent text-xs break-all">{log.currentHash}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
