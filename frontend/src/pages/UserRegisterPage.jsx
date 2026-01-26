import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

export default function UserRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.userRegister({ email, password, school_name: schoolName });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="mb-4">Registrierung eingegangen!</h1>
          <p className="text-gray-600 mb-6">
            Ihre Registrierung wurde erfolgreich übermittelt. Ein Administrator wird
            Ihren Account in Kürze freischalten. Sie erhalten eine Benachrichtigung
            per E-Mail.
          </p>
          <Link to="/user/login" className="btn btn-primary">
            Zum Login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="card max-w-md w-full mx-4">
        <h1 className="text-center mb-6">Lehrkraft Registrierung</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">E-Mail</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ihre.email@schule.ch"
            />
          </div>

          <div>
            <label className="label">Passwort</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Mindestens 8 Zeichen</p>
          </div>

          <div>
            <label className="label">Schule</label>
            <input
              type="text"
              className="input"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
              placeholder="Name Ihrer Schule"
            />
            <p className="text-xs text-gray-500 mt-1">
              Falls Ihre Schule bereits registriert ist, wird Ihr Account mit ihr verknüpft.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Wird registriert...' : 'Registrieren'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Bereits registriert?{' '}
            <Link to="/user/login" className="text-primary hover:underline">
              Jetzt anmelden
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-primary">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
