import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error display — catches crashes before React renders
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<div style="font-family:monospace;padding:32px;color:#c00;background:#fff;max-width:900px;margin:0 auto">
      <h2>⚠️ App Error (check console for full trace)</h2>
      <pre style="white-space:pre-wrap;word-break:break-all;background:#f5f5f5;padding:16px;border-radius:8px;font-size:13px">${e.message}\n\n${e.filename}:${e.lineno}</pre>
    </div>`;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[ReturnFlow] Unhandled promise rejection:', e.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

