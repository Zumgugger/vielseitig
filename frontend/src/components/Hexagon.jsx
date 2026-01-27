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
  // Theme color mapping
  const themeColors = {
    blue: {
      fill: bucket === 'center' ? '#3B82F6' : '#DBEAFE',
      stroke: '#3B82F6',
      text: bucket === 'center' ? '#FFFFFF' : '#1E40AF',
    },
    green: {
      fill: bucket === 'center' ? '#10B981' : '#D1FAE5',
      stroke: '#10B981',
      text: bucket === 'center' ? '#FFFFFF' : '#065F46',
    },
    purple: {
      fill: bucket === 'center' ? '#8B5CF6' : '#EDE9FE',
      stroke: '#8B5CF6',
      text: bucket === 'center' ? '#FFFFFF' : '#5B21B6',
    },
    pink: {
      fill: bucket === 'center' ? '#EC4899' : '#FCE7F3',
      stroke: '#EC4899',
      text: bucket === 'center' ? '#FFFFFF' : '#9F1239',
    },
    orange: {
      fill: bucket === 'center' ? '#F97316' : '#FFEDD5',
      stroke: '#F97316',
      text: bucket === 'center' ? '#FFFFFF' : '#9A3412',
    },
    teal: {
      fill: bucket === 'center' ? '#14B8A6' : '#CCFBF1',
      stroke: '#14B8A6',
      text: bucket === 'center' ? '#FFFFFF' : '#115E59',
    },
  };

  const colors = themeColors[theme] || themeColors.blue;
  const isBold = bucket === 'oft' || bucket === 'center';
  
  // Font size depends on word length
  const fontSize = word.length > 12 ? size * 0.22 : word.length > 8 ? size * 0.28 : size * 0.35;
  
  return (
    <g className={className}>
      {/* Hexagon Shape */}
      <path
        d={hexagonPath(size)}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={bucket === 'center' ? 3 : 2}
      />
      
      {/* Text */}
      <text
        x="0"
        y="0"
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
        {word}
      </text>
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
