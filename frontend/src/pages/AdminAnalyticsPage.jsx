import { useEffect, useState } from 'react';
import { Button, Loading, Toast } from '../components';
import { adminAPI } from '../api';

function StatCard({ label, value, hint }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-bold text-blue-600">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, sessionsRes] = await Promise.all([
        adminAPI.getAnalyticsSummary(),
        adminAPI.getAnalyticsSessions({ limit: 25 }),
      ]);
      setSummary(summaryRes.data);
      setSessions(sessionsRes.data || []);
    } catch (err) {
      const message = err.response?.data?.detail || 'Konnte Analytics nicht laden';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600">Admin • Analytics</p>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Übersicht der Sessions, PDF-Exports und beliebtesten Adjektive.</p>
          </div>
          <Button variant="secondary" onClick={loadData}>Aktualisieren</Button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Sessions gesamt" value={summary.total_sessions} />
            <StatCard label="Abgeschlossen" value={summary.completed_sessions} />
            <StatCard label="Ø Dauer (s)" value={summary.avg_duration_seconds} />
            <StatCard label="PDF Exporte" value={summary.total_pdf_exports} />
          </div>
        )}

        {summary?.top_adjectives?.length ? (
          <div className="card">
            <h2 className="text-xl font-semibold mb-3">Top Adjektive</h2>
            <div className="overflow-x-auto">
              <table className="table min-w-full">
                <thead>
                  <tr>
                    <th>Wort</th>
                    <th>Anzahl</th>
                    <th>Anteil</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.top_adjectives.map((adj) => (
                    <tr key={adj.adjective_id}>
                      <td>{adj.word}</td>
                      <td>{adj.count}</td>
                      <td>{adj.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {summary?.theme_distribution?.length ? (
          <div className="card">
            <h2 className="text-xl font-semibold mb-3">Theme-Verteilung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summary.theme_distribution.map((theme) => (
                <div key={theme.theme_id} className="card-minimal flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Theme {theme.theme_id || 'default'}</p>
                    <p className="text-lg font-semibold">{theme.session_count} Sessions</p>
                  </div>
                  <span className="badge badge-info">{theme.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="card overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Letzte Sessions</h2>
            <span className="text-sm text-gray-500">Max. 25</span>
          </div>
          <table className="table min-w-full">
            <thead>
              <tr>
                <th>Session</th>
                <th>Liste</th>
                <th>Standard?</th>
                <th>Gestartet</th>
                <th>Beendet</th>
                <th>Dauer (s)</th>
                <th>Assignments</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="font-mono text-sm">{session.id}</td>
                  <td>{session.list_id ?? '—'}</td>
                  <td>{session.is_standard_list ? 'Ja' : 'Nein'}</td>
                  <td>{session.started_at ? new Date(session.started_at).toLocaleString() : '—'}</td>
                  <td>{session.finished_at ? new Date(session.finished_at).toLocaleString() : '—'}</td>
                  <td>{session.duration_seconds ?? '—'}</td>
                  <td>{session.assignment_count}</td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">Keine Sessions vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
