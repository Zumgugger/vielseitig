import { useEffect, useState } from 'react';
import { Button, Input, Loading, Toast } from '../components';
import { adminAPI } from '../api';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [newSchool, setNewSchool] = useState({ name: '', status: 'active' });

  const loadSchools = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getSchools();
      setSchools(res.data || []);
    } catch (err) {
      const message = err.response?.data?.detail || 'Konnte Schulen nicht laden';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!newSchool.name.trim()) {
      setToast({ message: 'Name erforderlich', type: 'error' });
      return;
    }
    try {
      const res = await adminAPI.createSchool({
        name: newSchool.name.trim(),
        status: newSchool.status,
      });
      setSchools((prev) => [res.data, ...prev]);
      setNewSchool({ name: '', status: 'active' });
      setToast({ message: 'Schule angelegt', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Konnte Schule nicht anlegen';
      setToast({ message, type: 'error' });
    }
  };

  const handleStatusChange = async (schoolId, status) => {
    try {
      await adminAPI.updateSchool(schoolId, { status });
      setSchools((prev) => prev.map((s) => (s.id === schoolId ? { ...s, status } : s)));
      setToast({ message: 'Status aktualisiert', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Status konnte nicht aktualisiert werden';
      setToast({ message, type: 'error' });
    }
  };

  const handleDelete = async (schoolId) => {
    if (!window.confirm('Schule wirklich löschen?')) return;
    try {
      await adminAPI.deleteSchool(schoolId);
      setSchools((prev) => prev.filter((s) => s.id !== schoolId));
      setToast({ message: 'Schule gelöscht', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Löschen fehlgeschlagen';
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
          <Button variant="primary" onClick={loadSchools}>Erneut laden</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Admin • Schulen</p>
            <h1 className="text-3xl font-bold text-gray-900">Schul-Verwaltung</h1>
            <p className="text-gray-600">Status verwalten und neue Schulen anlegen.</p>
          </div>
          <form className="card flex flex-col sm:flex-row gap-3 items-start sm:items-end" onSubmit={handleCreate}>
            <div className="sm:w-64 w-full">
              <Input
                label="Neue Schule"
                placeholder="Schulname"
                value={newSchool.name}
                onChange={(e) => setNewSchool((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={newSchool.status}
                onChange={(e) => setNewSchool((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="pending">pending</option>
                <option value="passive">passive</option>
              </select>
            </div>
            <Button variant="primary" type="submit">Anlegen</Button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          <table className="table min-w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Aktive Users</th>
                <th>Erstellt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>{school.name}</td>
                  <td>
                    <select
                      className="form-input"
                      value={school.status}
                      onChange={(e) => handleStatusChange(school.id, e.target.value)}
                    >
                      <option value="active">active</option>
                      <option value="pending">pending</option>
                      <option value="passive">passive</option>
                    </select>
                  </td>
                  <td>{school.active_user_count ?? 0}</td>
                  <td>{school.created_at ? new Date(school.created_at).toLocaleDateString() : '—'}</td>
                  <td className="space-x-2 whitespace-nowrap">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(school.id)}>
                      Löschen
                    </Button>
                  </td>
                </tr>
              ))}
              {schools.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">Keine Schulen gefunden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
