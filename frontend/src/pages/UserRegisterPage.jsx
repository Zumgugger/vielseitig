import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Toast } from '../components';
import { authApi } from '../api/client';
import { useAuth } from '../store/AuthContext';

export default function UserRegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    school: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [newSchool, setNewSchool] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Gültige E-Mail erforderlich';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Passwort mind. 8 Zeichen';
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwörter stimmen nicht überein';
    }
    if (!formData.firstName) {
      newErrors.firstName = 'Vorname erforderlich';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Nachname erforderlich';
    }
    if (!formData.school && !newSchool) {
      newErrors.school = 'Schule erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({ message: 'Bitte füllen Sie alle Felder korrekt aus', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const schoolName = newSchool || formData.school;
      
      const response = await authApi.registerUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        schoolName
      );

      setToast({
        message: 'Registrierung erfolgreich! Admin wird benachrichtigt.',
        type: 'success',
      });

      setTimeout(() => navigate('/user/login'), 2000);
    } catch (err) {
      const message = err.response?.data?.detail || 'Registrierung fehlgeschlagen';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">👩‍🎓 Lehrkraft Registrierung</h1>
          <p className="text-gray-600">Erstellen Sie ein neues Lehrkraft-Konto</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Vorname"
              type="text"
              name="firstName"
              placeholder="Max"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              label="Nachname"
              type="text"
              name="lastName"
              placeholder="Mustermann"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label="E-Mail Adresse"
            type="email"
            name="email"
            placeholder="max.mustermann@schule.ch"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Passwort"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Input
            label="Passwort wiederholen"
            type="password"
            name="passwordConfirm"
            placeholder="••••••••"
            value={formData.passwordConfirm}
            onChange={handleChange}
            error={errors.passwordConfirm}
            required
          />

          <div className="form-group">
            <label className="form-label">Schule</label>
            {!newSchool ? (
              <>
                <select
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">-- Schule auswählen oder hinzufügen --</option>
                  <option value="__new__">+ Neue Schule hinzufügen</option>
                </select>
                {formData.school === '__new__' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, school: '' }));
                      setNewSchool('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                  >
                    Zurück
                  </button>
                )}
              </>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Schulname"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setNewSchool('')}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                >
                  Andere Schule wählen
                </button>
              </>
            )}
            {errors.school && <p className="form-error">{errors.school}</p>}
          </div>

          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
            ℹ️ Nach der Registrierung wird ein Administrator Ihre Anfrage überprüfen. Sie erhalten eine SMS-Benachrichtigung zur Bestätigung.
          </p>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Wird registriert...' : 'Jetzt registrieren'}
          </Button>
        </form>

        <div className="divider"></div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Bereits angemeldet?{' '}
            <Link to="/user/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Hier anmelden
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
