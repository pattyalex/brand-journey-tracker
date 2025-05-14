
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './ErrorBoundary'
import FallbackPage from './FallbackPage'

// Initialize a flag to check if the app loaded properly
let appLoaded = false;

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error || event.message);
  if (!appLoaded) {
    renderFallbackOnError();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  if (!appLoaded) {
    renderFallbackOnError();
  }
});

// Ensure the DOM is ready before trying to render
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
});

// Create a function to render a simplified fallback on critical errors
function renderFallbackOnError() {
  try {
    const rootElement = document.getElementById('root');
    if (rootElement && !appLoaded) {
      console.log('Rendering emergency fallback UI');
      createRoot(rootElement).render(<FallbackPage />);
    }
  } catch (err) {
    console.error('Failed to render fallback UI:', err);
    
    // Last resort - inject HTML directly
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; min-height: 100vh; align-items: center; justify-content: center; padding: 1rem; background-color: #f9fafb;">
          <div style="width: 100%; max-width: 28rem; padding: 1.5rem; background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            <h2 style="font-size: 1.25rem; font-weight: 600; color: #dc2626; margin-bottom: 1rem;">Application Error</h2>
            <p style="margin-bottom: 1rem; color: #4b5563;">The application encountered a critical error. Please reload the page.</p>
            <button style="width: 100%; padding: 0.5rem 1rem; background-color: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
              onclick="window.location.reload()">
              Reload Application
            </button>
            <button style="width: 100%; margin-top: 0.5rem; padding: 0.5rem 1rem; background-color: #4b5563; color: white; border: none; border-radius: 0.25rem; cursor: pointer;"
              onclick="localStorage.clear(); window.location.href = '/landing';">
              Reset & Go to Landing
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Create root element if it doesn't exist
const rootElement = document.getElementById('root');
if (!rootElement) {
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.warn('Root element not found, created a new one');
}

// Wrapper to mark app as loaded after successful initial render
const AppWithLoadMarker = () => {
  React.useEffect(() => {
    // Set flag to true to indicate the app loaded successfully
    setTimeout(() => { appLoaded = true; }, 500);
  }, []);
  
  return <App />;
};

// Try to render the main app
try {
  console.log('Starting app render...');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <AppWithLoadMarker />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  renderFallbackOnError();
}
