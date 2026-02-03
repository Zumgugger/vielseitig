import { useState, useEffect } from 'react';

/**
 * Enhanced Toast component with retry support
 * 
 * Props:
 * - message: string or object with { title, detail } for detailed errors
 * - type: 'info' | 'success' | 'error' | 'warning'
 * - duration: auto-dismiss time in ms (0 = no auto-dismiss)
 * - onClose: callback when toast is dismissed
 * - onRetry: optional callback for retry button (shows retry button if provided)
 * - persistent: if true, won't auto-dismiss
 */
export default function Toast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  onRetry,
  persistent = false
}) {
  useEffect(() => {
    // Don't auto-dismiss if persistent, has retry, or duration is 0
    if (persistent || onRetry || duration === 0) return;
    
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose, onRetry, persistent]);

  // Handle different message formats
  let title = '';
  let detail = '';
  
  if (typeof message === 'string') {
    title = message;
  } else if (typeof message === 'object' && message !== null) {
    title = message.title || message.message || 'Fehler';
    detail = message.detail || message.description || '';
  } else {
    title = JSON.stringify(message);
  }

  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }[type];

  const textColor = {
    info: 'text-blue-800',
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
  }[type];

  const icon = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }[type];

  const buttonColor = {
    info: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    success: 'bg-green-100 hover:bg-green-200 text-green-800',
    error: 'bg-red-100 hover:bg-red-200 text-red-800',
    warning: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
  }[type];

  return (
    <div className={`fixed top-4 right-4 p-4 border rounded-lg ${bgColor} ${textColor} max-w-sm z-50 shadow-lg`}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{title}</p>
          {detail && (
            <p className="text-sm opacity-80 mt-1">{detail}</p>
          )}
          
          {/* Action buttons */}
          {(onRetry || onClose) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`px-3 py-1 text-sm font-medium rounded ${buttonColor} transition-colors`}
                >
                  🔄 Erneut versuchen
                </button>
              )}
              {onClose && (onRetry || persistent) && (
                <button
                  onClick={onClose}
                  className="px-3 py-1 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Schließen
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Close button (always visible) */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Schließen"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
