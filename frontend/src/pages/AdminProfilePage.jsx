import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Loading, Toast } from '../components';
import { useAuth } from '../store/AuthContext';
import { authAPI } from '../api';

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authAPI.adminProfile();
        setProfile(res.data);
      } catch (err) {
        // If profile fetch fails, user might not be logged in
        console.error('Failed to load admin profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authAPI.adminLogout();
      logout();
      navigate('/admin/login');
    } catch (err) {
      const message = err.response?.data?.detail || 'Logout fehlgeschlagen';
      setToast({ message, type: 'error' });
      setLoggingOut(false);
    }
  };

  if (loading) return <Loading fullscreen />;

  const displayAdmin = profile || admin;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-sm text-gray-600">Admin • Profil</p>
          <h1 className="text-3xl font-bold text-gray-900">Admin-Profil</h1>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="form-label">Benutzername / E-Mail</label>
            <p className="text-lg font-medium text-gray-900">
              {displayAdmin?.email || displayAdmin?.username || '—'}
            </p>
          </div>

          <div>
            <label className="form-label">Rolle</label>
            <p className="text-lg text-gray-700">Administrator (Superadmin)</p>
          </div>

          {displayAdmin?.created_at && (
            <div>
              <label className="form-label">Erstellt am</label>
              <p className="text-gray-600">
                {new Date(displayAdmin.created_at).toLocaleDateString('de-CH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {displayAdmin?.last_login_at && (
            <div>
              <label className="form-label">Letzter Login</label>
              <p className="text-gray-600">
                {new Date(displayAdmin.last_login_at).toLocaleString('de-CH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>

        <div className="card bg-gray-100">
          <h2 className="text-lg font-semibold mb-3">Schnellzugriff</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/admin/pending')}>
              📬 Pending Inbox
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/users')}>
              👥 Users
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/schools')}>
              🏫 Schulen
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/analytics')}>
              📊 Statistiken
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/standard-list')}>
              📝 Standardliste
            </Button>
          </div>
        </div>

        <div className="card border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-800 mb-3">Session beenden</h2>
          <p className="text-red-700 text-sm mb-4">
            Du wirst ausgeloggt und musst dich erneut anmelden, um den Admin-Bereich zu nutzen.
          </p>
          <Button variant="danger" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Wird ausgeloggt...' : '🚪 Ausloggen'}
          </Button>
        </div>
      </div>
    </div>
  );
}
