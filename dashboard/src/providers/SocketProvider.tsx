import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useDashboardStore } from '../store/dashboardStore';
import type { WebSocketMessage, Log, Stats, HashChain } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    setLogs,
    addLog,
    setStats,
    setHashChain,
    setConnectionStatus,
  } = useDashboardStore();

  // Fetch initial data from API endpoints
  const loadInitialData = async () => {
    try {
      console.log('📡 Fetching initial data from API...');
      const [logsRes, statsRes, chainRes] = await Promise.all([
        axios.get<Log[]>(`${API_URL}/api/logs`),
        axios.get<Stats>(`${API_URL}/api/stats`),
        axios.get<HashChain>(`${API_URL}/api/hash-chain`)
      ]);

      setLogs(logsRes.data);
      setStats(statsRes.data);
      setHashChain(chainRes.data);
      console.log('✅ Initial data loaded:', {
        logs: logsRes.data.length,
        stats: statsRes.data,
        chainLength: chainRes.data.chainLength
      });
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      setConnectionStatus('error');
    }
  };

  // Connect to WebSocket for real-time updates
  const connectWebSocket = () => {
    try {
      const wsUrl = getWebSocketUrl();
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus('connected');
        // Clear any pending reconnection
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          if (data.type === 'initial') {
            // WebSocket also sends initial data (backup)
            console.log('📨 Received initial data from WebSocket');
            if (data.logs) setLogs(data.logs);
            if (data.stats) setStats(data.stats);
            if (data.hashChain) setHashChain(data.hashChain);
          } else if (data.type === 'new_attack') {
            // Real-time update for new attack
            console.log('🚨 New attack received via WebSocket:', data.log?.attackType);
            if (data.log) {
              addLog(data.log);
            }
            if (data.stats) setStats(data.stats);
            if (data.hashChain) setHashChain(data.hashChain);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('⚠️ WebSocket disconnected');
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect after 3 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            console.log('🔄 Attempting to reconnect WebSocket...');
            connectWebSocket();
          }, 3000);
        }
      };
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    // Load initial data from API first
    loadInitialData();

    // Then connect to WebSocket for real-time updates
    connectWebSocket();

    // Fallback polling if WebSocket fails (every 5 seconds)
    const pollInterval = setInterval(() => {
      const status = useDashboardStore.getState().connectionStatus;
      if (status === 'disconnected' || status === 'error') {
        console.log('🔄 Polling for updates (WebSocket disconnected)...');
        loadInitialData();
      }
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty deps - only run once on mount

  return <>{children}</>;
};
