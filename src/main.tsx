import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './ErrorBoundary'

// Global error handler for unexpected errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Global error handling for unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

// Get or create root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found, creating one');
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
}

// Basic error handler to catch render errors
try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Error rendering application:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Unable to start application</h1>
      <p>There was a critical error starting the application. Please refresh the page.</p>
      <button onclick="window.location.reload()">Refresh Page</button>
    </div>
  `;
}