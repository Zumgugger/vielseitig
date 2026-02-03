import { useEffect, useState, useMemo } from 'react';
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

// Simple bar chart component (no external library needed)
function SimpleBarChart({ data, label, color = 'bg-blue-500' }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="flex items-end gap-1 h-32">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center group"
            title={`${d.label}: ${d.value}`}
          >
            <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value}
            </div>
            <div
              className={`w-full ${color} rounded-t transition-all hover:opacity-80`}
              style={{ height: `${Math.max((d.value / maxValue) * 100, 2)}%` }}
            />
            {i % Math.ceil(data.length / 7) === 0 && (
              <div className="text-xs text-gray-400 mt-1 truncate w-full text-center">
                {d.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Date range selector
function DateRangeSelector({ value, onChange }) {
  const options = [
    { label: '7 Tage', value: 7 },
    { label: '30 Tage', value: 30 },
    { label: '90 Tage', value: 90 },
    { label: '365 Tage', value: 365 },
  ];
  
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === opt.value
              ? 'bg-white shadow text-blue-600 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [timeseries, setTimeseries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState(30);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, sessionsRes, timeseriesRes] = await Promise.all([
        adminAPI.getAnalyticsSummary(),
        adminAPI.getAnalyticsSessions({ limit: 25 }),
        adminAPI.getAnalyticsTimeseries(dateRange),
      ]);
      setSummary(summaryRes.data);
      setSessions(sessionsRes.data || []);
      setTimeseries(timeseriesRes.data);
    } catch (err) {
      const message = err.response?.data?.detail || 'Konnte Analytics nicht laden';
      setError(message);
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Reload when date range changes
  const loadTimeseries = async () => {
    try {
      const res = await adminAPI.getAnalyticsTimeseries(dateRange);
      setTimeseries(res.data);
    } catch (err) {
      setToast({ message: 'Fehler beim Laden der Zeitreihe', type: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && timeseries) {
      loadTimeseries();
    }
  }, [dateRange]);

  // Transform timeseries data for charts
  const chartData = useMemo(() => {
    if (!timeseries?.data) return { sessions: [], completed: [], pdfs: [] };
    
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return `${d.getDate()}.${d.getMonth() + 1}`;
    };
    
    return {
      sessions: timeseries.data.map(d => ({ label: formatDate(d.date), value: d.sessions })),
      completed: timeseries.data.map(d => ({ label: formatDate(d.date), value: d.completed })),
      pdfs: timeseries.data.map(d => ({ label: formatDate(d.date), value: d.pdf_exports })),
    };
  }, [timeseries]);

  // Calculate completion rate
  const completionRate = useMemo(() => {
    if (!summary || summary.total_sessions === 0) return 0;
    return Math.round((summary.completed_sessions / summary.total_sessions) * 100);
  }, [summary]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Sessions gesamt" value={summary.total_sessions} />
            <StatCard label="Abgeschlossen" value={summary.completed_sessions} />
            <StatCard label="Abschlussrate" value={`${completionRate}%`} hint="abgeschlossen/gesamt" />
            <StatCard label="Ø Dauer (s)" value={summary.avg_duration_seconds} />
            <StatCard label="PDF Exporte" value={summary.total_pdf_exports} />
          </div>
        )}

        {/* Time Series Charts */}
        {timeseries && (
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold">Verlauf</h2>
              <DateRangeSelector value={dateRange} onChange={setDateRange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SimpleBarChart 
                data={chartData.sessions} 
                label="Sessions pro Tag" 
                color="bg-blue-500"
              />
              <SimpleBarChart 
                data={chartData.completed} 
                label="Abgeschlossen pro Tag" 
                color="bg-green-500"
              />
              <SimpleBarChart 
                data={chartData.pdfs} 
                label="PDF Exporte pro Tag" 
                color="bg-purple-500"
              />
            </div>
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
