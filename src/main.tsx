import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import NuminosEmbed from './components/NuminosEmbed';
import './index.css';

console.log('main.tsx is loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

// Global error handlers to surface async/unhandled errors to the page
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error captured:', event.error || event.message);
    try {
      if (rootElement) {
        rootElement.innerHTML = `<pre style="color: white; background: #7f1d1d; padding: 16px; font-family: monospace;">Global error:\n${(event.error && event.error.stack) || event.message || String(event.error)}</pre>`;
      }
    } catch (e) {
      console.error('Failed to render global error to DOM:', e);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    try {
      if (rootElement) {
        rootElement.innerHTML = `<pre style="color: white; background: #7f1d1d; padding: 16px; font-family: monospace;">Unhandled rejection:\n${(event.reason && event.reason.stack) || String(event.reason)}</pre>`;
      }
    } catch (e) {
      console.error('Failed to render rejection to DOM:', e);
    }
  });
}

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log('React root created');

    root.render(
      <React.StrictMode>
        <App />
        <NuminosEmbed />
      </React.StrictMode>
    );

    console.log('React app rendered');
  } catch (err) {
    console.error('Error during initial React render:', err);
    // Display error on the page so it's visible to the developer
    try {
      rootElement.innerHTML = `<pre style="color: white; background: #7f1d1d; padding: 16px; font-family: monospace;">Error during initial render:\n${(err as Error).stack || (err as any).message || String(err)}</pre>`;
    } catch (innerErr) {
      console.error('Failed to write render error to DOM:', innerErr);
    }
  }
} else {
  console.error('Root element not found!');
}