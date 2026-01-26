import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-white">
        <h1 className="text-6xl font-bold mb-6">🎨 Vielseitig</h1>
        <p className="text-2xl mb-8 opacity-90">
          Adjektiv-Sortierung & Selbstreflexion
        </p>
        
        <div className="card bg-white/95 text-gray-900 max-w-2xl mx-auto">
          <h2 className="mb-6">Willkommen!</h2>
          
          <div className="space-y-4">
            <Link 
              to="/sort" 
              className="btn btn-primary block w-full text-lg py-4"
            >
              Als Schüler:in starten →
            </Link>
            
            <Link 
              to="/user/login" 
              className="btn btn-outline block w-full text-lg py-4"
            >
              Als Lehrkraft anmelden
            </Link>
            
            <Link 
              to="/admin/login" 
              className="text-sm text-gray-600 hover:text-primary block mt-6"
            >
              Admin-Login
            </Link>
          </div>
        </div>
        
        <p className="mt-8 opacity-75 text-sm">
          Vielseitig © 2026 • Selbstreflexion durch Adjektiv-Sortierung
        </p>
      </div>
    </div>
  );
}
