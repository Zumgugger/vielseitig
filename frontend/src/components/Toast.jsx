import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const text = typeof message === 'string' ? message : JSON.stringify(message);

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

  return (
    <div className={`fixed top-4 right-4 p-4 border rounded-lg ${bgColor} ${textColor} max-w-sm z-50 shadow-lg`}>
      {text}
    </div>
  );
}
