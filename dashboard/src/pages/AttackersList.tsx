"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// ----------------------
// TYPE DEFINITIONS
// ----------------------
interface Attacker {
  ip: string;
  fingerprint: string;
  totalAttacks: number;
  lastSeen: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AttackersResponse {
  attackers: Attacker[];
}

export default function AttackersList() {
  const [attackers, setAttackers] = useState<Attacker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ FIXED: correct state destructuring
  const [, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get<AttackersResponse>(`${import.meta.env.VITE_API_URL}/api/report/attackers`)
      .then((res) => {
        setAttackers(res.data.attackers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 md:p-12">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 text-transparent bg-clip-text animate-in fade-in slide-in-from-top-4 duration-700">
          Threat Intelligence
        </h1>
        <p className="text-slate-400 text-lg animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
          Monitor and analyze attack patterns across your infrastructure
        </p>

        {/* Stats Bar */}
        <div className="flex gap-6 mt-8 flex-wrap">
          <div className="flex items-center gap-3 animate-in fade-in duration-700 delay-200">
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
            <span className="text-sm text-slate-300">
              Active Threats:{" "}
              <span className="font-bold text-blue-300">{attackers.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="relative w-12 h-12 border-2 border-slate-700 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attackers.map((atk, index) => (
            <Link
              key={atk.fingerprint}
              to={`/attackers/${atk.fingerprint}`}
              className="group relative overflow-hidden"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="absolute inset-0 rounded-xl border border-slate-700 group-hover:border-blue-500/50 transition-colors duration-500 pointer-events-none"></div>

              <div className="relative p-6 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 transform group-hover:translate-y-[-4px] group-hover:shadow-xl group-hover:shadow-blue-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-blue-300 font-bold text-lg group-hover:text-blue-200 transition-colors">
                      {atk.ip}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                      Fingerprint: {atk.fingerprint}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50 group-hover:shadow-blue-300/80 transition-shadow"></div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Attacks</span>
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/50 rounded-full text-sm font-semibold text-blue-300">
                      {atk.totalAttacks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">Last Seen</span>
                    <span className="text-xs text-slate-300">
                      {new Date(atk.lastSeen).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
