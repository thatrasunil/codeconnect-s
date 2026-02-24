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

window.addEventListener('error', handleGlobalError, true); // Use capture phase
window.addEventListener('unhandledrejection', handleGlobalRejection, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
