import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Toast } from '../components';
import { authAPI } from '../api';
import { useAuth } from '../store/AuthContext';

export default function UserLoginPage({ defaultMode = 'login' }) {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [mode, setMode] = useState(defaultMode); // 'login' | 'register'
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    schoolName: '',
  });

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const isLogin = mode === 'login';

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    if (isLogin) return true;
    const next = {};
    if (!form.email || !form.email.includes('@')) next.email = 'Gültige E-Mail erforderlich';
    if (!form.password || form.password.length < 8) next.password = 'Passwort mind. 8 Zeichen';
    if (form.password !== form.passwordConfirm) next.passwordConfirm = 'Passwörter stimmen nicht überein';
    if (!form.schoolName) next.schoolName = 'Schule erforderlich';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !validate()) {
      setToast({ message: 'Bitte Formular prüfen', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await authAPI.userLogin({ email: form.email, password: form.password });
        loginUser(res.data);
        setToast({ message: 'Erfolgreich angemeldet!', type: 'success' });
        setTimeout(() => navigate('/user/lists'), 1200);
      } else {
        await authAPI.userRegister({
          email: form.email,
          password: form.password,
          school_name: form.schoolName,
        });
        setToast({ message: 'Registrierung eingereicht. Admin prüft die Freigabe.', type: 'success' });
        setMode('login');
      }
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join('; ')
        : detail || err.message || 'Aktion fehlgeschlagen';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const helperText = useMemo(() => {
    if (isLogin) return 'Melden Sie sich mit Ihren Zugangsdaten an.';
    return 'Registrieren Sie sich als Lehrkraft. Eine Schule ist erforderlich (Name reicht).';
  }, [isLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">🎓 Lehrkraft {isLogin ? 'Login' : 'Registrierung'}</h1>
          <p className="text-gray-600">{helperText}</p>
        </div>

        <div className="flex gap-2 mb-6" role="tablist">
          <button
            type="button"
            className={`btn ${isLogin ? 'btn-primary' : 'btn-outline'} flex-1`}
            onClick={() => setMode('login')}
            aria-pressed={isLogin}
          >
            Anmelden
          </button>
          <button
            type="button"
            className={`btn ${!isLogin ? 'btn-primary' : 'btn-outline'} flex-1`}
            onClick={() => setMode('register')}
            aria-pressed={!isLogin}
          >
            Registrieren
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-Mail Adresse"
            type="email"
            name="email"
            placeholder="ihre.email@schule.ch"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="Passwort"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            error={errors.password}
            required
          />

          {!isLogin && (
            <>
              <Input
                label="Passwort wiederholen"
                type="password"
                name="passwordConfirm"
                placeholder="••••••••"
                value={form.passwordConfirm}
                onChange={(e) => setField('passwordConfirm', e.target.value)}
                error={errors.passwordConfirm}
                required
              />

              <Input
                label="Schule (Name)"
                type="text"
                name="schoolName"
                placeholder="z.B. Sekundarschule Beispielstadt"
                value={form.schoolName}
                onChange={(e) => setField('schoolName', e.target.value)}
                error={errors.schoolName}
                required
              />

              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                ℹ️ Nach der Registrierung prüft ein Admin Ihre Schule/Freigabe.
              </p>
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Wird gesendet...' : isLogin ? 'Anmelden' : 'Registrieren'}
          </Button>
        </form>

        <div className="divider" />

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            <Link to="/admin/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Admin Login
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            <Link to="/" className="text-gray-500 hover:text-blue-600">
              ← Zurück zur Startseite
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
