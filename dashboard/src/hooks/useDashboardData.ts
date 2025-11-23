import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { Log, Stats, HashChain, ConnectionStatus, WebSocketMessage } from '../types';

const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export const useDashboardData = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [hashChain, setHashChain] = useState<HashChain | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  const loadInitialData = async () => {
    try {
      const [logsRes, statsRes, chainRes] = await Promise.all([
        axios.get<Log[]>(`${API_URL}/api/logs`),
        axios.get<Stats>(`${API_URL}/api/stats`),
        axios.get<HashChain>(`${API_URL}/api/hash-chain`)
      ]);

      setLogs(logsRes.data);
      setStats(statsRes.data);
      setHashChain(chainRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setConnectionStatus('disconnected');
    }
  };

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        if (data.type === 'initial') {
          if (data.logs) setLogs(data.logs);
          if (data.stats) setStats(data.stats);
          if (data.hashChain) setHashChain(data.hashChain);
        } else if (data.type === 'new_attack') {
          if (data.log) {
            setLogs(prevLogs => [data.log!, ...prevLogs]);
          }
          if (data.stats) setStats(data.stats);
          if (data.hashChain) setHashChain(data.hashChain);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    // Initial data load
    loadInitialData();

    // Setup WebSocket connection
    connectWebSocket();

    // Fallback polling if WebSocket fails
    const pollInterval = setInterval(() => {
      if (connectionStatus === 'disconnected') {
        loadInitialData();
      }
    }, 2000);

    return () => {
      clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    logs,
    stats,
    hashChain,
    connectionStatus,
  };
};


