import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import type { WebSocketMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

// Construct WebSocket URL
const getWebSocketUrl = () => {
  const baseUrl = WS_URL.replace(/^http/, 'ws').replace(/^https/, 'wss');
  return baseUrl.endsWith('/ws') ? baseUrl : `${baseUrl}/ws`;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const wsRef = useRef<WebSocket | null>(null);

  const {
    setLogs,
    addLog,
    setStats,
    setHashChain,
    setConnectionStatus,
  } = useDashboardStore();

  useEffect(() => {
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === 'initial') {
          if (data.logs) setLogs(data.logs);
          if (data.stats) setStats(data.stats);
          if (data.hashChain) setHashChain(data.hashChain);
        } else if (data.type === 'new_attack') {
          if (data.log) {
            addLog(data.log);
          }
          if (data.stats) setStats(data.stats);
          if (data.hashChain) setHashChain(data.hashChain);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('error');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [setLogs, addLog, setStats, setHashChain, setConnectionStatus]);

  return <>{children}</>;
};
