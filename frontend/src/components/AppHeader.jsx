import { Link } from 'react-router-dom';

export default function AppHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          🎨 Vielseitig
        </Link>
        <nav className="hidden md:flex gap-4">
          <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
            Home
          </Link>
          <Link to="/user/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Lehrkraft
          </Link>
          <Link to="/admin/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
