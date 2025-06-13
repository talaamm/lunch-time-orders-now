
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Auto-close or remove the Lovable badge if present
window.addEventListener('DOMContentLoaded', function() {
  var closeBtn = document.getElementById('lovable-badge-close');
  if (closeBtn) {
    closeBtn.click();
    console.log('closeBtn clicked');
  }
  var badge = document.getElementById('lovable-badge');
  if (badge) {
    badge.remove();
    console.log('badge removed');
  }
});