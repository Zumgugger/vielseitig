/**
 * Skeleton loading components for better perceived performance.
 * 
 * Usage:
 *   <Skeleton.Line width="w-1/2" />
 *   <Skeleton.Card />
 *   <Skeleton.Table rows={5} cols={4} />
 */

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`} />
  );
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <SkeletonLine width="w-1/3" height="h-6" className="mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine 
          key={i} 
          width={i === lines - 1 ? 'w-2/3' : 'w-full'} 
          className="mb-2" 
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`card overflow-hidden animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-gray-50">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width="flex-1" height="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <SkeletonLine 
              key={colIndex} 
              width="flex-1" 
              height="h-4" 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card text-center animate-pulse">
          <SkeletonLine width="w-16 mx-auto" height="h-8" className="mb-2" />
          <SkeletonLine width="w-24 mx-auto" height="h-4" />
        </div>
      ))}
    </div>
  );
}

// Default export with all variants
const Skeleton = {
  Line: SkeletonLine,
  Card: SkeletonCard,
  Table: SkeletonTable,
  Stats: SkeletonStats,
};

export default Skeleton;
