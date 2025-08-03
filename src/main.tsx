import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import './index.css';

console.log('main.tsx is loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
}