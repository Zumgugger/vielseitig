import { Link } from 'react-router-dom';

export default function AppFooter() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Vielseitig</h3>
            <p className="text-gray-600">Adjektiv-Sortierung & Selbstreflexion für Schüler:innen</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/impressum" className="text-gray-600 hover:text-blue-600">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-gray-600 hover:text-blue-600">
                  Datenschutzerklärung
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Kontakt</h4>
            <p className="text-gray-600 text-sm">support@vielseitig.local</p>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-8 pt-8 text-center text-gray-600 text-sm">
          <p>&copy; 2026 Vielseitig. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
