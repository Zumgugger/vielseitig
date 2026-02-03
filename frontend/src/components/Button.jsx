export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-colors duration-200 select-none';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-400',
    accent: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 disabled:bg-gray-400',
    ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:text-gray-400',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-400',
  };
  
  // Sizes optimized for touch (minimum 44x44px touch target on mobile)
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]',
    xl: 'px-8 py-4 text-xl min-h-[60px]', // Extra large for main sorting buttons
  };
  
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
