
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use React 18's optimized rendering
// Note: StrictMode disabled to allow react-beautiful-dnd drag and drop to work
createRoot(document.getElementById("root")!).render(
  <App />
);
