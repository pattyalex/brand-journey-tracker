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

// Enhanced unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection caught:', event.reason);
  
  // Try to identify the source of the error
  let errorMessage = 'Unknown error';
  if (event.reason) {
    errorMessage = event.reason.message || String(event.reason);
    // Log additional details if available
    if (event.reason.stack) {
      console.error('Stack trace:', event.reason.stack);
    }
  }
  
  // Force display an error UI regardless of the app state
  // This is more aggressive, but ensures users see something instead of a white screen
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e11d48;">Application Error</h1>
      <p>The application encountered an error: ${errorMessage}</p>
      <div style="margin: 20px 0; text-align: left; background: #f1f5f9; padding: 10px; border-radius: 4px;">
        <p><strong>Troubleshooting:</strong></p>
        <ul style="margin-left: 20px; list-style-type: disc;">
          <li>This may be caused by corrupted browser data</li>
          <li>Try clearing your browser cache and storage</li>
          <li>Multiple unhandled rejections were detected</li>
        </ul>
      </div>
      <button style="background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px; width: 100%;" 
              onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();">
        Clear Storage & Reload
      </button>
      <button style="background: #4b5563; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px; width: 100%;" 
              onclick="window.location.href='/landing';">
        Go to Landing Page
      </button>
    </div>
  `;
  
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