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
  className = ''
}) {
  // Theme color mapping with stronger colors for "oft" bucket
  const themeColors = {
    blue: {
      center: { fill: '#3B82F6', stroke: '#3B82F6', text: '#FFFFFF' },
      oft: { fill: '#93C5FD', stroke: '#2563EB', text: '#1E3A8A' },
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
      center: { fill: '#6366F1', stroke: '#6366F1', text: '#FFFFFF' },
      oft: { fill: '#4B5563', stroke: '#6B7280', text: '#F3F4F6' },
      manchmal: { fill: '#1F2937', stroke: '#4B5563', text: '#D1D5DB' },
    },
  };

  const bucketType = bucket === 'center' ? 'center' : bucket === 'oft' ? 'oft' : 'manchmal';
  const colors = themeColors[theme]?.[bucketType] || themeColors.blue.manchmal;
  const isBold = bucket === 'oft' || bucket === 'center';
  
  // Dynamic font sizing based on word length for better fit
  const getFontSize = () => {
    if (word.length > 15) return size * 0.18;
    if (word.length > 12) return size * 0.22;
    if (word.length > 9) return size * 0.26;
    if (word.length > 6) return size * 0.30;
    return size * 0.35;
  };
  
  const fontSize = getFontSize();
  
  // Split long words into multiple lines
  const splitWord = (text, maxLength = 12) => {
    if (text.length <= maxLength) return [text];
    
    // Try to split at natural break points
    const words = text.split(/[-\s]/);
    if (words.length > 1 && words.every(w => w.length <= maxLength)) {
      return words;
    }
    
    // Otherwise split in middle
    const mid = Math.ceil(text.length / 2);
    return [text.slice(0, mid) + '-', text.slice(mid)];
  };
  
  const lines = word.length > 12 ? splitWord(word) : [word];
  const lineHeight = fontSize * 1.1;
  const totalHeight = lines.length * lineHeight;
  const startY = -(totalHeight / 2) + (lineHeight / 2);
  
  return (
    <g className={className}>
      {/* Hexagon Shape */}
      <path
        d={hexagonPath(size)}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={bucket === 'center' ? 3 : bucket === 'oft' ? 2.5 : 2}
      />
      
      {/* Text - with multi-line support */}
      {lines.map((line, i) => (
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
  );
}

Hexagon.propTypes = {
  size: PropTypes.number,
  word: PropTypes.string.isRequired,
  bucket: PropTypes.oneOf(['center', 'oft', 'manchmal']),
  theme: PropTypes.oneOf(['blue', 'green', 'purple', 'pink', 'orange', 'teal']),
  className: PropTypes.string,
};
