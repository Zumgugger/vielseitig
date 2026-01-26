/**
 * Format ISO date string to German locale
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date (e.g. "15.12.2026, 10:30 Uhr")
 */
export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format duration in milliseconds to human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g. "2m 30s")
 */
export const formatDuration = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success or failure
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Generate a random color (for themes, avatars, etc)
 * @returns {string} Hex color code
 */
export const getRandomColor = () => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Debounce function for search inputs, etc
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if URL is valid
 * @param {string} urlString - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (_) {
    return false;
  }
};
