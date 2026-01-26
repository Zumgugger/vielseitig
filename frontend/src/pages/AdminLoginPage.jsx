import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Toast } from '../components';
import { adminAuthApi } from '../api/client';
import { useAuth } from '../store/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminAuthApi.loginAdmin(email, password);
      loginAdmin(response.data);
      setToast({ message: 'Admin erfolgreich angemeldet!', type: 'success' });
      setTimeout(() => navigate('/admin/pending'), 1500);
    } catch (err) {
      const message = err.response?.data?.detail || 'Login fehlgeschlagen. Bitte versuchen Sie es erneut.';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">🔐 Admin Login</h1>
          <p className="text-gray-600">Nur für Administratoren</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="E-Mail oder Benutzername"
            type="email"
            placeholder="admin@vielseitig.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && error.includes('E-Mail') ? error : ''}
            required
          />

          <Input
            label="Passwort"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && error.includes('Passwort') ? error : ''}
            required
          />

          {error && !error.includes('E-Mail') && !error.includes('Passwort') && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Wird angemeldet...' : 'Anmelden'}
          </Button>
        </form>

        <div className="divider"></div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              ← Zurück zur Startseite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-primary">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
