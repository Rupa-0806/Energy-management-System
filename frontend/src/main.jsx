import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Validate environment configuration on startup
import { validateEnvironment } from './utils/validateEnv';
validateEnvironment(import.meta.env.PROD);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
