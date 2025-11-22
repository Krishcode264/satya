import { useEffect, useRef } from "react";
import axios from "axios";
import { useDashboardStore } from "../store/dashboardStore";
import type { WebSocketMessage, Log, Stats, HashChain } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

// Build WS endpoint correctly
const getWebSocketUrl = (): string => {
  const wsBase = WS_URL.replace(/^http/, "ws").replace(/^https/, "wss");
  return wsBase.endsWith("/ws") ? wsBase : `${wsBase}/ws`;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedInitialData = useRef(false); // ❗ No repeated API calls

  const { setLogs, addLog, setStats, setHashChain, setConnectionStatus } =
    useDashboardStore();

  /**
   * INITIAL API DATA — RUN ONCE ONLY
   */
  const loadInitialDataOnce = async () => {
    if (hasLoadedInitialData.current) return;
    hasLoadedInitialData.current = true;

    try {
      console.log("📡 Fetching initial data from API...");
      const [logsRes, statsRes, chainRes] = await Promise.all([
        axios.get<Log[]>(`${API_URL}/api/logs`),
        axios.get<Stats>(`${API_URL}/api/stats`),
        axios.get<HashChain>(`${API_URL}/api/hash-chain`)
      ]);

      setLogs(logsRes.data);
      setStats(statsRes.data);
      setHashChain(chainRes.data);

      console.log("✅ Initial API data loaded");
    } catch (error) {
      console.error("❌ Error loading initial API data:", error);
      setConnectionStatus("error");
    }
  };

  /**
   * MAIN WEBSOCKET CONNECTOR
   */
  const connectWebSocket = () => {
    if (wsRef.current) return; // ❗ Prevent multiple WebSocket instances

    const wsUrl = getWebSocketUrl();
    console.log("🔌 Connecting WebSocket:", wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setConnectionStatus("connected");

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case "initial":
            console.log("📨 WS delivered initial data");
            if (data.logs) setLogs(data.logs);
            if (data.stats) setStats(data.stats);
            if (data.hashChain) setHashChain(data.hashChain);
            break;

          case "new_attack":
            console.log("🚨 New attack received:", data.log?.attackType);
            if (data.log) addLog(data.log);
            if (data.stats) setStats(data.stats);
            if (data.hashChain) setHashChain(data.hashChain);
            break;

          default:
            console.warn("⚠️ Unknown WS message type:", data.type);
        }
      } catch (err) {
        console.error("❌ WS message parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      setConnectionStatus("error");
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket disconnected");
      setConnectionStatus("disconnected");
      wsRef.current = null;

      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          console.log("🔄 Reconnecting WebSocket…");
          connectWebSocket();
        }, 2000);
      }
    };
  };

  /**
   * MAIN EFFECT — RUNS ONLY ONCE
   */
  useEffect(() => {
    loadInitialDataOnce();
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // ❗ no re-renders, no repeated execution

  return <>{children}</>;
};
