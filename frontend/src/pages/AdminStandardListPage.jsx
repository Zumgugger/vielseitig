import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Loading, Toast } from '../components';
import { adminAPI } from '../api';

export default function AdminStandardListPage() {
  const [list, setList] = useState(null);
  const [adjectives, setAdjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const saveTimer = useRef(null);

  const loadStandardList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getStandardList();
      setList(res.data);
      setAdjectives(res.data.adjectives || []);
    } catch (err) {
      const message = err.response?.data?.detail || 'Standardliste konnte nicht geladen werden';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandardList();
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handleStartEdit = (adj) => {
    setEditingId(adj.id);
    setEditDraft({
      word: adj.word,
      explanation: adj.explanation,
      example: adj.example,
      order_index: adj.order_index,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const handleSaveEdit = async (adjId) => {
    try {
      const res = await adminAPI.updateStandardAdjective(adjId, editDraft);
      setAdjectives((prev) => prev.map((adj) => (adj.id === adjId ? res.data : adj)));
      setToast({ message: 'Adjektiv gespeichert', type: 'success' });
      setEditingId(null);
      setEditDraft({});
    } catch (err) {
      const message = err.response?.data?.detail || 'Speichern fehlgeschlagen';
      setToast({ message, type: 'error' });
    }
  };

  const handleDelete = async (adjId) => {
    if (!window.confirm('Adjektiv wirklich aus der Standardliste löschen?')) return;
    try {
      await adminAPI.deleteStandardAdjective(adjId);
      setAdjectives((prev) => prev.filter((adj) => adj.id !== adjId));
      setToast({ message: 'Adjektiv gelöscht', type: 'success' });
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
          <Button variant="primary" onClick={loadStandardList}>Erneut laden</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Admin • Standardliste</p>
            <h1 className="text-3xl font-bold text-gray-900">{list?.name || 'Standardliste'}</h1>
            <p className="text-gray-600">{list?.description || 'Die öffentliche Standardliste mit 30 Adjektiven.'}</p>
          </div>
          <Link to="/admin/analytics" className="btn btn-outline">
            ← Zurück
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Adjektive ({adjectives.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="table min-w-full">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Adjektiv</th>
                  <th>Erklärung</th>
                  <th>Beispiel</th>
                  <th className="w-32">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {adjectives.map((adj, idx) => (
                  <tr key={adj.id}>
                    {editingId === adj.id ? (
                      <>
                        <td className="text-gray-500">{idx + 1}</td>
                        <td>
                          <Input
                            value={editDraft.word}
                            onChange={(e) => setEditDraft((d) => ({ ...d, word: e.target.value }))}
                            className="text-sm"
                          />
                        </td>
                        <td>
                          <Input
                            value={editDraft.explanation}
                            onChange={(e) => setEditDraft((d) => ({ ...d, explanation: e.target.value }))}
                            className="text-sm"
                          />
                        </td>
                        <td>
                          <Input
                            value={editDraft.example}
                            onChange={(e) => setEditDraft((d) => ({ ...d, example: e.target.value }))}
                            className="text-sm"
                          />
                        </td>
                        <td className="space-x-1 whitespace-nowrap">
                          <Button variant="primary" size="sm" onClick={() => handleSaveEdit(adj.id)}>
                            ✓
                          </Button>
                          <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                            ✕
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-gray-500">{idx + 1}</td>
                        <td className="font-medium">{adj.word}</td>
                        <td className="text-gray-600 text-sm">{adj.explanation}</td>
                        <td className="text-gray-600 text-sm italic">{adj.example}</td>
                        <td className="space-x-1 whitespace-nowrap">
                          <Button variant="secondary" size="sm" onClick={() => handleStartEdit(adj)}>
                            ✎
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(adj.id)}>
                            🗑
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {adjectives.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      Keine Adjektive in der Standardliste.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Hinweis</h3>
          <p className="text-yellow-700 text-sm">
            Änderungen an der Standardliste wirken sich sofort auf alle neuen Schüler:innen-Sessions aus, 
            die ohne Share-Link gestartet werden. Bestehende Sessions sind nicht betroffen.
          </p>
        </div>
      </div>
    </div>
  );
}
