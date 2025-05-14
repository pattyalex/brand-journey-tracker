import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './ErrorBoundary'

// Enhanced error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Prevent the error from being swallowed
  event.preventDefault();
});

// Improved unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection caught:', event.reason);
  // Prevent the error from being swallowed
  event.preventDefault();
});

// Get or create root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found, creating one');
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
}

// Robust error handling for rendering
try {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } else {
    throw new Error('Root element not found even after creation attempt');
  }
} catch (error) {
  console.error('Critical error during application rendering:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif;">
      <h1 style="color: #e11d48;">Application Failed to Start</h1>
      <p>The application encountered a critical error during initialization.</p>
      <div style="margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 6px; text-align: left;">
        <strong>Error Details:</strong> ${error instanceof Error ? error.message : 'Unknown error'}
      </div>
      <button style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;" 
              onclick="localStorage.clear(); window.location.reload();">
        Clear Storage & Reload
      </button>
    </div>
  `;
}