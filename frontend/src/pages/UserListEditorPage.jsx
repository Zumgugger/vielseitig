import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Loading, Toast } from '../components';
import { authAPI, listsAPI } from '../api';

export default function UserListEditorPage() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [list, setList] = useState(null);
  const [listDraft, setListDraft] = useState(null);
  const [adjectives, setAdjectives] = useState([]);
  const [newAdjective, setNewAdjective] = useState({ word: '', explanation: '', example: '' });
  const [loading, setLoading] = useState(true);
  const [forking, setForking] = useState(false);
  const [toast, setToast] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const isFirstDraftUpdate = useRef(true);
  const saveTimer = useRef(null);

  const canEdit = useMemo(() => {
    if (!profile || !list) return false;
    if (list.is_default) return false;
    if (list.is_premium) return false;
    return list.owner_user_id === profile.id;
  }, [list, profile]);

  // Show fork button for school-shared/premium lists user doesn't own
  const showForkButton = useMemo(() => {
    if (!profile || !list) return false;
    if (list.is_default) return true; // Can fork standard list
    if (list.is_premium) return true; // Can fork premium lists
    if (list.share_with_school && list.owner_user_id !== profile.id) return true;
    return false;
  }, [list, profile]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, listRes] = await Promise.all([
          authAPI.userProfile(),
          listsAPI.getList(listId),
        ]);
        setProfile(profileRes.data);
        setList(listRes.data);
        setAdjectives(listRes.data.adjectives || []);
        setListDraft({
          name: listRes.data.name || '',
          description: listRes.data.description || '',
          share_with_school: !!listRes.data.share_with_school,
        });
        isFirstDraftUpdate.current = true;
      } catch (err) {
        const message = err.response?.data?.detail || 'Liste konnte nicht geladen werden';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [listId]);

  useEffect(() => {
    return () => {
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }
    };
  }, [qrUrl, listId]);

  useEffect(() => {
    if (!listDraft || !canEdit) return;
    if (isFirstDraftUpdate.current) {
      isFirstDraftUpdate.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        const response = await listsAPI.updateList(Number(listId), {
          name: listDraft.name,
          description: listDraft.description,
          share_with_school: listDraft.share_with_school,
        });
        setList(response.data);
        setSaveState('saved');
      } catch (err) {
        const message = err.response?.data?.detail || 'Speichern fehlgeschlagen';
        setToast({ message, type: 'error' });
        setSaveState('error');
      }
    }, 600);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [listDraft, canEdit, listId]);

  const shareUrl = list?.share_token ? `${window.location.origin}/l/${list.share_token}` : null;

  const handleCopyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast({ message: 'Share-Link kopiert', type: 'success' });
    } catch (err) {
      setToast({ message: 'Konnte Link nicht kopieren', type: 'error' });
    }
  };

  const fetchQrCode = async () => {
    if (!list) return null;
    setQrLoading(true);
    try {
      const response = await listsAPI.getListQRCode(list.id);
      const blobUrl = URL.createObjectURL(new Blob([response.data], { type: 'image/png' }));
      if (qrUrl) {
        URL.revokeObjectURL(qrUrl);
      }
      setQrUrl(blobUrl);
      return blobUrl;
    } catch (err) {
      const message = err.response?.data?.detail || 'QR-Code konnte nicht geladen werden';
      setToast({ message, type: 'error' });
      return null;
    } finally {
      setQrLoading(false);
    }
  };

  const handlePreviewQr = async () => {
    if (qrUrl) return;
    await fetchQrCode();
  };

  const handleDownloadQr = async () => {
    if (!list) return;
    const url = qrUrl || (await fetchQrCode());
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `list_${list.id}_qr.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleUpdateAdjective = async (adjective) => {
    if (!canEdit) return;
    try {
      const response = await listsAPI.updateAdjective(list.id, adjective.id, {
        word: adjective.word,
        explanation: adjective.explanation,
        example: adjective.example,
        order_index: adjective.order_index,
      });
      setAdjectives((prev) => prev.map((adj) => (adj.id === adjective.id ? response.data : adj)));
      setToast({ message: 'Adjektiv gespeichert', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Adjektiv konnte nicht gespeichert werden';
      setToast({ message, type: 'error' });
    }
  };

  const handleDeleteAdjective = async (adjectiveId) => {
    if (!canEdit) return;
    try {
      await listsAPI.deleteAdjective(list.id, adjectiveId);
      setAdjectives((prev) => prev.filter((adj) => adj.id !== adjectiveId));
      setToast({ message: 'Adjektiv gelöscht', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Adjektiv konnte nicht gelöscht werden';
      setToast({ message, type: 'error' });
    }
  };

  const handleForkList = async () => {
    if (!list) return;
    setForking(true);
    try {
      const response = await listsAPI.forkList(list.id);
      setToast({ message: response.data.message || 'Liste kopiert!', type: 'success' });
      // Navigate to the newly forked list
      navigate(`/user/lists/${response.data.id}`);
    } catch (err) {
      const message = err.response?.data?.detail || 'Liste konnte nicht kopiert werden';
      setToast({ message, type: 'error' });
      setForking(false);
    }
  };

  const handleAddAdjective = async (event) => {
    event.preventDefault();
    if (!canEdit) return;
    if (!newAdjective.word.trim()) {
      setToast({ message: 'Wort ist erforderlich', type: 'error' });
      return;
    }

    try {
      const response = await listsAPI.createAdjective(list.id, {
        word: newAdjective.word.trim(),
        explanation: newAdjective.explanation,
        example: newAdjective.example,
      });
      setAdjectives((prev) => [...prev, response.data]);
      setNewAdjective({ word: '', explanation: '', example: '' });
      setToast({ message: 'Adjektiv hinzugefügt', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Adjektiv konnte nicht hinzugefügt werden';
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
          <Link to="/user/lists" className="btn btn-primary">Zurück zur Übersicht</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Listen-Editor</p>
            <h1 className="text-3xl font-bold text-gray-900">{list?.name}</h1>
            {list?.is_default && (
              <p className="text-sm text-gray-600 mt-1">Standardliste ist nur lesbar. Erstelle eine Kopie zum Bearbeiten.</p>
            )}
            {list?.is_premium && (
              <p className="text-sm text-gray-600 mt-1">Premium-Liste ist nur lesbar. Erstelle eine Kopie zum Bearbeiten.</p>
            )}
            {!canEdit && !list?.is_default && !list?.is_premium && list?.share_with_school && (
              <p className="text-sm text-gray-600 mt-1">Diese Liste gehört einer anderen Lehrkraft. Erstelle eine Kopie zum Bearbeiten.</p>
            )}
          </div>
          <div className="flex gap-2">
            {showForkButton && (
              <Button variant="primary" onClick={handleForkList} disabled={forking}>
                {forking ? '⏳ Kopiere...' : '📋 Als Kopie bearbeiten'}
              </Button>
            )}
            <Link to="/user/lists" className="btn btn-outline">Zurück</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={listDraft?.name || ''}
                onChange={(e) => setListDraft((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!canEdit}
              />
              <div>
                <label className="form-label">Teilen mit Schule</label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!listDraft?.share_with_school}
                    onChange={(e) => setListDraft((prev) => ({ ...prev, share_with_school: e.target.checked }))}
                    disabled={!canEdit}
                  />
                  Alle Lehrkräfte dieser Schule
                </label>
              </div>
            </div>
            <div>
              <label className="form-label">Beschreibung</label>
              <textarea
                rows={3}
                className="form-input"
                value={listDraft?.description || ''}
                onChange={(e) => setListDraft((prev) => ({ ...prev, description: e.target.value }))}
                disabled={!canEdit}
              />
            </div>
            <div className="text-sm text-gray-600">
              {canEdit ? (
                <>
                  {saveState === 'saving' && 'Speichert...'}
                  {saveState === 'saved' && 'Gespeichert'}
                  {saveState === 'error' && 'Konnte nicht speichern'}
                  {saveState === 'idle' && 'Automatisches Speichern aktiv'}
                </>
              ) : (
                'Lesemodus (Standardliste oder geteilte Liste)'
              )}
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="text-lg font-semibold">Share-Einstellungen</h2>
            {shareUrl ? (
              <>
                <div className="text-sm text-gray-700 break-words">{shareUrl}</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={handleCopyShare}>Link kopieren</Button>
                  <a href={shareUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                    Vorschau
                  </a>
                  <Button variant="secondary" onClick={handlePreviewQr} disabled={!canEdit || qrLoading}>
                    {qrLoading ? 'Lädt...' : 'QR anzeigen'}
                  </Button>
                  <Button variant="ghost" onClick={handleDownloadQr} disabled={!canEdit || qrLoading}>
                    {qrLoading ? 'Bitte warten' : 'Download'}
                  </Button>
                </div>
                {qrUrl && (
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <img src={qrUrl} alt={`QR-Code für ${list.name}`} className="w-56 h-56 object-contain" />
                    </div>
                    <div className="flex gap-2">
                      <a href={qrUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                        In neuem Tab öffnen
                      </a>
                      <Button variant="ghost" size="sm" onClick={handleDownloadQr}>
                        Speichern
                      </Button>
                    </div>
                  </div>
                )}
                {list?.share_expires_at && (
                  <p className="text-xs text-gray-600">
                    Gültig bis {new Date(list.share_expires_at).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">Kein Share-Link verfügbar.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Adjektive</h2>
            {canEdit && (
              <span className="text-sm text-gray-600">Inline-Änderungen mit Speichern pro Zeile</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Wort</th>
                  <th>Erklärung</th>
                  <th>Beispiel</th>
                  <th>Reihenfolge</th>
                  {canEdit && <th>Aktionen</th>}
                </tr>
              </thead>
              <tbody>
                {adjectives.map((adj) => (
                  <tr key={adj.id}>
                    <td className="min-w-[160px]">
                      <input
                        type="text"
                        value={adj.word}
                        onChange={(e) => setAdjectives((prev) => prev.map((a) => (a.id === adj.id ? { ...a, word: e.target.value } : a)))}
                        disabled={!canEdit}
                      />
                    </td>
                    <td className="min-w-[220px]">
                      <textarea
                        rows={2}
                        value={adj.explanation || ''}
                        onChange={(e) => setAdjectives((prev) => prev.map((a) => (a.id === adj.id ? { ...a, explanation: e.target.value } : a)))}
                        disabled={!canEdit}
                        className="form-input"
                      />
                    </td>
                    <td className="min-w-[220px]">
                      <textarea
                        rows={2}
                        value={adj.example || ''}
                        onChange={(e) => setAdjectives((prev) => prev.map((a) => (a.id === adj.id ? { ...a, example: e.target.value } : a)))}
                        disabled={!canEdit}
                        className="form-input"
                      />
                    </td>
                    <td className="w-28">
                      <input
                        type="number"
                        value={adj.order_index}
                        onChange={(e) => setAdjectives((prev) => prev.map((a) => (a.id === adj.id ? { ...a, order_index: Number(e.target.value) } : a)))}
                        disabled={!canEdit}
                      />
                    </td>
                    {canEdit && (
                      <td className="space-x-2 whitespace-nowrap">
                        <Button variant="secondary" size="sm" onClick={() => handleUpdateAdjective(adj)}>
                          Speichern
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteAdjective(adj.id)}>
                          Löschen
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}

                {adjectives.length === 0 && (
                  <tr>
                    <td colSpan={canEdit ? 5 : 4} className="text-center py-6 text-gray-500">
                      Noch keine Adjektive vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {canEdit && (
            <form className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleAddAdjective}>
              <Input
                label="Wort"
                value={newAdjective.word}
                onChange={(e) => setNewAdjective((prev) => ({ ...prev, word: e.target.value }))}
                required
              />
              <div className="md:col-span-2">
                <label className="form-label">Erklärung</label>
                <textarea
                  rows={2}
                  className="form-input"
                  value={newAdjective.explanation}
                  onChange={(e) => setNewAdjective((prev) => ({ ...prev, explanation: e.target.value }))}
                />
              </div>
              <Input
                label="Beispiel"
                value={newAdjective.example}
                onChange={(e) => setNewAdjective((prev) => ({ ...prev, example: e.target.value }))}
              />
              <div className="md:col-span-4 flex justify-end">
                <Button variant="primary" type="submit">Adjektiv hinzufügen</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
