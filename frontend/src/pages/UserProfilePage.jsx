import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Loading, Toast } from '../components';
import { authAPI } from '../api';
import { useAuth } from '../store/AuthContext';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await authAPI.userProfile();
        setProfile(response.data);
      } catch (err) {
        const message = err.response?.data?.detail || 'Profil konnte nicht geladen werden';
        setError(message);
        setToast({ message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.userLogout();
    } catch (err) {
      // Best effort logout
    } finally {
      logout();
      navigate('/user/login');
    }
  };

  if (loading) return <Loading fullscreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Fehler</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Erneut versuchen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Profil</p>
            <h1 className="text-3xl font-bold text-gray-900">Deine Daten</h1>
          </div>
          <Link to="/user/lists" className="btn btn-outline">Zurück zu Listen</Link>
        </div>

        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">E-Mail</p>
              <p className="text-lg font-semibold">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold capitalize">{profile?.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Schule</p>
              <p className="text-lg font-semibold">{profile?.school?.name || 'Keine Schule hinterlegt'}</p>
              {profile?.school?.status && (
                <p className="text-sm text-gray-600">Status: {profile.school.status}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Zuletzt angemeldet</p>
              <p className="text-lg font-semibold">
                {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Noch nie'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Konto erstellt</p>
              <p className="text-lg font-semibold">
                {profile?.created_at ? new Date(profile.created_at).toLocaleString() : 'Unbekannt'}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
