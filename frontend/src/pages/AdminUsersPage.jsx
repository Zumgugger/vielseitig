import { useEffect, useState } from 'react';
import { Button, Input, Loading, Toast } from '../components';
import { adminAPI } from '../api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      const message = err.response?.data?.detail || 'Konnte Users nicht laden';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('User wirklich löschen?')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setToast({ message: 'User gelöscht', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Löschen fehlgeschlagen';
      setToast({ message, type: 'error' });
    }
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.status === 'active' ? 'passive' : 'active';
    try {
      await adminAPI.updateUser(user.id, { status: nextStatus });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      setToast({ message: `Status auf ${nextStatus} gesetzt`, type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Status konnte nicht geändert werden';
      setToast({ message, type: 'error' });
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(filter.toLowerCase()) ||
    (u.school_name || '').toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <Loading fullscreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-2">Fehler</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={loadUsers}>Erneut laden</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Admin • Users</p>
            <h1 className="text-3xl font-bold text-gray-900">User-Verwaltung</h1>
            <p className="text-gray-600">Alle Benutzerkonten mit Status, Schule und Aktivierung.</p>
          </div>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Suche nach Email oder Schule"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="table min-w-full">
            <thead>
              <tr>
                <th>Email</th>
                <th>Schule</th>
                <th>Status</th>
                <th>Aktiv bis</th>
                <th>Erstellt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.school_name || '—'}</td>
                  <td>
                    <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.active_until ? new Date(user.active_until).toLocaleDateString() : '—'}</td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                  <td className="space-x-2 whitespace-nowrap">
                    <Button variant="secondary" size="sm" onClick={() => handleStatusToggle(user)}>
                      {user.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                      Löschen
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">Keine Benutzer gefunden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
