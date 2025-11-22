import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [hashChain, setHashChain] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);

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

  const loadInitialData = async () => {
    try {
      const [logsRes, statsRes, chainRes] = await Promise.all([
        axios.get(`${API_URL}/api/logs`),
        axios.get(`${API_URL}/api/stats`),
        axios.get(`${API_URL}/api/hash-chain`)
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
        const data = JSON.parse(event.data);
        
        if (data.type === 'initial') {
          setLogs(data.logs);
          setStats(data.stats);
          setHashChain(data.hashChain);
        } else if (data.type === 'new_attack') {
          setLogs(prevLogs => [data.log, ...prevLogs]);
          setStats(data.stats);
          setHashChain(data.hashChain);
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

  const getAttackTypeColor = (type) => {
    const colors = {
      SQL_INJECTION: '#ff6b6b',
      XSS_ATTACK: '#4ecdc4',
      COMMAND_INJECTION: '#ff4757',
      DIR_TRAVERSAL: '#ffa502',
      UNKNOWN_SUSPICIOUS: '#ffd32a',
      NORMAL: '#95a5a6'
    };
    return colors[type] || '#95a5a6';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🦎 CHAMELEON Forensic Dashboard</h1>
        <div className="status-indicator">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span>{connectionStatus === 'connected' ? 'Live' : 'Disconnected'}</span>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Statistics Section */}
        {stats && (
          <section className="stats-section">
            <h2>Attack Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalAttacks}</div>
                <div className="stat-label">Total Attacks</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#ff6b6b' }}>
                  {stats.sqlInjection}
                </div>
                <div className="stat-label">SQL Injection</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#4ecdc4' }}>
                  {stats.xssAttack}
                </div>
                <div className="stat-label">XSS Attacks</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#ff4757' }}>
                  {stats.commandInjection}
                </div>
                <div className="stat-label">Command Injection</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#ffa502' }}>
                  {stats.dirTraversal}
                </div>
                <div className="stat-label">Directory Traversal</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#ffd32a' }}>
                  {stats.highRiskCount}
                </div>
                <div className="stat-label">High-Risk Attacks</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgDelayTime}s</div>
                <div className="stat-label">Avg Delay Time</div>
              </div>
            </div>
          </section>
        )}

        {/* Hash Chain Section */}
        {hashChain && (
          <section className="hash-chain-section">
            <h2>Hash Chain (Blockchain-style Immutability)</h2>
            <div className="hash-chain-info">
              <div className="hash-item">
                <span className="hash-label">Genesis Hash:</span>
                <code className="hash-value">
                  {hashChain.genesisHash || 'N/A'}
                </code>
              </div>
              <div className="hash-item">
                <span className="hash-label">Latest Hash:</span>
                <code className="hash-value">
                  {hashChain.latestHash || 'N/A'}
                </code>
              </div>
              <div className="hash-item">
                <span className="hash-label">Chain Length:</span>
                <span className="hash-value">{hashChain.chainLength}</span>
              </div>
            </div>
            <div className="recent-hashes">
              <h3>Recent Chain Entries (Last 5)</h3>
              {hashChain.recentEntries && hashChain.recentEntries.length > 0 ? (
                <div className="hash-list">
                  {hashChain.recentEntries.map((entry, idx) => (
                    <div key={idx} className="hash-entry">
                      <div className="hash-entry-header">
                        <span className="attack-type-badge" style={{ backgroundColor: getAttackTypeColor(entry.attackType) }}>
                          {entry.attackType}
                        </span>
                        <span className="hash-entry-time">{formatTimestamp(entry.timestamp)}</span>
                      </div>
                      <code className="hash-entry-hash">{entry.hash}</code>
                      <div className="hash-entry-input">{entry.input}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No chain entries yet</p>
              )}
            </div>
            <div className="chain-explanation">
              <p>
                <strong>How it works:</strong> Each log entry's hash is calculated using the previous entry's hash,
                creating an immutable chain. Any modification to a log entry would break the chain integrity.
              </p>
            </div>
          </section>
        )}

        {/* Live Attack Feed */}
        <section className="attack-feed-section">
          <h2>Live Attack Feed</h2>
          {logs.length > 0 ? (
            <div className="attack-table-container">
              <table className="attack-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Attack Type</th>
                    <th>Input (Preview)</th>
                    <th>IP Address</th>
                    <th>Page</th>
                    <th>Deception Used</th>
                    <th>Severity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="attack-row">
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>
                        <span
                          className="attack-type-badge"
                          style={{ backgroundColor: getAttackTypeColor(log.attackType) }}
                        >
                          {log.attackType}
                        </span>
                      </td>
                      <td className="input-preview">
                        {log.input.length > 50
                          ? `${log.input.substring(0, 50)}...`
                          : log.input}
                      </td>
                      <td>{log.ip}</td>
                      <td>{log.page}</td>
                      <td className="deception-text">{log.deceptionUsed}</td>
                      <td>
                        <span className={`severity-badge severity-${log.severity}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-details-btn"
                          onClick={() => setSelectedLog(log)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No attacks logged yet. Waiting for activity...</p>
          )}
        </section>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attack Details</h2>
              <button className="close-btn" onClick={() => setSelectedLog(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">{formatTimestamp(selectedLog.timestamp)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Attack Type:</span>
                    <span
                      className="detail-value attack-type-badge"
                      style={{ backgroundColor: getAttackTypeColor(selectedLog.attackType) }}
                    >
                      {selectedLog.attackType}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Severity:</span>
                    <span className={`detail-value severity-badge severity-${selectedLog.severity}`}>
                      {selectedLog.severity} / 5
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">IP Address:</span>
                    <span className="detail-value">{selectedLog.ip}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Page:</span>
                    <span className="detail-value">{selectedLog.page}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Field:</span>
                    <span className="detail-value">{selectedLog.field}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Full Payload</h3>
                <pre className="payload-display">{escapeHtml(selectedLog.input)}</pre>
              </div>

              <div className="detail-section">
                <h3>Deception Strategy</h3>
                <p className="deception-text">{selectedLog.deceptionUsed}</p>
              </div>

              <div className="detail-section">
                <h3>Hash Chain Information</h3>
                <div className="hash-details">
                  <div className="hash-detail-item">
                    <span className="hash-label">Previous Hash:</span>
                    <code className="hash-code">
                      {selectedLog.previousHash || 'Genesis (First Entry)'}
                    </code>
                  </div>
                  <div className="hash-detail-item">
                    <span className="hash-label">Current Hash:</span>
                    <code className="hash-code">{selectedLog.currentHash}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

