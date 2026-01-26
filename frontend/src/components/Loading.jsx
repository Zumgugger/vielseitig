export default function Loading({ fullscreen = false }) {
  const content = (
    <div className="flex items-center justify-center gap-2">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      <span className="ml-2 text-gray-600 font-medium">Wird geladen...</span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="flex justify-center items-center py-8">{content}</div>;
}
