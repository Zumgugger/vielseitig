import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Hexagon from './Hexagon';
import { placeCardsOnGrid, hexToPixel, getGridBounds } from '../utils/hexagon';

/**
 * HexagonGrid Component
 * 
 * Renders a complete hexagonal grid visualization of sorted adjectives
 * with "Ich bin" in the center, "oft" cards bold, "manchmal" cards regular
 * 
 * Section 15: Hexagon Rendering
 */
export default function HexagonGrid({
  oftCards = [],
  manchmalCards = [],
  theme = 'blue',
  hexSize = 60,
  randomSeed = null,
  className = ''
}) {
  // Generate placements (memoized to avoid re-calculation on every render)
  const placements = useMemo(() => {
    return placeCardsOnGrid(oftCards, manchmalCards, randomSeed);
  }, [oftCards, manchmalCards, randomSeed]);

  // Calculate bounding box and viewBox
  const { viewBox, width, height } = useMemo(() => {
    if (placements.size === 0) {
      return { viewBox: '0 0 200 200', width: 200, height: 200 };
    }

    const bounds = getGridBounds(placements);
    
    // Convert hex bounds to pixel bounds
    const minPixel = hexToPixel({ q: bounds.minQ, r: bounds.minR }, hexSize);
    const maxPixel = hexToPixel({ q: bounds.maxQ, r: bounds.maxR }, hexSize);
    
    // Add padding (hexSize on each side for the hexagon itself, plus extra margin)
    const padding = hexSize * 1.5;
    const x = minPixel.x - padding;
    const y = minPixel.y - padding;
    const w = maxPixel.x - minPixel.x + padding * 2;
    const h = maxPixel.y - minPixel.y + padding * 2;
    
    return {
      viewBox: `${x} ${y} ${w} ${h}`,
      width: w,
      height: h,
    };
  }, [placements, hexSize]);

  // If no cards, show empty state
  if (placements.size === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <p className="text-gray-500 text-center">
          Keine Adjektive sortiert
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        viewBox={viewBox}
        className="w-full h-auto max-w-full"
        style={{
          maxHeight: '80vh',
        }}
      >
        {/* Render all hexagons */}
        {Array.from(placements.entries()).map(([key, placement]) => {
          const { hex, card, bucket } = placement;
          const pixel = hexToPixel(hex, hexSize);
          
          return (
            <g
              key={key}
              transform={`translate(${pixel.x}, ${pixel.y})`}
            >
              <Hexagon
                size={hexSize}
                word={card.word}
                bucket={bucket}
                theme={theme}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

HexagonGrid.propTypes = {
  oftCards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      word: PropTypes.string.isRequired,
    })
  ),
  manchmalCards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      word: PropTypes.string.isRequired,
    })
  ),
  theme: PropTypes.oneOf(['blue', 'green', 'purple', 'pink', 'orange', 'teal']),
  hexSize: PropTypes.number,
  randomSeed: PropTypes.number,
  className: PropTypes.string,
};
