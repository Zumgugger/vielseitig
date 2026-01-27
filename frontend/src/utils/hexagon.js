/**
 * Hexagon Grid Utilities
 * 
 * Implements an axial coordinate system for hexagonal grids
 * with flat-top orientation (pointy-top can be added if needed)
 * 
 * References:
 * - https://www.redblobgames.com/grids/hexagons/
 */

/**
 * Axial coordinates for a hexagon in the grid
 * @typedef {Object} HexCoord
 * @property {number} q - column coordinate
 * @property {number} r - row coordinate
 */

/**
 * Convert axial coordinates to pixel position
 * @param {HexCoord} hex - Axial coordinates
 * @param {number} size - Hexagon size (distance from center to vertex)
 * @returns {{x: number, y: number}} Pixel coordinates
 */
export function hexToPixel(hex, size) {
  const x = size * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r);
  const y = size * (3 / 2 * hex.r);
  return { x, y };
}

/**
 * Get the 6 neighbor coordinates of a hexagon
 * @param {HexCoord} hex - The center hexagon
 * @returns {HexCoord[]} Array of 6 neighbor coordinates
 */
export function hexNeighbors(hex) {
  const directions = [
    { q: 1, r: 0 },   // right
    { q: 1, r: -1 },  // top-right
    { q: 0, r: -1 },  // top-left
    { q: -1, r: 0 },  // left
    { q: -1, r: 1 },  // bottom-left
    { q: 0, r: 1 },   // bottom-right
  ];
  
  return directions.map(dir => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r,
  }));
}

/**
 * Get all hexagons in a ring around the center
 * @param {HexCoord} center - Center hexagon
 * @param {number} radius - Ring radius (1 = first ring around center)
 * @returns {HexCoord[]} Array of hexagons in the ring
 */
export function hexRing(center, radius) {
  if (radius === 0) return [center];
  
  const results = [];
  
  // Start at a position radius steps away
  let hex = {
    q: center.q + radius,
    r: center.r - radius,
  };
  
  // Walk around the ring
  const directions = [
    { q: -1, r: 1 },  // bottom-left
    { q: -1, r: 0 },  // left
    { q: 0, r: -1 },  // top-left
    { q: 1, r: -1 },  // top-right
    { q: 1, r: 0 },   // right
    { q: 0, r: 1 },   // bottom-right
  ];
  
  for (const dir of directions) {
    for (let i = 0; i < radius; i++) {
      results.push({ ...hex });
      hex = {
        q: hex.q + dir.q,
        r: hex.r + dir.r,
      };
    }
  }
  
  return results;
}

/**
 * Get all hexagons in a spiral from center up to maxRadius
 * @param {HexCoord} center - Center hexagon
 * @param {number} maxRadius - Maximum radius
 * @returns {HexCoord[]} Array of all hexagons in spiral order
 */
export function hexSpiral(center, maxRadius) {
  const results = [center];
  
  for (let radius = 1; radius <= maxRadius; radius++) {
    results.push(...hexRing(center, radius));
  }
  
  return results;
}

/**
 * Create a unique key for a hexagon coordinate
 * @param {HexCoord} hex - Hexagon coordinate
 * @returns {string} Unique key
 */
export function hexKey(hex) {
  return `${hex.q},${hex.r}`;
}

/**
 * Check if two hexagon coordinates are equal
 * @param {HexCoord} a - First hexagon
 * @param {HexCoord} b - Second hexagon
 * @returns {boolean} True if equal
 */
export function hexEqual(a, b) {
  return a.q === b.q && a.r === b.r;
}

/**
 * Generate SVG path data for a hexagon
 * @param {number} size - Hexagon size (distance from center to vertex)
 * @returns {string} SVG path data
 */
export function hexagonPath(size) {
  const points = [];
  
  // Generate 6 vertices for flat-top hexagon
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  
  return `M ${points.join(' L ')} Z`;
}

/**
 * Random placement algorithm for hexagon grid
 * Places "oft" cards first, then "manchmal" cards
 * 
 * @param {Array} oftCards - Array of objects with {id, word} for "oft" bucket
 * @param {Array} manchmalCards - Array of objects with {id, word} for "manchmal" bucket
 * @param {number} seed - Random seed for reproducible layouts (optional)
 * @returns {Map<string, {hex: HexCoord, card: Object, bucket: string}>} Map of hexKey to placement info
 */
export function placeCardsOnGrid(oftCards, manchmalCards, seed = null) {
  // Use seed if provided for reproducible random
  let random = Math.random;
  if (seed !== null) {
    // Simple seeded random (LCG)
    let seedValue = seed;
    random = () => {
      seedValue = (seedValue * 1103515245 + 12345) & 0x7fffffff;
      return seedValue / 0x7fffffff;
    };
  }
  
  const placements = new Map();
  const occupied = new Set();
  const availablePositions = [];
  
  const center = { q: 0, r: 0 };
  
  // Center is always "Ich bin"
  placements.set(hexKey(center), {
    hex: center,
    card: { word: 'Ich bin' },
    bucket: 'center',
  });
  occupied.add(hexKey(center));
  
  // Add neighbors of center as available positions
  hexNeighbors(center).forEach(neighbor => {
    availablePositions.push(neighbor);
  });
  
  /**
   * Place a card randomly from available positions
   * @param {Object} card - Card to place
   * @param {string} bucket - Bucket type ('oft' or 'manchmal')
   */
  const placeCard = (card, bucket) => {
    if (availablePositions.length === 0) {
      console.warn('No available positions, expanding grid');
      // Expand grid by adding next ring
      const maxRadius = Math.max(...Array.from(occupied).map(key => {
        const [q, r] = key.split(',').map(Number);
        return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
      }));
      
      hexRing(center, maxRadius + 1).forEach(hex => {
        const key = hexKey(hex);
        if (!occupied.has(key)) {
          availablePositions.push(hex);
        }
      });
    }
    
    if (availablePositions.length === 0) {
      console.error('Still no available positions after expansion');
      return;
    }
    
    // Pick a random position
    const index = Math.floor(random() * availablePositions.length);
    const position = availablePositions.splice(index, 1)[0];
    
    // Place the card
    const key = hexKey(position);
    placements.set(key, {
      hex: position,
      card,
      bucket,
    });
    occupied.add(key);
    
    // Add new neighbors as available positions
    hexNeighbors(position).forEach(neighbor => {
      const neighborKey = hexKey(neighbor);
      if (!occupied.has(neighborKey) && !availablePositions.some(pos => hexEqual(pos, neighbor))) {
        availablePositions.push(neighbor);
      }
    });
  };
  
  // Place all "oft" cards first (they get bold styling)
  oftCards.forEach(card => placeCard(card, 'oft'));
  
  // Then place "manchmal" cards
  manchmalCards.forEach(card => placeCard(card, 'manchmal'));
  
  return placements;
}

/**
 * Calculate the bounding box of all placements
 * @param {Map} placements - Map of placements from placeCardsOnGrid
 * @returns {{minQ: number, maxQ: number, minR: number, maxR: number}} Bounding box
 */
export function getGridBounds(placements) {
  let minQ = 0, maxQ = 0, minR = 0, maxR = 0;
  
  for (const [_, placement] of placements) {
    const { hex } = placement;
    minQ = Math.min(minQ, hex.q);
    maxQ = Math.max(maxQ, hex.q);
    minR = Math.min(minR, hex.r);
    maxR = Math.max(maxR, hex.r);
  }
  
  return { minQ, maxQ, minR, maxR };
}
