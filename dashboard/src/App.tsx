import { DashboardHeader } from './components/DashboardHeader';
import { StatsSection } from './components/StatsSection';
import { HashChainSection } from './components/HashChainSection';
import { AttackFeedSection } from './components/AttackFeedSection';
import { LogDetailsModal } from './components/LogDetailsModal';

function App() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-[#0a0a1a] text-text-primary relative overflow-x-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <DashboardHeader />

        <div className="p-8 max-w-[1600px] mx-auto">
          <StatsSection />
          <HashChainSection />
          <AttackFeedSection />
        </div>

        <LogDetailsModal />
      </div>
    </div>
  );
}

export default App;
