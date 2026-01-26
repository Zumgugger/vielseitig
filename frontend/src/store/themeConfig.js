/**
 * Theme configuration - 6 color themes with full Tailwind CSS integration
 * Each theme includes: colors, typography, spacing, shadows for comprehensive styling
 */

export const THEME_CONFIG = {
  /**
   * Default Theme - Professional Blue
   */
  default: {
    name: 'Default (Blue)',
    id: 'default',
    colors: {
      primary: '#3B82F6', // blue-500
      primaryLight: '#DBEAFE', // blue-100
      primaryDark: '#1E40AF', // blue-800
      secondary: '#64748B', // slate-500
      accent: '#6366F1', // indigo-500
      success: '#10B981', // emerald-500
      warning: '#F59E0B', // amber-500
      error: '#EF4444', // red-500
      background: '#F9FAFB', // gray-50
      surface: '#FFFFFF', // white
      border: '#E5E7EB', // gray-200
      text: '#111827', // gray-900
      textMuted: '#6B7280', // gray-500
    },
    tailwind: {
      bg: 'bg-gray-50',
      surface: 'bg-white',
      text: 'text-gray-900',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      primary: 'text-blue-600',
      primaryBg: 'bg-blue-600',
    },
  },

  /**
   * Ocean Theme - Cool Cyan
   */
  ocean: {
    name: 'Ocean (Cyan)',
    id: 'ocean',
    colors: {
      primary: '#06B6D4', // cyan-500
      primaryLight: '#CFFAFE', // cyan-100
      primaryDark: '#0891B2', // cyan-700
      secondary: '#0F766E', // teal-900
      accent: '#0891B2', // cyan-700
      success: '#059669', // emerald-600
      warning: '#D97706', // amber-600
      error: '#DC2626', // red-600
      background: '#ECFDF5', // emerald-50
      surface: '#F0FDFA', // cyan-50
      border: '#CCFBF1', // teal-100
      text: '#134E4A', // teal-900
      textMuted: '#0F766E', // teal-700
    },
    tailwind: {
      bg: 'bg-cyan-50',
      surface: 'bg-cyan-50',
      text: 'text-teal-900',
      textMuted: 'text-teal-700',
      border: 'border-teal-200',
      primary: 'text-cyan-600',
      primaryBg: 'bg-cyan-600',
    },
  },

  /**
   * Sunset Theme - Warm Orange
   */
  sunset: {
    name: 'Sunset (Orange)',
    id: 'sunset',
    colors: {
      primary: '#F97316', // orange-500
      primaryLight: '#FED7AA', // orange-200
      primaryDark: '#EA580C', // orange-600
      secondary: '#DC2626', // red-600
      accent: '#F97316', // orange-500
      success: '#16A34A', // green-600
      warning: '#EAB308', // yellow-400
      error: '#991B1B', // red-900
      background: '#FEF3C7', // amber-100
      surface: '#FFFBEB', // amber-50
      border: '#FED7AA', // orange-200
      text: '#7C2D12', // orange-900
      textMuted: '#B45309', // amber-700
    },
    tailwind: {
      bg: 'bg-orange-50',
      surface: 'bg-amber-50',
      text: 'text-orange-900',
      textMuted: 'text-amber-700',
      border: 'border-orange-200',
      primary: 'text-orange-600',
      primaryBg: 'bg-orange-600',
    },
  },

  /**
   * Forest Theme - Nature Green
   */
  forest: {
    name: 'Forest (Green)',
    id: 'forest',
    colors: {
      primary: '#059669', // emerald-600
      primaryLight: '#D1FAE5', // emerald-100
      primaryDark: '#047857', // emerald-700
      secondary: '#1E7E34', // green-800
      accent: '#10B981', // emerald-500
      success: '#22C55E', // lime-500
      warning: '#FBBF24', // amber-400
      error: '#F87171', // red-400
      background: '#ECFDF5', // emerald-50
      surface: '#F0FDF4', // green-50
      border: '#D1FAE5', // emerald-100
      text: '#065F46', // emerald-900
      textMuted: '#047857', // emerald-700
    },
    tailwind: {
      bg: 'bg-emerald-50',
      surface: 'bg-green-50',
      text: 'text-emerald-900',
      textMuted: 'text-emerald-700',
      border: 'border-emerald-200',
      primary: 'text-emerald-600',
      primaryBg: 'bg-emerald-600',
    },
  },

  /**
   * Purple Dream Theme - Vibrant Purple
   */
  purple: {
    name: 'Purple Dream',
    id: 'purple',
    colors: {
      primary: '#A855F7', // purple-500
      primaryLight: '#F3E8FF', // purple-100
      primaryDark: '#9333EA', // purple-600
      secondary: '#EC4899', // pink-500
      accent: '#D946EF', // fuchsia-500
      success: '#10B981', // emerald-500
      warning: '#FBBF24', // amber-400
      error: '#F87171', // red-400
      background: '#FAF5FF', // purple-50
      surface: '#FFFFFF', // white
      border: '#E9D5FF', // purple-200
      text: '#581C87', // purple-900
      textMuted: '#7E22CE', // purple-700
    },
    tailwind: {
      bg: 'bg-purple-50',
      surface: 'bg-white',
      text: 'text-purple-900',
      textMuted: 'text-purple-700',
      border: 'border-purple-200',
      primary: 'text-purple-600',
      primaryBg: 'bg-purple-600',
    },
  },

  /**
   * Dark Mode Theme
   */
  dark: {
    name: 'Dark Mode',
    id: 'dark',
    colors: {
      primary: '#60A5FA', // blue-400
      primaryLight: '#3B82F6', // blue-500
      primaryDark: '#1E40AF', // blue-800
      secondary: '#94A3B8', // slate-400
      accent: '#818CF8', // indigo-400
      success: '#34D399', // emerald-400
      warning: '#FBBF24', // amber-400
      error: '#F87171', // red-400
      background: '#0F172A', // slate-900
      surface: '#1E293B', // slate-800
      border: '#334155', // slate-700
      text: '#F1F5F9', // slate-100
      textMuted: '#CBD5E1', // slate-300
    },
    tailwind: {
      bg: 'bg-slate-900',
      surface: 'bg-slate-800',
      text: 'text-slate-100',
      textMuted: 'text-slate-300',
      border: 'border-slate-700',
      primary: 'text-blue-400',
      primaryBg: 'bg-blue-600',
    },
  },
};

/**
 * Theme utilities for getting color by key
 */
export const getThemeColor = (themeName, colorKey) => {
  const theme = THEME_CONFIG[themeName];
  return theme?.colors[colorKey] || '#000000';
};

/**
 * Get all available theme names
 */
export const getThemeNames = () => Object.keys(THEME_CONFIG);

/**
 * Get theme by name
 */
export const getTheme = (themeName) => THEME_CONFIG[themeName] || THEME_CONFIG.default;
