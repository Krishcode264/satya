import { useDashboardStore } from '../store/dashboardStore';

export const StatsSection = () => {
  const stats = useDashboardStore((state) => state.stats);
  
  if (!stats) return null;
  const statCards = [
    { label: 'Total Attacks', value: stats.totalAttacks, color: 'from-accent to-cyan-400', glow: 'accent' },
    { label: 'SQL Injection', value: stats.sqlInjection, color: 'from-red-500 to-pink-500', glow: 'red' },
    { label: 'XSS Attacks', value: stats.xssAttack, color: 'from-cyan-400 to-teal-400', glow: 'cyan' },
    { label: 'Command Injection', value: stats.commandInjection, color: 'from-rose-500 to-red-500', glow: 'rose' },
    { label: 'Directory Traversal', value: stats.dirTraversal, color: 'from-orange-500 to-amber-500', glow: 'orange' },
    { label: 'High-Risk Attacks', value: stats.highRiskCount, color: 'from-yellow-400 to-amber-400', glow: 'yellow' },
    { label: 'Avg Delay Time', value: `${stats.avgDelayTime}s`, color: 'from-accent to-cyan-400', glow: 'accent' },
  ];

  return (
    <section className="relative bg-dark-card/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-dark-border/50 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-accent to-cyan-400 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-accent to-cyan-300 bg-clip-text text-transparent">
            Attack Statistics
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6">
          {statCards.map((stat, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-dark-bg/90 to-dark-bg/50 backdrop-blur-sm border border-dark-border/50 rounded-xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-accent/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`, 
                  backgroundImage: `linear-gradient(135deg, rgba(var(--${stat.glow}-500-rgb), 0.1), transparent)` }}
              ></div>
              <div className="relative z-10">
                <div className={`text-5xl font-extrabold mb-3 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-xs text-text-secondary/80 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl`}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

