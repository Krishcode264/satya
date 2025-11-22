import { DashboardHeader } from "../components/DashboardHeader";
import { StatsSection } from "../components/StatsSection";
import { HashChainSection } from "../components/HashChainSection";
import { AttackFeedSection } from "../components/AttackFeedSection";

export default function Dashboard() {
  return (
    <div className="relative">
      <DashboardHeader />

      <div className="p-8 max-w-[1600px] mx-auto">
        <StatsSection />
        <HashChainSection />
        <AttackFeedSection />
      </div>

    </div>
  );
}
