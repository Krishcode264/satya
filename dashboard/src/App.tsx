import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AttackersList from "./pages/AttackersList";
import AttackerDetails from "./pages/AttackerDetails";
import LogDetailsPage from "./pages/LogDetailsPage";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-[#0a0a1a] text-text-primary relative overflow-x-hidden">

      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">

        {/* ROUTES */}
        <Routes>

          {/* Main dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* List of attackers */}
          <Route path="/attackers" element={<AttackersList />} />

          {/* Attacker details page */}
          <Route path="/attackers/:fingerprint" element={<AttackerDetails />} />
          <Route path="/logs/:id" element={<LogDetailsPage />} />

        </Routes>

      </div>
    </div>
  );
}

export default App;
