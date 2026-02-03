import { useEffect, useState } from 'react';
import { Button, Input, Loading, Toast } from '../components';
import { adminAPI } from '../api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  
  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', active_until: '', notes: '' });
  const [saving, setSaving] = useState(false);

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
    if (!window.confirm('User wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setToast({ message: '✅ User gelöscht', type: 'success' });
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
      setToast({ message: `✅ Status auf "${nextStatus}" gesetzt`, type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Status konnte nicht geändert werden';
      setToast({ message, type: 'error' });
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Passwort für ${user.email} zurücksetzen?`)) return;
    try {
      const res = await adminAPI.resetUserPassword(user.id);
      const newPassword = res.data?.new_password || res.data?.password || 'Neues Passwort';
      // Show new password in alert (so admin can copy it)
      alert(`Neues Passwort für ${user.email}:\n\n${newPassword}\n\nBitte kopieren und dem User mitteilen.`);
      setToast({ message: '🔑 Passwort wurde zurückgesetzt', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Passwort zurücksetzen fehlgeschlagen';
      setToast({ message, type: 'error' });
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      status: user.status || 'pending',
      active_until: user.active_until ? user.active_until.split('T')[0] : '',
      notes: user.notes || '',
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({ status: '', active_until: '', notes: '' });
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const updateData = {
        status: editForm.status,
        notes: editForm.notes,
      };
      // Only include active_until if it has a value
      if (editForm.active_until) {
        updateData.active_until = new Date(editForm.active_until).toISOString();
      } else {
        updateData.active_until = null;
      }
      
      await adminAPI.updateUser(editingUser.id, updateData);
      setUsers((prev) => prev.map((u) => 
        u.id === editingUser.id ? { ...u, ...updateData } : u
      ));
      setToast({ message: '✅ User aktualisiert', type: 'success' });
      closeEditModal();
    } catch (err) {
      const message = err.response?.data?.detail || 'Speichern fehlgeschlagen';
      setToast({ message, type: 'error' });
    } finally {
      setSaving(false);
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">User bearbeiten</h2>
            <p className="text-sm text-gray-600 mb-4">{editingUser.email}</p>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="passive">Passive</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Aktiv bis (optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={editForm.active_until}
                  onChange={(e) => setEditForm({ ...editForm, active_until: e.target.value })}
                />
                <p className="form-help">Leer lassen für unbegrenzte Aktivierung</p>
              </div>
              
              <div>
                <label className="form-label">Notizen (intern)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Interne Notizen zum User..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={closeEditModal} className="flex-1">
                Abbrechen
              </Button>
              <Button variant="primary" onClick={handleEditSave} disabled={saving} className="flex-1">
                {saving ? 'Speichert...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  <td>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      {user.notes && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={user.notes}>
                          📝 {user.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{user.school_name || '—'}</td>
                  <td>
                    <span className={`badge ${
                      user.status === 'active' ? 'badge-success' : 
                      user.status === 'pending' ? 'badge-warning' : 
                      'badge-danger'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.active_until ? new Date(user.active_until).toLocaleDateString() : '—'}</td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(user)}
                        title="User bearbeiten"
                      >
                        ✏️
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleStatusToggle(user)}
                        title={user.status === 'active' ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        {user.status === 'active' ? '🔒' : '✅'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleResetPassword(user)}
                        title="Passwort zurücksetzen"
                      >
                        🔑
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(user.id)}
                        title="User löschen"
                      >
                        🗑️
                      </Button>
                    </div>
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

        {/* Legend */}
        <div className="text-sm text-gray-500 flex flex-wrap gap-4">
          <span>✏️ = Bearbeiten</span>
          <span>✅/🔒 = Aktivieren/Deaktivieren</span>
          <span>🔑 = Passwort zurücksetzen</span>
          <span>🗑️ = Löschen</span>
        </div>
      </div>
    </div>
  );
}
