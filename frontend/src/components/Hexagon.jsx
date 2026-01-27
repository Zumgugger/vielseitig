import PropTypes from 'prop-types';
import { hexagonPath } from '../utils/hexagon';

/**
 * Single Hexagon Tile Component
 * 
 * Renders a single hexagon with text, applying theme colors
 * and bold styling for "oft" bucket items
 */
export default function Hexagon({ 
  size = 50, 
  word, 
  bucket = 'manchmal',
  theme = 'blue',
  id,
  className = ''
}) {
  // Theme color mapping with stronger colors for "oft" bucket
  const themeColors = {
    blue: {
      center: { fill: '#3B82F6', stroke: '#3B82F6', text: '#FFFFFF' },
      oft: { fill: '#60A5FA', stroke: '#1D4ED8', text: '#1E3A8A' },
      manchmal: { fill: '#DBEAFE', stroke: '#3B82F6', text: '#1E40AF' },
    },
    green: {
      center: { fill: '#10B981', stroke: '#10B981', text: '#FFFFFF' },
      oft: { fill: '#6EE7B7', stroke: '#059669', text: '#064E3B' },
      manchmal: { fill: '#D1FAE5', stroke: '#10B981', text: '#065F46' },
    },
    purple: {
      center: { fill: '#8B5CF6', stroke: '#8B5CF6', text: '#FFFFFF' },
      oft: { fill: '#C4B5FD', stroke: '#7C3AED', text: '#4C1D95' },
      manchmal: { fill: '#EDE9FE', stroke: '#8B5CF6', text: '#5B21B6' },
    },
    pink: {
      center: { fill: '#EC4899', stroke: '#EC4899', text: '#FFFFFF' },
      oft: { fill: '#F9A8D4', stroke: '#DB2777', text: '#831843' },
      manchmal: { fill: '#FCE7F3', stroke: '#EC4899', text: '#9F1239' },
    },
    orange: {
      center: { fill: '#F97316', stroke: '#F97316', text: '#FFFFFF' },
      oft: { fill: '#FDBA74', stroke: '#EA580C', text: '#7C2D12' },
      manchmal: { fill: '#FFEDD5', stroke: '#F97316', text: '#9A3412' },
    },
    teal: {
      center: { fill: '#14B8A6', stroke: '#14B8A6', text: '#FFFFFF' },
      oft: { fill: '#5EEAD4', stroke: '#0D9488', text: '#134E4A' },
      manchmal: { fill: '#CCFBF1', stroke: '#14B8A6', text: '#115E59' },
    },
    dark: {
      center: { fill: '#4F46E5', stroke: '#4F46E5', text: '#FFFFFF' },
      oft: { fill: '#374151', stroke: '#1F2937', text: '#F9FAFB' },
      manchmal: { fill: '#111827', stroke: '#374151', text: '#D1D5DB' },
    },
  };

  const bucketType = bucket === 'center' ? 'center' : bucket === 'oft' ? 'oft' : 'manchmal';
  const colors = themeColors[theme]?.[bucketType] || themeColors.blue.manchmal;
  const isBold = bucket === 'oft' || bucket === 'center';
  
  // Split long words into multiple lines (up to 3 lines) for better fit
  const splitWord = (text, maxLength = 11) => {
    if (text.length <= maxLength) return [text];

    // Try to split at hyphens or spaces first
    const parts = text.split(/[-\s]/).filter(Boolean);
    if (parts.length > 1) {
      const lines = [];
      let current = '';
      parts.forEach(p => {
        if ((current + (current ? ' ' : '') + p).length <= maxLength) {
          current = current ? current + ' ' + p : p;
        } else {
          if (current) lines.push(current);
          current = p;
        }
      });
      if (current) lines.push(current);
      return lines.slice(0, 3);
    }

    // Fallback: force split into 2-3 chunks
    const chunk = Math.ceil(text.length / 2);
    const first = text.slice(0, chunk);
    const second = text.slice(chunk);
    if (second.length > maxLength) {
      const chunk2 = Math.ceil(second.length / 2);
      return [first + '-', second.slice(0, chunk2) + '-', second.slice(chunk2)];
    }
    return [first + '-', second];
  };

  const initialLines = word.length > 11 ? splitWord(word) : [word];
  
  // Calculate a conservative font size that keeps all lines within the hex bounds
  // Approximate average glyph width ~0.58 * fontSize
  const allowedWidth = size * 1.6; // inner width allowance inside hex
  const perLineFontSizes = initialLines.map(line => {
    const byLength = allowedWidth / Math.max(1, (line.length * 0.58));
    return Math.min(size * 0.35, Math.max(size * 0.16, byLength));
  });
  const fontSize = Math.min(...perLineFontSizes);
  const lineHeight = fontSize * 1.08;
  const totalHeight = initialLines.length * lineHeight;
  const startY = -(totalHeight / 2) + (lineHeight / 2);
  
  return (
    <g className={className}>
      {/* ClipPath to ensure text never escapes the hexagon */}
      <defs>
        <clipPath id={`hexClip-${id ?? word}-${size}`}>
          <path d={hexagonPath(size)} />
        </clipPath>
      </defs>
      {/* Hexagon Shape */}
      <path
        d={hexagonPath(size)}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={bucket === 'center' ? 3.5 : bucket === 'oft' ? 3 : 2}
      />
      
      {/* Text - with multi-line support */}
      <g clipPath={`url(#hexClip-${id ?? word}-${size})`}>
        {initialLines.map((line, i) => (
          <text
            key={i}
            x="0"
            y={startY + (i * lineHeight)}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            fontSize={fontSize}
            fontWeight={isBold ? 'bold' : 'normal'}
            style={{
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {line}
          </text>
        ))}
      </g>
    </g>
  );
}

Hexagon.propTypes = {
  size: PropTypes.number,
  word: PropTypes.string.isRequired,
  bucket: PropTypes.oneOf(['center', 'oft', 'manchmal']),
  theme: PropTypes.oneOf(['blue', 'green', 'purple', 'pink', 'orange', 'teal', 'dark']),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};
