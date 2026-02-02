import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Loading, Toast } from '../components';
import { authAPI, listsAPI } from '../api';

function Badge({ label, tone = 'info' }) {
  const tones = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`badge ${tones[tone] || tones.info}`}>{label}</span>
  );
}

export default function UserListsPage() {
  const [profile, setProfile] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    share_with_school: false,
  });
  const [qrLoadingId, setQrLoadingId] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, listsRes] = await Promise.all([
          authAPI.userProfile(),
          listsAPI.getUserLists(),
        ]);
        setProfile(profileRes.data);
        setLists(listsRes.data || []);
      } catch (err) {
        const message = err.response?.data?.detail || 'Listen konnten nicht geladen werden';
        setError(message);
        setToast({ message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const orderedLists = useMemo(() => {
    const standard = lists.filter((l) => l.is_default);
    const premium = lists.filter((l) => l.is_premium);
    const own = lists.filter((l) => !l.is_default && !l.is_premium && l.owner_email === profile?.email);
    const shared = lists.filter((l) => !l.is_default && !l.is_premium && l.owner_email !== profile?.email);
    return [...standard, ...premium, ...own, ...shared];
  }, [lists, profile?.email]);

  const handleCreateList = async (event) => {
    event.preventDefault();
    if (!newList.name.trim()) {
      setToast({ message: 'Listenname ist erforderlich', type: 'error' });
      return;
    }

    setCreating(true);
    try {
      const response = await listsAPI.createList({
        name: newList.name.trim(),
        description: newList.description || null,
        share_with_school: newList.share_with_school,
      });
      setLists((prev) => [
        {
          ...response.data,
          owner_email: profile?.email || '',
          adjective_count: response.data.adjectives?.length || 0,
        },
        ...prev,
      ]);
      setNewList({ name: '', description: '', share_with_school: false });
      setShowCreate(false);
      setToast({ message: 'Liste erstellt', type: 'success' });
    } catch (err) {
      const message = err.response?.data?.detail || 'Liste konnte nicht erstellt werden';
      setToast({ message, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const copyShareLink = async (token) => {
    if (!token) return;
    const shareUrl = `${window.location.origin}/l/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast({ message: 'Share-Link kopiert', type: 'success' });
    } catch (err) {
      setToast({ message: 'Konnte Link nicht kopieren', type: 'error' });
    }
  };

  const handleShowQr = async (list) => {
    if (!list?.id) return;
    setQrLoadingId(list.id);
    try {
      const response = await listsAPI.getListQRCode(list.id);
      const blobUrl = URL.createObjectURL(new Blob([response.data], { type: 'image/png' }));

      if (qrPreview?.url) {
        URL.revokeObjectURL(qrPreview.url);
      }

      setQrPreview({
        url: blobUrl,
        name: list.name,
        shareUrl: list.share_token ? `${window.location.origin}/l/${list.share_token}` : '',
      });
    } catch (err) {
      const message = err.response?.data?.detail || 'QR-Code konnte nicht geladen werden';
      setToast({ message, type: 'error' });
    } finally {
      setQrLoadingId(null);
    }
  };

  const handleCloseQr = () => {
    if (qrPreview?.url) URL.revokeObjectURL(qrPreview.url);
    setQrPreview(null);
  };

  const handleDownloadQrFromPreview = () => {
    if (!qrPreview?.url) return;
    const link = document.createElement('a');
    link.href = qrPreview.url;
    link.download = `${qrPreview.name || 'list'}_qr.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    return () => {
      if (qrPreview?.url) {
        URL.revokeObjectURL(qrPreview.url);
      }
    };
  }, [qrPreview]);

  if (loading) return <Loading fullscreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-3">Listen konnten nicht geladen werden</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>Erneut versuchen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Listenverwaltung</p>
            <h1 className="text-3xl font-bold text-gray-900">Deine Listen</h1>
            <p className="text-gray-600 mt-1">Standardliste, eigene Listen und schul-geteilte Listen auf einen Blick.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowCreate((prev) => !prev)}>
              {showCreate ? 'Schliessen' : 'Neue Liste'}
            </Button>
            <Link to="/user/profile" className="btn btn-outline hidden sm:inline-flex items-center">
              Profil
            </Link>
          </div>
        </div>

        {showCreate && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Neue Liste erstellen</h2>
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleCreateList}>
              <Input
                label="Name"
                placeholder="z. B. Teamwork"
                value={newList.name}
                onChange={(e) => setNewList((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <div className="md:col-span-2">
                <label className="form-label">Beschreibung (optional)</label>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Kurze Beschreibung"
                  value={newList.description}
                  onChange={(e) => setNewList((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newList.share_with_school}
                  onChange={(e) => setNewList((prev) => ({ ...prev, share_with_school: e.target.checked }))}
                />
                Mit Schule teilen (alle Lehrkräfte)
              </label>
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>
                  Abbrechen
                </Button>
                <Button variant="primary" type="submit" disabled={creating}>
                  {creating ? 'Speichert...' : 'Erstellen'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Typ</th>
                  <th>Adjektive</th>
                  <th>Teilen</th>
                  <th>Erstellt</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {orderedLists.map((list) => {
                  const isOwn = profile?.email && list.owner_email === profile.email;
                  const typeLabel = list.is_default
                    ? 'Standard'
                    : list.is_premium
                    ? 'Premium'
                    : isOwn
                    ? 'Eigen'
                    : 'Schule';
                  const typeTone = list.is_default
                    ? 'neutral'
                    : list.is_premium
                    ? 'warning'
                    : isOwn
                    ? 'success'
                    : 'info';

                  return (
                    <tr key={list.id}>
                      <td className="whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{list.name}</div>
                        {list.description && (
                          <div className="text-sm text-gray-600 truncate max-w-xs">{list.description}</div>
                        )}
                      </td>
                      <td>
                        <Badge label={typeLabel} tone={typeTone} />
                      </td>
                      <td>{list.adjective_count ?? list.adjectives?.length ?? 0}</td>
                      <td className="space-y-1">
                        {list.share_with_school && <Badge label="Schule" tone="info" />}
                        {list.share_token && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyShareLink(list.share_token)}
                          >
                            Link kopieren
                          </Button>
                        )}
                        {!list.share_token && <span className="text-sm text-gray-500">kein Link</span>}
                      </td>
                      <td className="text-sm text-gray-600">
                        {list.created_at ? new Date(list.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="space-x-2 whitespace-nowrap">
                        <Link to={`/user/lists/${list.id}`} className="btn btn-primary btn-sm">
                          Öffnen
                        </Link>
                        {list.share_token && (
                          <a
                            href={`/l/${list.share_token}`}
                            className="btn btn-outline btn-sm"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Teilen
                          </a>
                        )}
                        {(isOwn || list.is_premium) && list.share_token && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowQr(list)}
                            disabled={qrLoadingId === list.id}
                          >
                            {qrLoadingId === list.id ? 'QR...' : 'QR-Code'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {orderedLists.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      Noch keine Listen. Erstelle die erste eigene Liste.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {qrPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="card w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">QR-Code für {qrPreview.name}</h3>
                <button type="button" className="text-gray-500 hover:text-gray-700" onClick={handleCloseQr}>
                  ✕
                </button>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded shadow-sm">
                  <img
                    src={qrPreview.url}
                    alt={`QR-Code für ${qrPreview.name}`}
                    className="w-64 h-64 object-contain"
                  />
                </div>
                {qrPreview.shareUrl && (
                  <div className="text-xs text-gray-700 break-all text-center">{qrPreview.shareUrl}</div>
                )}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="primary" onClick={handleDownloadQrFromPreview}>Download</Button>
                  <Button variant="ghost" onClick={handleCloseQr}>Schliessen</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
