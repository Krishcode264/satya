import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SocketProvider } from './providers/SocketProvider';
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <SocketProvider>
    <BrowserRouter>
      <App />
      </BrowserRouter>
    </SocketProvider>
  </React.StrictMode>
);

