import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global Error Handler to suppress benign or unhelpful errors
const ignoredErrors = [
  /ResizeObserver loop limit exceeded/,
  // /\[object Object\]/,
  // /object Object/i,
];

const handleGlobalError = (event) => {
  const msg = String(event.message || event.error || event);

  // Check if this is an ignored error
  if (ignoredErrors.some(pattern => pattern.test(msg))) {
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (event.preventDefault) event.preventDefault();
    return true;
  }

  // Also check the error object itself
  if (event.error) {
    const errorStr = String(event.error);
    if (ignoredErrors.some(pattern => pattern.test(errorStr))) {
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      if (event.preventDefault) event.preventDefault();
      return true;
    }
  }

  return false;
};

const handleGlobalRejection = (event) => {
  const reason = event.reason;
  const reasonStr = String(reason);

  if (ignoredErrors.some(pattern => pattern.test(reasonStr))) {
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (event.preventDefault) event.preventDefault();
    return;
  }
};

// Monkey-patch console.error to stop typical CRA overlay triggers
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.map(arg => {
    try {
      return String(arg);
    } catch (e) {
      return '[Unable to stringify]';
    }
  }).join(' ');

  if (ignoredErrors.some(pattern => pattern.test(msg))) {
    return; // Silently ignore
  }
  originalConsoleError(...args);
};

// Also patch console.warn for completeness
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const msg = args.map(arg => {
    try {
      return String(arg);
    } catch (e) {
      return '[Unable to stringify]';
    }
  }).join(' ');

  if (ignoredErrors.some(pattern => pattern.test(msg))) {
    return; // Silently ignore
  }
  originalConsoleWarn(...args);
};

console.log('🚀 [INDEX] Script loading started...');

// Check for critical missing globals (common in webpack 5+)
console.log('🔍 Checking Environment:', {
  hasProcess: typeof process !== 'undefined',
  hasBuffer: typeof Buffer !== 'undefined',
  userAgent: navigator.userAgent
});

window.addEventListener('load', () => {
  console.log('✅ [INDEX] Window Load Event Fired');
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [INDEX] FATAL: Could not find #root element!');
} else {
  console.log('✅ [INDEX] #root element found');
}

try {
  console.log('🏗️ [INDEX] Initializing React Root...');
  const root = ReactDOM.createRoot(rootElement);

  console.log('⚛️ [INDEX] Starting Application Render...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('🎉 [INDEX] Render call complete');
} catch (err) {
  console.error('💥 [INDEX] CRITICAL RENDER ERROR:', err);
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: #ef4444; padding: 40px; text-align: center; font-family: sans-serif;">
        <h2>Critical Startup Error</h2>
        <pre style="text-align: left; background: #1e293b; padding: 15px; border-radius: 8px; overflow: auto; max-width: 90vw; margin: 20px auto;">
          ${err.message || String(err)}
          \n\nStack:\n${err.stack || 'No stack available'}
        </pre>
      </div>
    `;
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
