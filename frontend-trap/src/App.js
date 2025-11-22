import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage('');

    try {
      const response = await axios.post(`${API_URL}/api/analyze`, {
        userInput: username,
        page: 'login',
        field: 'username'
      });

      setServerMessage(response.data.message);
    } catch (error) {
      setServerMessage('Connection error. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setServerMessage('');

    try {
      const response = await axios.post(`${API_URL}/api/analyze`, {
        userInput: searchQuery,
        page: 'search',
        field: 'query'
      });

      setServerMessage(response.data.message);
    } catch (error) {
      setServerMessage('Connection error. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Secure Portal</h1>
        <p className="subtitle">Please login to access your account</p>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setServerMessage('');
            }}
          >
            Login
          </button>
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('search');
              setServerMessage('');
            }}
          >
            Search
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="off"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSearch} className="form">
            <div className="form-group">
              <label htmlFor="search">Search Query</label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query"
                required
                autoComplete="off"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        )}

        {isLoading && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}

        {serverMessage && (
          <div className="server-message">
            {serverMessage}
          </div>
        )}

        <div className="footer">
          <p>© 2025 Secure Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default App;

