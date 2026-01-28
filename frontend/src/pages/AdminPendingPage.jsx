import { useEffect, useState } from 'react';
import { Button, Loading, Toast } from '../components';
import { adminAPI } from '../api';

export default function AdminPendingPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingSchools, setPendingSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const normalizeError = (err) => {
    const detail = err?.response?.data?.detail || err?.message;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || d.detail || JSON.stringify(d)).join('; ');
    }
    if (detail && typeof detail === 'object') {
      return detail.msg || detail.detail || JSON.stringify(detail);
    }
    return detail || 'Unbekannter Fehler';
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, schoolsRes] = await Promise.all([
        adminAPI.getPendingUsers(),
        adminAPI.getPendingSchools(),
      ]);
      setPendingUsers(usersRes.data || []);
      setPendingSchools(schoolsRes.data || []);
    } catch (err) {
      const message = normalizeError(err) || 'Konnte Pending-Listen nicht laden';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'approve') {
        await adminAPI.approveUser(userId, {});
        setToast({ message: 'User freigeschaltet', type: 'success' });
      } else {
        await adminAPI.rejectUser(userId, {});
        setToast({ message: 'User abgelehnt', type: 'info' });
      }
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      const message = normalizeError(err) || 'Aktion fehlgeschlagen';
      setToast({ message, type: 'error' });
    }
  };

  const handleSchoolAction = async (schoolId, action) => {
    try {
      if (action === 'approve') {
        await adminAPI.approveSchool(schoolId, {});
        setToast({ message: 'Schule freigeschaltet', type: 'success' });
      } else {
        await adminAPI.rejectSchool(schoolId, {});
        setToast({ message: 'Schule abgelehnt', type: 'info' });
      }
      setPendingSchools((prev) => prev.filter((s) => s.id !== schoolId));
    } catch (err) {
      const message = normalizeError(err) || 'Aktion fehlgeschlagen';
      setToast({ message, type: 'error' });
    }
  };

  if (loading) return <Loading fullscreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-2">Fehler</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={loadData}>Erneut laden</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Admin • Inbox</p>
            <h1 className="text-3xl font-bold text-gray-900">Pending Freigaben</h1>
            <p className="text-gray-600">Benutzer- und Schul-Anfragen prüfen und freigeben.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadData}>Aktualisieren</Button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Users ({pendingUsers.length})</h2>
            <span className="text-sm text-gray-500">Status: pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Schule</th>
                  <th>Registriert</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.school_name || '—'}</td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleString() : '—'}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Button variant="primary" size="sm" onClick={() => handleUserAction(user.id, 'approve')}>
                        Freischalten
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleUserAction(user.id, 'reject')}>
                        Ablehnen
                      </Button>
                    </td>
                  </tr>
                ))}
                {pendingUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">Keine pending Users.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Schools ({pendingSchools.length})</h2>
            <span className="text-sm text-gray-500">Status: pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Aktive Users</th>
                  <th>Erstellt</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {pendingSchools.map((school) => (
                  <tr key={school.id}>
                    <td>{school.name}</td>
                    <td>{school.active_user_count ?? 0}</td>
                    <td>{school.created_at ? new Date(school.created_at).toLocaleString() : '—'}</td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Button variant="primary" size="sm" onClick={() => handleSchoolAction(school.id, 'approve')}>
                        Freischalten
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleSchoolAction(school.id, 'reject')}>
                        Ablehnen
                      </Button>
                    </td>
                  </tr>
                ))}
                {pendingSchools.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">Keine pending Schulen.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
